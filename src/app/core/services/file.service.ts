import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { FileItem, FileListResponse, FileStatistics, FileVisibility, PreviewFile } from '../models/file.model';
import { FolderItem, FolderTreeNode } from '../models/folder.model';
import { FileShare, SharedWithMeItem, SharePermission } from '../models/share.model';
import { PublicFileInfo, ShareLink } from '../models/share-link.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  // Global search & filter signals
  searchQuery = signal<string>('');
  activeCategory = signal<string>('All');
  isLoading = signal<boolean>(false);

  // Global modal control signals
  isUploadModalOpen = signal<boolean>(false);
  isShareModalOpen = signal<boolean>(false);
  activeShareFile = signal<FileItem | null>(null);

  isVisibilityModalOpen = signal<boolean>(false);
  activeVisibilityFile = signal<FileItem | null>(null);

  isFileDetailsModalOpen = signal<boolean>(false);
  activeDetailsFile = signal<FileItem | null>(null);

  isPreviewModalOpen = signal<boolean>(false);
  activePreviewFile = signal<PreviewFile | null>(null);

  isCreateFolderModalOpen = signal<boolean>(false);

  // Trigger file list refresh across views
  refreshTrigger = signal<number>(0);

  // Folder signals
  folders = signal<FolderItem[]>([]);
  allFolders = signal<FolderItem[]>([]);
  currentFolder = signal<FolderItem | null>(null);
  folderBreadcrumbs = signal<{ id: number | null; name: string }[]>([{ id: null, name: 'My Files' }]);

  folderTree = computed<FolderTreeNode[]>(() => {
    const list = this.allFolders();
    const map = new Map<number, FolderTreeNode>();
    const roots: FolderTreeNode[] = [];

    list.forEach((f) => {
      map.set(f.id, { ...f, children: [] });
    });

    list.forEach((f) => {
      const node = map.get(f.id)!;
      if (f.parentId && map.has(f.parentId)) {
        map.get(f.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  });

  formattedFolderList = computed<{ id: number; path: string; name: string; level: number }[]>(() => {
    const list = this.allFolders();
    const map = new Map<number, FolderItem>();
    list.forEach((f) => map.set(f.id, f));

    const getPath = (f: FolderItem): string => {
      const parts = [f.name];
      let cur: FolderItem = f;
      while (cur.parentId && map.has(cur.parentId)) {
        cur = map.get(cur.parentId)!;
        parts.unshift(cur.name);
      }
      return parts.join(' / ');
    };

    const getLevel = (f: FolderItem): number => {
      let lvl = 0;
      let cur: FolderItem = f;
      while (cur.parentId && map.has(cur.parentId)) {
        cur = map.get(cur.parentId)!;
        lvl++;
      }
      return lvl;
    };

    return list
      .map((f) => ({
        id: f.id,
        name: f.name,
        path: getPath(f),
        level: getLevel(f),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  });

  // Data signals
  files = signal<FileItem[]>([]);
  statistics = signal<FileStatistics>({
    totalFiles: 0,
    totalStorageBytes: 0,
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
  });
  sharedWithMeList = signal<SharedWithMeItem[]>([]);
  sharedByMeList = signal<FileItem[]>([]);

  constructor() {
    // Automatically load data when user is authenticated
    if (this.auth.isAuthenticated()) {
      this.refreshAll();
    }
  }

  triggerRefresh() {
    this.refreshTrigger.update((n) => n + 1);
    this.refreshAll();
  }

  refreshAll() {
    const currentFolderId = this.currentFolder()?.id || null;
    this.fetchFiles(undefined, undefined, 1, 100, currentFolderId || 'root');
    this.fetchSharedWithMe();
    this.fetchSharedByMe();
    this.fetchFolders(currentFolderId);
    this.fetchAllFolders();
  }

  filteredFiles = computed<FileItem[]>(() => {
    let list = this.files();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter((f) => f.originalName.toLowerCase().includes(q));
    }
    return list;
  });

  // Modal triggers
  openUploadModal() {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
  }

  openCreateFolderModal() {
    this.isCreateFolderModalOpen.set(true);
  }

  closeCreateFolderModal() {
    this.isCreateFolderModalOpen.set(false);
  }

  openShareModal(file: FileItem) {
    this.activeShareFile.set(file);
    this.isShareModalOpen.set(true);
  }

  closeShareModal() {
    this.isShareModalOpen.set(false);
    this.activeShareFile.set(null);
  }

  openVisibilityModal(file: FileItem) {
    this.activeVisibilityFile.set(file);
    this.isVisibilityModalOpen.set(true);
  }

  closeVisibilityModal() {
    this.isVisibilityModalOpen.set(false);
    this.activeVisibilityFile.set(null);
  }

  openFileDetailsModal(file: FileItem) {
    this.activeDetailsFile.set(file);
    this.isFileDetailsModalOpen.set(true);
  }

  closeFileDetailsModal() {
    this.isFileDetailsModalOpen.set(false);
    this.activeDetailsFile.set(null);
  }

  openPreviewModal(file: PreviewFile) {
    this.activePreviewFile.set(file);
    this.isPreviewModalOpen.set(true);
  }

  closePreviewModal() {
    this.isPreviewModalOpen.set(false);
    this.activePreviewFile.set(null);
  }

  async getPreviewBlob(fileId: number): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http.get(`${environment.apiUrl}/files/${fileId}/preview`, {
          responseType: 'blob',
        })
      );
    } catch {
      return await firstValueFrom(
        this.http.get(`${environment.apiUrl}/files/${fileId}/download`, {
          responseType: 'blob',
        })
      );
    }
  }

  async getPublicPreviewBlob(token: string): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http.get(`${environment.apiUrl}/public/files/${token}/preview`, {
          responseType: 'blob',
        })
      );
    } catch {
      return await firstValueFrom(
        this.http.get(`${environment.apiUrl}/public/files/${token}/download`, {
          responseType: 'blob',
        })
      );
    }
  }

  // Core File Operations via Backend API
  async fetchFiles(search?: string, visibility?: FileVisibility, page = 1, limit = 50, folderId?: number | null | string): Promise<void> {
    this.isLoading.set(true);
    try {
      let url = `${environment.apiUrl}/files?page=${page}&limit=${limit}`;
      const s = search ?? this.searchQuery();
      if (s) url += `&search=${encodeURIComponent(s)}`;
      if (visibility) url += `&visibility=${visibility}`;
      if (folderId !== undefined && folderId !== null && folderId !== '') {
        url += `&folderId=${folderId}`;
      }

      const res = await firstValueFrom(
        this.http.get<{ data: FileListResponse }>(url)
      );

      if (res?.data) {
        this.files.set(res.data.items || []);
        if (res.data.statistics) {
          this.statistics.set({
            totalFiles: res.data.statistics.totalFiles || 0,
            totalStorageBytes: res.data.statistics.totalStorageBytes || 0,
            maxStorageBytes: 50 * 1024 * 1024 * 1024,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch files from API', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Folder Operations
  async fetchFolders(parentId?: number | null): Promise<FolderItem[]> {
    try {
      let url = `${environment.apiUrl}/folders`;
      if (parentId !== undefined) {
        url += `?parentId=${parentId === null ? 'null' : parentId}`;
      }
      const res = await firstValueFrom(
        this.http.get<{ data: FolderItem[] }>(url)
      );
      const list = res?.data || [];
      this.folders.set(list);
      return list;
    } catch (err: any) {
      console.error('Failed to fetch folders from API', err);
      return [];
    }
  }

  async fetchAllFolders(): Promise<FolderItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: FolderItem[] }>(`${environment.apiUrl}/folders`)
      );
      const list = res?.data || [];
      this.allFolders.set(list);
      return list;
    } catch (err: any) {
      console.error('Failed to fetch all folders from API', err);
      return [];
    }
  }

  async createFolder(name: string, parentId?: number | null): Promise<FolderItem> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ data: FolderItem }>(`${environment.apiUrl}/folders`, {
          name: name.trim(),
          parentId: parentId || undefined,
        })
      );
      this.toast.success(`Created folder "${name}"!`);
      await this.fetchFolders(this.currentFolder()?.id || null);
      await this.fetchAllFolders();
      return res.data;
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to create folder';
      this.toast.error(msg);
      throw err;
    }
  }

  async updateFolder(id: number, name: string): Promise<FolderItem> {
    try {
      const res = await firstValueFrom(
        this.http.patch<{ data: FolderItem }>(`${environment.apiUrl}/folders/${id}`, {
          name: name.trim(),
        })
      );
      this.toast.success(`Renamed folder to "${name}"!`);
      await this.fetchFolders(this.currentFolder()?.id || null);
      await this.fetchAllFolders();
      return res.data;
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to rename folder';
      this.toast.error(msg);
      throw err;
    }
  }

  async deleteFolder(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/folders/${id}`)
      );
      this.toast.success('Folder deleted successfully');
      await this.fetchFolders(this.currentFolder()?.id || null);
      await this.fetchAllFolders();
      this.triggerRefresh();
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to delete folder';
      this.toast.error(msg);
      throw err;
    }
  }

  computeBreadcrumbs(folderId: number): { id: number | null; name: string }[] {
    const map = new Map<number, FolderItem>();
    this.allFolders().forEach((f) => map.set(f.id, f));

    const chain: { id: number; name: string }[] = [];
    let curId: number | null = folderId;
    const visited = new Set<number>();

    while (curId && map.has(curId) && !visited.has(curId)) {
      visited.add(curId);
      const curFolder: FolderItem = map.get(curId)!;
      chain.unshift({ id: curFolder.id, name: curFolder.name });
      curId = curFolder.parentId;
    }

    return [{ id: null, name: 'My Files' }, ...chain];
  }

  async navigateToFolder(folder: FolderItem | null): Promise<void> {
    this.currentFolder.set(folder);
    if (!folder) {
      this.folderBreadcrumbs.set([{ id: null, name: 'My Files' }]);
      await this.fetchFolders(null);
      await this.fetchFiles(undefined, undefined, 1, 100, 'root');
    } else {
      // Fetch full recursive breadcrumbs from backend or fallback to computed
      let crumbs = this.computeBreadcrumbs(folder.id);
      this.folderBreadcrumbs.set(crumbs);

      try {
        const details = await firstValueFrom(
          this.http.get<{ data: FolderItem }>(`${environment.apiUrl}/folders/${folder.id}`)
        );
        if (details?.data?.breadcrumbs && details.data.breadcrumbs.length > 0) {
          crumbs = [{ id: null, name: 'My Files' }, ...details.data.breadcrumbs];
          this.folderBreadcrumbs.set(crumbs);
        }
      } catch (err) {
        // computeBreadcrumbs was already set
      }

      await this.fetchFolders(folder.id);
      await this.fetchFiles(undefined, undefined, 1, 100, folder.id);
    }
  }

  async moveFileToFolder(fileId: number, folderId: number | null): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/files/${fileId}/folder`, { folderId })
      );
      this.toast.success('File moved successfully');
      this.triggerRefresh();
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to move file';
      this.toast.error(msg);
      throw err;
    }
  }

  async fetchSharedWithMe(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: any[] }>(`${environment.apiUrl}/files/shared-with-me`)
      );
      if (res?.data) {
        const mapped: SharedWithMeItem[] = res.data.map((item) => ({
          shareId: item.id || item.shareId,
          permission: item.permission,
          sharedAt: item.createdAt || new Date().toISOString(),
          file: item.file || item,
        }));
        this.sharedWithMeList.set(mapped);
      }
    } catch (err: any) {
      console.error('Failed to fetch shared-with-me files', err);
    }
  }

  async fetchSharedByMe(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: FileItem[] }>(`${environment.apiUrl}/files/shared-by-me`)
      );
      if (res?.data) {
        this.sharedByMeList.set(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch shared-by-me files', err);
    }
  }

  async uploadFile(file: File, visibility: FileVisibility = 'PRIVATE', folderId?: number | null): Promise<FileItem> {
    this.isLoading.set(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', visibility);
      if (folderId !== undefined && folderId !== null) {
        formData.append('folderId', folderId.toString());
      }

      const res = await firstValueFrom(
        this.http.post<{ data: FileItem }>(`${environment.apiUrl}/files/upload`, formData)
      );

      const created = res.data;
      this.triggerRefresh();
      this.toast.success(`Uploaded "${file.name}" successfully!`);
      return created;
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Upload failed';
      this.toast.error(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async downloadFile(file: FileItem): Promise<void> {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/files/${file.id}/download`, {
          responseType: 'blob',
        })
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      this.toast.error('Download failed. You may not have permission.');
    }
  }

  async deleteFile(id: number, fileName?: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/files/${id}`));
      this.triggerRefresh();
      this.toast.success(`"${fileName || 'File'}" deleted`);
      return true;
    } catch (err: any) {
      const msg = err?.error?.message || 'Failed to delete file';
      this.toast.error(msg);
      return false;
    }
  }

  async updateVisibility(id: number, visibility: FileVisibility): Promise<FileItem | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<{ data: FileItem }>(`${environment.apiUrl}/files/${id}/visibility`, {
          visibility,
        })
      );
      this.triggerRefresh();
      this.toast.success(`File visibility updated to ${visibility}`);
      return res.data;
    } catch (err: any) {
      const msg = err?.error?.message || 'Failed to update visibility';
      this.toast.error(msg);
      return undefined;
    }
  }

  // File Shares Operations
  async getFileShares(fileId: number): Promise<FileShare[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: FileShare[] }>(`${environment.apiUrl}/files/${fileId}/shares`)
      );
      return res?.data || [];
    } catch (err) {
      return [];
    }
  }

  async shareFileWithEmail(fileId: number, email: string, permission: SharePermission): Promise<FileShare | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ data: FileShare }>(`${environment.apiUrl}/files/${fileId}/shares`, {
          email,
          permission,
        })
      );
      this.triggerRefresh();
      this.toast.success(`Shared with ${email} (${permission})`);
      return res.data;
    } catch (err: any) {
      const msg = err?.error?.message || 'Failed to share file';
      this.toast.error(msg);
      return null;
    }
  }

  async updateSharePermission(shareId: number, permission: SharePermission, fileId?: number): Promise<boolean> {
    const fId = fileId || this.activeShareFile()?.id;
    if (!fId) return false;

    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/files/${fId}/shares/${shareId}`, {
          permission,
        })
      );
      this.triggerRefresh();
      this.toast.success(`Permission updated to ${permission}`);
      return true;
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Failed to update permission');
      return false;
    }
  }

  async revokeShare(shareId: number, fileId?: number): Promise<boolean> {
    const fId = fileId || this.activeShareFile()?.id;
    if (!fId) return false;

    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/files/${fId}/shares/${shareId}`));
      this.triggerRefresh();
      this.toast.info('Access revoked');
      return true;
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Failed to revoke access');
      return false;
    }
  }

  // Share Links Operations
  async getShareLinks(fileId: number): Promise<ShareLink[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: any[] }>(`${environment.apiUrl}/files/${fileId}/share-links`)
      );
      if (res?.data) {
        return res.data.map((l) => ({
          ...l,
          publicUrl: `${window.location.origin}/public/files/${l.token}`,
        }));
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  async createShareLink(fileId: number, expiresInHours?: number): Promise<ShareLink | null> {
    try {
      const body: any = {};
      if (expiresInHours && expiresInHours > 0) {
        body.expiresInHours = expiresInHours;
      }

      const res = await firstValueFrom(
        this.http.post<{ data: any }>(`${environment.apiUrl}/files/${fileId}/share-links`, body)
      );

      const link: ShareLink = {
        ...res.data,
        publicUrl: `${window.location.origin}/public/files/${res.data.token}`,
      };
      this.triggerRefresh();
      this.toast.success('Public link generated!');
      return link;
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Failed to generate public link');
      return null;
    }
  }

  async revokeShareLink(linkId: number, fileId?: number): Promise<boolean> {
    const fId = fileId || this.activeShareFile()?.id;
    if (!fId) return false;

    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/files/${fId}/share-links/${linkId}`)
      );
      this.triggerRefresh();
      this.toast.info('Public link disabled');
      return true;
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Failed to revoke public link');
      return false;
    }
  }

  // Public File Operations (No Auth Required)
  async getPublicFileInfo(token: string): Promise<PublicFileInfo | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: PublicFileInfo }>(`${environment.apiUrl}/public/files/${token}`)
      );
      return res?.data || null;
    } catch (err) {
      return null;
    }
  }

  async downloadPublicFile(token: string, fileName?: string): Promise<void> {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/public/files/${token}/download`, {
          responseType: 'blob',
        })
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      this.toast.error('Download failed or link has expired.');
    }
  }

  isImageFile(file?: { mimeType?: string; originalName?: string } | null): boolean {
    if (!file) return false;
    const mime = (file.mimeType || '').toLowerCase();
    const name = (file.originalName || '').toLowerCase();
    const ext = (name.split('.').pop() || '').toLowerCase();
    return (
      mime.startsWith('image/') ||
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext)
    );
  }

  isVideoFile(file?: { mimeType?: string; originalName?: string } | null): boolean {
    if (!file) return false;
    const mime = (file.mimeType || '').toLowerCase();
    const name = (file.originalName || '').toLowerCase();
    const ext = (name.split('.').pop() || '').toLowerCase();
    return (
      mime.startsWith('video/') ||
      ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(ext)
    );
  }

  getFileImageUrl(file?: { id?: number; thumbnailUrl?: string; token?: string; mimeType?: string; originalName?: string } | null): string {
    if (!file) return '';
    if (file.thumbnailUrl) return file.thumbnailUrl;
    if (file.token) {
      return `${environment.apiUrl}/public/files/${file.token}/preview`;
    }
    if (file.id) {
      const token = this.auth.getToken() || localStorage.getItem('simple_storage_jwt_token');
      return token
        ? `${environment.apiUrl}/files/${file.id}/preview?token=${token}`
        : `${environment.apiUrl}/files/${file.id}/preview`;
    }
    return '';
  }

  getFileTypeInfo(file?: { mimeType?: string; originalName?: string } | null) {
    const originalName = file?.originalName || '';
    const mime = (file?.mimeType || '').toLowerCase();
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

    if (ext === 'pdf' || mime.includes('pdf')) {
      return {
        label: 'PDF',
        category: 'pdf',
        bgClass: 'bg-rose-50',
        badgeBgClass: 'bg-rose-100 text-rose-700',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-200',
        accentColor: '#e11d48',
      };
    }

    if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mime.includes('word') || mime.includes('document')) {
      return {
        label: ext ? ext.toUpperCase() : 'DOCX',
        category: 'doc',
        bgClass: 'bg-blue-50',
        badgeBgClass: 'bg-blue-100 text-blue-700',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        accentColor: '#2563eb',
      };
    }

    if (['xls', 'xlsx', 'csv', 'tsv'].includes(ext) || mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) {
      return {
        label: ext ? ext.toUpperCase() : 'XLSX',
        category: 'sheet',
        bgClass: 'bg-emerald-50',
        badgeBgClass: 'bg-emerald-100 text-emerald-700',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        accentColor: '#059669',
      };
    }

    if (['ppt', 'pptx', 'key'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) {
      return {
        label: ext ? ext.toUpperCase() : 'PPTX',
        category: 'slide',
        bgClass: 'bg-amber-50',
        badgeBgClass: 'bg-amber-100 text-amber-700',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        accentColor: '#d97706',
      };
    }

    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mime.startsWith('video/')) {
      return {
        label: ext ? ext.toUpperCase() : 'MP4',
        category: 'video',
        bgClass: 'bg-purple-50',
        badgeBgClass: 'bg-purple-100 text-purple-700',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        accentColor: '#9333ea',
      };
    }

    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext) || mime.startsWith('audio/')) {
      return {
        label: ext ? ext.toUpperCase() : 'MP3',
        category: 'audio',
        bgClass: 'bg-violet-50',
        badgeBgClass: 'bg-violet-100 text-violet-700',
        textColor: 'text-violet-600',
        borderColor: 'border-violet-200',
        accentColor: '#7c3aed',
      };
    }

    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
      return {
        label: ext ? ext.toUpperCase() : 'ZIP',
        category: 'archive',
        bgClass: 'bg-orange-50',
        badgeBgClass: 'bg-orange-100 text-orange-700',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-200',
        accentColor: '#ea580c',
      };
    }

    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'py', 'java', 'c', 'cpp', 'sql', 'xml', 'yaml', 'yml'].includes(ext) || mime.includes('javascript') || mime.includes('json') || mime.includes('xml')) {
      return {
        label: ext ? ext.toUpperCase() : 'CODE',
        category: 'code',
        bgClass: 'bg-cyan-50',
        badgeBgClass: 'bg-cyan-100 text-cyan-700',
        textColor: 'text-cyan-600',
        borderColor: 'border-cyan-200',
        accentColor: '#0891b2',
      };
    }

    if (['txt', 'md', 'markdown', 'log'].includes(ext) || mime.startsWith('text/')) {
      return {
        label: ext ? ext.toUpperCase() : 'TXT',
        category: 'text',
        bgClass: 'bg-stone-100',
        badgeBgClass: 'bg-stone-200 text-stone-700',
        textColor: 'text-stone-700',
        borderColor: 'border-stone-300',
        accentColor: '#57534e',
      };
    }

    return {
      label: ext ? ext.toUpperCase() : 'FILE',
      category: 'other',
      bgClass: 'bg-stone-100',
      badgeBgClass: 'bg-stone-200 text-stone-600',
      textColor: 'text-stone-500',
      borderColor: 'border-stone-200',
      accentColor: '#78716c',
    };
  }
}
