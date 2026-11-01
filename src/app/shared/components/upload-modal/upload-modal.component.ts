import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, UploadCloud, Lock, Users, Globe, AlertTriangle } from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileVisibility } from '../../../core/models/file.model';
import { FileSizePipe } from '../../pipes/file-size.pipe';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FileSizePipe],
  template: `
    @if (fileService.isUploadModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7 border border-stone-100 animate-scale-up">
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 class="text-xl font-bold text-stone-900">Upload File</h3>
            <button
              (click)="fileService.closeUploadModal()"
              class="text-stone-400 hover:text-stone-600 rounded-xl p-1.5 transition-colors"
            >
              <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
            </button>
          </div>

          <!-- Dropzone -->
          <div
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            [class.border-blue-500]="isDragging()"
            [class.bg-blue-50]="isDragging()"
            class="mt-5 border-2 border-dashed border-stone-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-stone-400"
            (click)="fileInput.click()"
          >
            <input
              #fileInput
              type="file"
              class="hidden"
              (change)="onFileSelected($event)"
            />

            <div class="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3.5 text-stone-700">
              <lucide-icon [img]="UploadCloud" class="w-8 h-8" [strokeWidth]="2"></lucide-icon>
            </div>

            <p class="text-[15.5px] font-bold text-stone-900">
              Click to browse or drag and drop your file here
            </p>
            <p class="text-[13px] text-stone-500 mt-1">PDF, MP4, MOV, PNG, JPG, XLSX (Up to 50MB)</p>
          </div>

          <!-- Selected File Details -->
          @if (selectedFile()) {
            <div class="mt-4.5 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {{ getFileExt(selectedFile()!.name) }}
                </div>
                <div class="overflow-hidden">
                  <p class="text-[15px] font-bold text-stone-900 truncate">{{ selectedFile()!.name }}</p>
                  <p class="text-xs text-stone-500 mt-0.5">{{ selectedFile()!.size | fileSize }}</p>
                </div>
              </div>

              <button
                (click)="selectedFile.set(null)"
                class="text-stone-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
              >
                <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
              </button>
            </div>

            @if (isOverVercelLimit()) {
              <div class="mt-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <lucide-icon [img]="AlertTriangle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" [strokeWidth]="2"></lucide-icon>
                <div class="leading-relaxed">
                  <p class="font-bold text-[13px] text-amber-950">Vượt giới hạn Vercel (4.5 MB)</p>
                  <p class="mt-0.5 text-stone-600">
                    Nền tảng Vercel Cloud giới hạn mỗi request tối đa <strong>4.5 MB</strong> (file của bạn là <strong>{{ selectedFile()!.size | fileSize }}</strong>). Vui lòng chọn file dưới 4.5 MB khi dùng trên Vercel, hoặc chạy bản Localhost để upload file tới <strong>50 MB</strong>.
                  </p>
                </div>
              </div>
            }
          }

          <!-- Visibility Choice -->
          <div class="mt-5">
            <label class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Initial Visibility
            </label>
            <div class="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                (click)="visibility.set('PRIVATE')"
                [class.bg-brownblack]="visibility() === 'PRIVATE'"
                [class.text-white]="visibility() === 'PRIVATE'"
                [class.border-transparent]="visibility() === 'PRIVATE'"
                class="py-2.5 px-3 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
              >
                <lucide-icon [img]="Lock" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                <span>Private</span>
              </button>
              <button
                type="button"
                (click)="visibility.set('SHARED')"
                [class.bg-brownblack]="visibility() === 'SHARED'"
                [class.text-white]="visibility() === 'SHARED'"
                [class.border-transparent]="visibility() === 'SHARED'"
                class="py-2.5 px-3 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
              >
                <lucide-icon [img]="Users" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                <span>Shared</span>
              </button>
              <button
                type="button"
                (click)="visibility.set('PUBLIC')"
                [class.bg-brownblack]="visibility() === 'PUBLIC'"
                [class.text-white]="visibility() === 'PUBLIC'"
                [class.border-transparent]="visibility() === 'PUBLIC'"
                class="py-2.5 px-3 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
              >
                <lucide-icon [img]="Globe" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                <span>Public</span>
              </button>
            </div>
          </div>

          <!-- Upload Progress -->
          @if (isUploading()) {
            <div class="mt-5">
              <div class="flex justify-between text-xs text-stone-600 mb-1.5 font-bold">
                <span>Uploading...</span>
                <span>{{ uploadProgress() }}%</span>
              </div>
              <div class="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  [style.width.%]="uploadProgress()"
                ></div>
              </div>
            </div>
          }

          <!-- Footer Actions -->
          <div class="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="fileService.closeUploadModal()"
              class="px-5 py-2.5 rounded-2xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              [disabled]="!selectedFile() || isUploading() || isOverVercelLimit()"
              (click)="startUpload()"
              class="px-6 py-2.5 rounded-2xl bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              @if (isUploading()) {
                Uploading...
              } @else {
                Upload File
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UploadModalComponent {
  readonly fileService = inject(FileService);
  private readonly toast = inject(ToastService);

  readonly X = X;
  readonly UploadCloud = UploadCloud;
  readonly Lock = Lock;
  readonly Users = Users;
  readonly Globe = Globe;
  readonly AlertTriangle = AlertTriangle;

  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  visibility = signal<FileVisibility>('PRIVATE');
  isUploading = signal(false);
  uploadProgress = signal(0);

  isVercel = computed(() => {
    if (typeof window !== 'undefined') {
      return window.location.hostname.includes('vercel.app');
    }
    return false;
  });

  isOverVercelLimit = computed(() => {
    const file = this.selectedFile();
    return this.isVercel() && !!file && file.size > 4.5 * 1024 * 1024;
  });

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.selectedFile.set(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile.set(target.files[0]);
    }
  }

  getFileExt(name: string): string {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() || 'FILE' : 'FILE';
  }

  startUpload() {
    const file = this.selectedFile();
    if (!file) return;

    if (this.isOverVercelLimit()) {
      this.toast.error('File vượt quá giới hạn 4.5 MB của Vercel Cloud.');
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(20);

    const interval = setInterval(() => {
      this.uploadProgress.update((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 25;
      });
    }, 150);

    this.fileService
      .uploadFile(file, this.visibility())
      .then(() => {
        clearInterval(interval);
        this.uploadProgress.set(100);
        setTimeout(() => {
          this.isUploading.set(false);
          this.selectedFile.set(null);
          this.uploadProgress.set(0);
          this.fileService.closeUploadModal();
        }, 300);
      })
      .catch(() => {
        clearInterval(interval);
        this.isUploading.set(false);
        this.uploadProgress.set(0);
      });
  }
}
