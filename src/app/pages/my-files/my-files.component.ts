import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../core/services/file.service';
import { ToastService } from '../../core/services/toast.service';
import { FileItem, FileVisibility } from '../../core/models/file.model';
import { FolderItem } from '../../core/models/folder.model';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { FileThumbnailComponent } from '../../shared/components/file-thumbnail/file-thumbnail.component';
import {
  LucideAngularModule,
  Plus,
  Upload,
  FolderPlus,
  Folder,
  FileEdit,
  List,
  LayoutGrid,
  FolderOpen,
  FileText,
  Video,
  FileSpreadsheet,
  File,
  Lock,
  Users,
  Globe,
  Share2,
  Shield,
  Download,
  Trash2,
  Eye,
  ChevronRight,
} from 'lucide-angular';

type FilterType = 'All' | 'Recent' | 'PDFs' | 'Images' | 'Videos' | 'Spreadsheets' | 'Public';

@Component({
  selector: 'app-my-files',
  standalone: true,
  imports: [CommonModule, FormsModule, FileSizePipe, LucideAngularModule, FileThumbnailComponent],
  template: `
    <div class="space-y-8 max-w-6xl mx-auto pb-16">
      <!-- 1. TOP ACTION CARDS (Minimalist SaaS action row) -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- 1.1 + Create (Upload modal) -->
        <button
          (click)="fileService.openUploadModal()"
          class="flex flex-col justify-between p-4 h-28 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs hover:bg-stone-50/50 transition-all text-left group"
        >
          <div class="w-6 h-6 flex items-center justify-center text-stone-800">
            <lucide-icon [img]="Plus" class="w-5 h-5 text-stone-800" [strokeWidth]="2.5"></lucide-icon>
          </div>
          <span class="text-sm font-semibold text-stone-900">Create</span>
        </button>

        <!-- 1.2 Upload (White card with subtle border) -->
        <button
          (click)="fileService.openUploadModal()"
          class="flex flex-col justify-between p-4 h-28 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs hover:bg-stone-50/50 transition-all text-left group"
        >
          <div class="w-6 h-6 flex items-center justify-center text-stone-800">
            <lucide-icon [img]="Upload" class="w-5 h-5 text-stone-800" [strokeWidth]="2"></lucide-icon>
          </div>
          <span class="text-sm font-semibold text-stone-900">Upload</span>
        </button>

        <!-- 1.3 Create folder -->
        <button
          (click)="fileService.openCreateFolderModal()"
          class="flex flex-col justify-between p-4 h-28 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs hover:bg-stone-50/50 transition-all text-left group"
        >
          <div class="w-6 h-6 flex items-center justify-center text-stone-800">
            <lucide-icon [img]="FolderPlus" class="w-5 h-5 text-stone-800" [strokeWidth]="2"></lucide-icon>
          </div>
          <span class="text-sm font-semibold text-stone-900">Create folder</span>
        </button>

        <!-- 1.4 Edit PDF -->
        <button
          (click)="quickEditPdfDemo()"
          class="flex flex-col justify-between p-4 h-28 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs hover:bg-stone-50/50 transition-all text-left group"
        >
          <div class="w-6 h-6 flex items-center justify-center text-stone-800">
            <lucide-icon [img]="FileEdit" class="w-5 h-5 text-stone-800" [strokeWidth]="2"></lucide-icon>
          </div>
          <span class="text-sm font-semibold text-stone-900">Edit PDF</span>
        </button>
      </section>

      <!-- 2. BREADCRUMB NAVIGATION -->
      <nav class="flex items-center gap-2 text-sm text-stone-600 bg-stone-50/80 px-4 py-2.5 rounded-xl border border-stone-200/60">
        @for (crumb of fileService.folderBreadcrumbs(); track $index; let last = $last) {
          @if (!last) {
            <button
              type="button"
              (click)="onBreadcrumbClick(crumb)"
              class="hover:text-blue-600 font-medium transition flex items-center gap-1.5"
            >
              @if ($index === 0) {
                <lucide-icon [img]="Folder" class="w-4 h-4 text-stone-500"></lucide-icon>
              }
              <span>{{ crumb.name }}</span>
            </button>
            <lucide-icon [img]="ChevronRight" class="w-3.5 h-3.5 text-stone-400"></lucide-icon>
          } @else {
            <span class="font-semibold text-stone-900 flex items-center gap-1.5">
              @if ($index === 0) {
                <lucide-icon [img]="Folder" class="w-4 h-4 text-stone-800"></lucide-icon>
              }
              <span>{{ crumb.name }}</span>
            </span>
          }
        }
      </nav>

      <!-- 3. FOLDERS SECTION -->
      @if (fileService.folders().length > 0) {
        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Folders ({{ fileService.folders().length }})
            </h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            @for (folder of fileService.folders(); track folder.id) {
              <div
                (click)="fileService.navigateToFolder(folder)"
                class="group flex items-center justify-between p-3.5 bg-white border border-stone-200/80 hover:border-blue-400 hover:shadow-xs rounded-xl cursor-pointer transition select-none"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-100 group-hover:scale-105 transition">
                    <lucide-icon [img]="Folder" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-stone-900 truncate group-hover:text-blue-600 transition">
                      {{ folder.name }}
                    </p>
                    <p class="text-[11px] text-stone-400">
                      {{ folder.fileCount || 0 }} files
                    </p>
                  </div>
                </div>

                <!-- Delete Folder Button -->
                <button
                  type="button"
                  (click)="$event.stopPropagation(); deleteFolder(folder)"
                  class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete folder"
                >
                  <lucide-icon [img]="Trash2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                </button>
              </div>
            }
          </div>
        </section>
      }

      <!-- 4. "ALL FILES" SECTION HEADER & FILTER PILLS -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold tracking-tight text-stone-900">
            {{ fileService.currentFolder() ? fileService.currentFolder()?.name : 'All files' }}
          </h2>
          <span class="text-xs text-stone-500 font-medium">
            {{ filteredFiles().length }} {{ filteredFiles().length === 1 ? 'file' : 'files' }}
          </span>
        </div>

        <!-- Filter Pills Bar & View Toggle -->
        <div class="flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div class="flex items-center gap-2">
            @for (filter of filterOptions; track filter) {
              <button
                type="button"
                (click)="activeFilter.set(filter)"
                [class.bg-stone-100]="activeFilter() === filter"
                [class.text-stone-900]="activeFilter() === filter"
                [class.font-semibold]="activeFilter() === filter"
                [class.text-stone-600]="activeFilter() !== filter"
                [class.hover:bg-stone-50]="activeFilter() !== filter"
                class="px-4 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap"
              >
                {{ filter }}
              </button>
            }
          </div>

          <!-- List / Grid View Toggle Button -->
          <div class="flex items-center gap-1 text-stone-500">
            <button
              (click)="isGridView.set(!isGridView())"
              class="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition"
              [title]="isGridView() ? 'Switch to list view' : 'Switch to grid view'"
            >
              @if (isGridView()) {
                <lucide-icon [img]="List" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
              } @else {
                <lucide-icon [img]="LayoutGrid" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
              }
            </button>
          </div>
        </div>
      </section>

      <!-- 5. FILE LIST -->
      @if (fileService.isLoading()) {
        <!-- Skeleton Loading State -->
        <div class="space-y-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="flex items-center justify-between p-4 rounded-xl border border-stone-100 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-14 h-12 bg-stone-200 rounded-lg"></div>
                <div class="space-y-2">
                  <div class="w-48 h-4 bg-stone-200 rounded"></div>
                  <div class="w-24 h-3 bg-stone-100 rounded"></div>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="w-20 h-6 bg-stone-200 rounded-full"></div>
                <div class="w-16 h-3 bg-stone-200 rounded"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filteredFiles().length === 0 && fileService.folders().length === 0) {
        <!-- Completely Empty State -->
        <div class="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <div class="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mb-3">
            <lucide-icon [img]="FolderOpen" class="w-6 h-6" [strokeWidth]="2"></lucide-icon>
          </div>
          <h3 class="text-base font-semibold text-stone-900">
            {{ fileService.currentFolder() ? 'This folder is empty' : 'No files found' }}
          </h3>
          <p class="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {{ fileService.searchQuery() ? 'No files match your search query.' : (fileService.currentFolder() ? 'Upload files or create subfolders here.' : 'Upload your first file or create a folder to get started.') }}
          </p>
          <div class="mt-4 flex items-center justify-center gap-2">
            <button
              (click)="fileService.openUploadModal()"
              class="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-2xs transition inline-flex items-center gap-1.5"
            >
              <lucide-icon [img]="Upload" class="w-3.5 h-3.5 text-stone-600" [strokeWidth]="2"></lucide-icon>
              <span>Upload file</span>
            </button>
            <button
              (click)="fileService.openCreateFolderModal()"
              class="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-2xs transition inline-flex items-center gap-1.5"
            >
              <lucide-icon [img]="FolderPlus" class="w-3.5 h-3.5 text-stone-600" [strokeWidth]="2"></lucide-icon>
              <span>New folder</span>
            </button>
          </div>
        </div>
      } @else if (filteredFiles().length === 0 && fileService.folders().length > 0) {
        <div class="py-12 text-center border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
          <p class="text-xs text-stone-500 font-medium">No files in this folder. Drop or upload files using the action card above.</p>
        </div>
      } @else if (!isGridView()) {
        <!-- LIST VIEW -->
        <div class="divide-y divide-stone-100/90 border-t border-stone-100">
          @for (file of filteredFiles(); track file.id) {
            <div
              (click)="fileService.openFileDetailsModal(file)"
              class="group flex items-center justify-between py-4 px-2 hover:bg-stone-50/70 rounded-xl transition-all cursor-pointer select-none"
            >
              <!-- Left: Rich Thumbnail / File Icon + File Name -->
              <div class="flex items-center gap-4 min-w-0 pr-4">
                <!-- Thumbnail Preview -->
                <div
                  (click)="$event.stopPropagation(); previewFile(file)"
                  class="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200/60 shadow-xs relative group cursor-pointer"
                  title="Quick preview"
                >
                  <app-file-thumbnail [file]="file" size="md" [showHoverOverlay]="true" />
                </div>

                <!-- File Name & Meta details -->
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-stone-900 group-hover:text-blue-600 transition-colors truncate">
                      {{ file.originalName }}
                    </span>
                    <!-- Visibility Tag with Lucide Icon -->
                    <span
                      [class]="getVisibilityBadgeClass(file.visibility)"
                      class="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider hidden sm:inline-flex items-center gap-1"
                    >
                      <lucide-icon [img]="getVisibilityIcon(file.visibility)" class="w-3 h-3" [strokeWidth]="2"></lucide-icon>
                      <span>{{ file.visibility }}</span>
                    </span>
                  </div>
                  <p class="text-xs text-stone-400 mt-0.5">
                    {{ file.size | fileSize }} • {{ file.mimeType }}
                  </p>
                </div>
              </div>

              <!-- Right: Collaborator Avatars Stack + Timestamp + Quick Actions -->
              <div class="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                <!-- Stacked Avatars -->
                <div class="flex items-center -space-x-1.5 overflow-hidden">
                  @if (file.collaborators && file.collaborators.length > 0) {
                    @for (c of file.collaborators.slice(0, 3); track c.id) {
                      <div
                        [class]="c.color || 'bg-stone-300'"
                        class="w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-[9px] text-stone-900 uppercase shadow-2xs"
                        [title]="c.name"
                      >
                        {{ c.initials || c.name.slice(0, 2) }}
                      </div>
                    }
                    @if (file.collaborators.length > 3) {
                      <div class="w-6 h-6 rounded-full bg-stone-100 ring-2 ring-white flex items-center justify-center font-bold text-[9px] text-stone-600 shadow-2xs">
                        +{{ file.collaborators.length - 3 }}
                      </div>
                    }
                  } @else {
                    <span class="text-[11px] text-stone-400 italic hidden sm:inline">Only you</span>
                  }
                </div>

                <!-- Relative Time -->
                <span class="text-xs font-normal text-stone-500 w-24 text-right">
                  {{ getTimeLabel(file.createdAt) }}
                </span>

                <!-- Quick Action Menu with Lucide Icons -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                  <!-- Preview Button -->
                  <button
                    type="button"
                    (click)="previewFile(file)"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                    title="Preview file"
                  >
                    <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>

                  <!-- Share Button -->
                  <button
                    type="button"
                    (click)="fileService.openShareModal(file)"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                    title="Share file"
                  >
                    <lucide-icon [img]="Share2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>

                  <!-- Change Visibility Button -->
                  <button
                    type="button"
                    (click)="fileService.openVisibilityModal(file)"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                    title="Access control"
                  >
                    <lucide-icon [img]="Shield" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>

                  <!-- Download Button -->
                  <button
                    type="button"
                    (click)="downloadFile(file)"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                    title="Download file"
                  >
                    <lucide-icon [img]="Download" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>

                  <!-- Delete Button -->
                  <button
                    type="button"
                    (click)="deleteFile(file)"
                    class="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete file"
                  >
                    <lucide-icon [img]="Trash2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- GRID VIEW -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          @for (file of filteredFiles(); track file.id) {
            <div
              (click)="fileService.openFileDetailsModal(file)"
              class="group bg-white rounded-2xl border border-stone-200/80 p-4 hover:shadow-md hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <!-- Large thumbnail preview -->
                <div
                  (click)="$event.stopPropagation(); previewFile(file)"
                  class="w-full h-36 rounded-xl overflow-hidden border border-stone-200/60 mb-3 relative group cursor-pointer"
                  title="Click to preview file"
                >
                  <app-file-thumbnail [file]="file" size="lg" [showHoverOverlay]="true" />
                  <span
                    [class]="getVisibilityBadgeClass(file.visibility)"
                    class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs shadow-xs inline-flex items-center gap-1 z-20"
                  >
                    <lucide-icon [img]="getVisibilityIcon(file.visibility)" class="w-2.5 h-2.5" [strokeWidth]="2"></lucide-icon>
                    <span>{{ file.visibility }}</span>
                  </span>
                </div>

                <h3 class="text-sm font-semibold text-stone-900 group-hover:text-blue-600 transition truncate">
                  {{ file.originalName }}
                </h3>
                <p class="text-xs text-stone-400 mt-1">
                  {{ file.size | fileSize }} • {{ getTimeLabel(file.createdAt) }}
                </p>
              </div>

              <!-- Card Footer with Collaborators & Actions -->
              <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between" (click)="$event.stopPropagation()">
                <div class="flex items-center -space-x-1">
                  @if (file.collaborators && file.collaborators.length > 0) {
                    @for (c of file.collaborators.slice(0, 3); track c.id) {
                      <div [class]="c.color || 'bg-stone-300'" class="w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-[8px] text-stone-900">
                        {{ c.initials || c.name.slice(0, 2) }}
                      </div>
                    }
                  }
                </div>

                <div class="flex items-center gap-1">
                  <button
                    (click)="previewFile(file)"
                    class="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
                    title="Preview file"
                  >
                    <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                  <button
                    (click)="fileService.openShareModal(file)"
                    class="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
                    title="Share"
                  >
                    <lucide-icon [img]="Share2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                  <button
                    (click)="downloadFile(file)"
                    class="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
                    title="Download"
                  >
                    <lucide-icon [img]="Download" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MyFilesComponent implements OnInit {
  readonly fileService = inject(FileService);
  private readonly toast = inject(ToastService);

  ngOnInit() {
    this.fileService.refreshAll();
  }

  isGridView = signal(false);
  activeFilter = signal<FilterType>('All');

  readonly Plus = Plus;
  readonly Upload = Upload;
  readonly FolderPlus = FolderPlus;
  readonly Folder = Folder;
  readonly ChevronRight = ChevronRight;
  readonly FileEdit = FileEdit;
  readonly List = List;
  readonly LayoutGrid = LayoutGrid;
  readonly FolderOpen = FolderOpen;
  readonly Share2 = Share2;
  readonly Shield = Shield;
  readonly Download = Download;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;

  filterOptions: FilterType[] = [
    'All',
    'Recent',
    'PDFs',
    'Images',
    'Videos',
    'Spreadsheets',
    'Public',
  ];

  filteredFiles = computed(() => {
    let list = this.fileService.filteredFiles();
    const filter = this.activeFilter();

    switch (filter) {
      case 'Recent':
        return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'PDFs':
        return list.filter((f) => f.mimeType?.includes('pdf') || f.originalName.endsWith('.pdf'));
      case 'Images':
        return list.filter((f) => f.mimeType?.includes('image') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.originalName));
      case 'Videos':
        return list.filter((f) => f.mimeType?.includes('video') || /\.(mp4|mov|avi|mkv)$/i.test(f.originalName));
      case 'Spreadsheets':
        return list.filter((f) => f.mimeType?.includes('sheet') || f.mimeType?.includes('excel') || /\.(xlsx?|csv)$/i.test(f.originalName));
      case 'Public':
        return list.filter((f) => f.visibility === 'PUBLIC');
      case 'All':
      default:
        return list;
    }
  });

  getFileIcon(mimeType: string) {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('video')) return Video;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
    return File;
  }

  getVisibilityIcon(visibility: FileVisibility) {
    switch (visibility) {
      case 'PUBLIC':
        return Globe;
      case 'SHARED':
        return Users;
      case 'PRIVATE':
      default:
        return Lock;
    }
  }

  getTimeLabel(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    const diffHours = Math.round((Date.now() - new Date(dateStr).getTime()) / (3600 * 1000));
    if (diffHours <= 1) return '1 hour ago';
    if (diffHours <= 2) return '2 hours ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const days = Math.round(diffHours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  getVisibilityBadgeClass(visibility: FileVisibility): string {
    switch (visibility) {
      case 'PUBLIC':
        return 'bg-emerald-100 text-emerald-800';
      case 'SHARED':
        return 'bg-blue-100 text-blue-800';
      case 'PRIVATE':
      default:
        return 'bg-stone-100 text-stone-600';
    }
  }

  previewFile(file: FileItem) {
    this.fileService.openPreviewModal({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      canDownload: true,
    });
  }

  downloadFile(file: FileItem) {
    this.fileService.downloadFile(file);
    this.toast.success(`Download started: ${file.originalName}`);
  }

  deleteFile(file: FileItem) {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      this.fileService.deleteFile(file.id, file.originalName);
    }
  }

  async deleteFolder(folder: FolderItem) {
    if (confirm(`Are you sure you want to delete folder "${folder.name}" and all its contents?`)) {
      await this.fileService.deleteFolder(folder.id);
    }
  }

  onBreadcrumbClick(crumb: { id: number | null; name: string }) {
    if (crumb.id === null) {
      this.fileService.navigateToFolder(null);
    } else {
      this.fileService.navigateToFolder({ id: crumb.id, name: crumb.name } as FolderItem);
    }
  }

  quickEditPdfDemo() {
    const pdf = this.fileService.files().find(f => f.mimeType?.includes('pdf') || f.originalName.endsWith('.pdf'));
    if (pdf) {
      this.previewFile(pdf);
    } else {
      this.toast.info('Select a PDF to view or edit.');
    }
  }
}
