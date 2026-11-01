import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, FileText, Lock, Users, Globe, Trash2, Share2, Download, Eye } from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { FileThumbnailComponent } from '../file-thumbnail/file-thumbnail.component';

@Component({
  selector: 'app-file-details-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FileSizePipe, FileThumbnailComponent],
  template: `
    @if (fileService.isFileDetailsModalOpen() && fileService.activeDetailsFile(); as file) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-100 animate-scale-up">
          <!-- Thumbnail preview hero -->
          <div
            (click)="openPreview(file)"
            class="relative h-52 bg-stone-100 overflow-hidden cursor-pointer group"
            title="Click to preview file"
          >
            <app-file-thumbnail [file]="file" size="hero" [showHoverOverlay]="true" />

            <button
              type="button"
              (click)="$event.stopPropagation(); fileService.closeFileDetailsModal()"
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-brownblack/60 hover:bg-brownblack/80 text-white flex items-center justify-center backdrop-blur-md transition-colors z-20"
            >
              <lucide-icon [img]="X" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-7">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold text-stone-900 leading-snug">{{ file.originalName }}</h3>
                <p class="text-xs text-stone-400 mt-1 font-medium">Uploaded {{ file.createdAt | date:'medium' }}</p>
              </div>

              <!-- Visibility badge -->
              <span
                [ngClass]="{
                  'bg-stone-100 text-stone-700': file.visibility === 'PRIVATE',
                  'bg-blue-50 text-blue-700 border-blue-200': file.visibility === 'SHARED',
                  'bg-emerald-50 text-emerald-700 border-emerald-200': file.visibility === 'PUBLIC'
                }"
                class="px-3 py-1 text-xs font-bold rounded-full border shrink-0 flex items-center gap-1.5"
              >
                @if (file.visibility === 'PRIVATE') {
                  <lucide-icon [img]="Lock" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                } @else if (file.visibility === 'SHARED') {
                  <lucide-icon [img]="Users" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                } @else {
                  <lucide-icon [img]="Globe" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                }
                <span>{{ file.visibility }}</span>
              </span>
            </div>

            <!-- Metadata table -->
            <div class="mt-6 grid grid-cols-2 gap-3.5 text-xs bg-stone-50 p-5 rounded-2xl border border-stone-150">
              <div>
                <span class="text-stone-400 block mb-1 font-medium">File Size</span>
                <span class="font-bold text-stone-900 text-sm">{{ file.size | fileSize }}</span>
              </div>
              <div>
                <span class="text-stone-400 block mb-1 font-medium">Folder Location</span>
                <select
                  [value]="file.folderId || ''"
                  (change)="onMoveFolder(file, $event)"
                  class="w-full text-xs font-semibold text-stone-900 bg-white border border-stone-200 rounded-lg py-1 px-1.5 focus:ring-1 focus:ring-stone-400 focus:outline-hidden cursor-pointer"
                  title="Move to another folder"
                >
                  <option value="">Root (My Files)</option>
                  @for (f of fileService.allFolders(); track f.id) {
                    <option [value]="f.id">{{ f.name }}</option>
                  }
                </select>
              </div>
              <div>
                <span class="text-stone-400 block mb-1 font-medium">File Format</span>
                <span class="font-bold text-stone-800 text-xs uppercase">{{ getFileExt(file.originalName) }}</span>
              </div>
              <div>
                <span class="text-stone-400 block mb-1 font-medium">MIME Type</span>
                <span class="font-bold text-stone-800 text-[11px] truncate block font-mono">{{ file.mimeType }}</span>
              </div>
            </div>

            <!-- Actions footer -->
            <div class="mt-7 flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                (click)="deleteFile(file)"
                class="px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors flex items-center gap-1.5"
              >
                <lucide-icon [img]="Trash2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                <span>Delete</span>
              </button>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="openPreview(file)"
                  class="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-2xl transition-colors flex items-center gap-1.5"
                >
                  <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  (click)="openShare(file)"
                  class="px-3.5 py-2.5 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5"
                >
                  <lucide-icon [img]="Share2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  (click)="download(file)"
                  class="px-4 py-2.5 bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <lucide-icon [img]="Download" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class FileDetailsModalComponent {
  readonly fileService = inject(FileService);
  readonly toast = inject(ToastService);
  readonly X = X;
  readonly FileText = FileText;
  readonly Lock = Lock;
  readonly Users = Users;
  readonly Globe = Globe;
  readonly Trash2 = Trash2;
  readonly Share2 = Share2;
  readonly Download = Download;
  readonly Eye = Eye;

  getFileExt(name: string): string {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() || 'FILE' : 'FILE';
  }

  openPreview(file: any) {
    this.fileService.closeFileDetailsModal();
    this.fileService.openPreviewModal({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      canDownload: true,
    });
  }

  download(file: any) {
    this.fileService.downloadFile(file);
    this.toast.success(`Download started for "${file.originalName}"`);
  }

  openShare(file: any) {
    this.fileService.closeFileDetailsModal();
    this.fileService.openShareModal(file);
  }

  async deleteFile(file: any) {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      await this.fileService.deleteFile(file.id, file.originalName);
      this.fileService.closeFileDetailsModal();
    }
  }

  async onMoveFolder(file: any, event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const fId = val === '' ? null : Number(val);
    try {
      await this.fileService.moveFileToFolder(file.id, fId);
      file.folderId = fId;
      const targetFolder = this.fileService.allFolders().find(f => f.id === fId);
      file.folder = targetFolder ? { id: targetFolder.id, name: targetFolder.name } : null;
    } catch {
      // toast is handled in file.service
    }
  }
}
