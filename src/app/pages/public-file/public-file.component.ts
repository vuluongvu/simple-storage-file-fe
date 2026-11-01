import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, AlertCircle, FileText, Download, Eye } from 'lucide-angular';
import { FileService } from '../../core/services/file.service';
import { ToastService } from '../../core/services/toast.service';
import { PublicFileInfo } from '../../core/models/share-link.model';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { FileThumbnailComponent } from '../../shared/components/file-thumbnail/file-thumbnail.component';

@Component({
  selector: 'app-public-file',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FileSizePipe, FileThumbnailComponent],
  template: `
    <div class="min-h-screen bg-[#f7f5f2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <!-- Logo -->
        <a routerLink="/" class="inline-block text-stone-900 hover:opacity-80 transition">
          <svg class="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 3.5l6 3.8-6 3.8-6-3.8 6-3.8zm12 0l6 3.8-6 3.8-6-3.8 6-3.8zM0 14.9l6 3.8 6-3.8-6-3.8-6 3.8zm24 0l-6 3.8-6-3.8 6-3.8 6 3.8zM12 16.3l6-3.8 6 3.8-6 3.8-6-3.8z"/>
            <path d="M6 19.3l6 3.8 6-3.8-6-3.8-6 3.8z"/>
          </svg>
        </a>
        <h2 class="mt-4 text-2xl font-bold text-stone-900">Shared Public File</h2>
        <p class="text-sm text-stone-500 mt-1 font-medium">Simple File Storage Cloud Transfer</p>
      </div>

      <div class="mt-7 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        @if (loading()) {
          <div class="bg-white p-8 rounded-3xl border border-stone-200/90 shadow-sm text-center">
            <div class="w-9 h-9 border-2 border-stone-300 border-t-brownblack rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-sm text-stone-500">Retrieving shared file details...</p>
          </div>
        } @else if (error() || !fileInfo()) {
          <!-- Invalid or Expired State -->
          <div class="bg-white p-8 rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <lucide-icon [img]="AlertCircle" class="w-7 h-7" [strokeWidth]="2"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-stone-900">Link Unavailable</h3>
              <p class="text-sm text-stone-500 mt-1.5 max-w-sm mx-auto">
                {{ error() || 'This public share link has expired, been revoked, or does not exist.' }}
              </p>
            </div>
            <a
              routerLink="/auth/login"
              class="inline-block px-5 py-2.5 bg-brownblack text-white rounded-2xl text-sm font-semibold hover:bg-brownblack-800 transition"
            >
              Sign in to Simple File Storage
            </a>
          </div>
        } @else {
          <!-- Active Public File Card -->
          <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
            <!-- Hero Thumbnail -->
            <div
              (click)="previewPublicFile()"
              class="h-52 bg-stone-100 border-b border-stone-100 relative overflow-hidden flex items-center justify-center cursor-pointer group"
              title="Click to preview file"
            >
              <app-file-thumbnail [file]="publicFileObject()" size="hero" [showHoverOverlay]="true" />
              <span class="absolute top-3.5 right-3.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs z-20">
                Public Share
              </span>
            </div>

            <!-- Details -->
            <div class="p-7 space-y-5">
              <div>
                <h3 class="text-xl font-bold text-stone-900 truncate">{{ fileInfo()?.originalName }}</h3>
                <div class="flex items-center gap-2 text-sm text-stone-500 mt-1">
                  <span>{{ fileInfo()?.size | fileSize }}</span>
                  <span>•</span>
                  <span>{{ fileInfo()?.mimeType }}</span>
                </div>
              </div>

              <div class="bg-stone-50 rounded-2xl p-4.5 border border-stone-150 space-y-2.5 text-sm">
                <div class="flex justify-between text-stone-600">
                  <span class="font-medium">Shared with token:</span>
                  <span class="font-mono text-stone-900 font-bold">{{ token.slice(0, 16) }}...</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span class="font-medium">Status:</span>
                  <span class="text-emerald-700 font-bold">Active & verified</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  (click)="previewPublicFile()"
                  class="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-sm font-semibold rounded-2xl transition flex items-center justify-center gap-2 border border-stone-200"
                >
                  <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  <span>Preview File</span>
                </button>

                <button
                  type="button"
                  (click)="downloadPublicFile()"
                  class="w-full py-3.5 bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <lucide-icon [img]="Download" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PublicFileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fileService = inject(FileService);
  private readonly toast = inject(ToastService);

  readonly AlertCircle = AlertCircle;
  readonly FileText = FileText;
  readonly Download = Download;
  readonly Eye = Eye;

  token = '';
  loading = signal(true);
  error = signal<string | null>(null);
  fileInfo = signal<PublicFileInfo | null>(null);

  publicFileObject = computed(() => {
    const info = this.fileInfo();
    if (!info) return null;
    return {
      originalName: info.originalName,
      mimeType: info.mimeType,
      size: info.size,
      token: this.token,
    };
  });

  previewPublicFile() {
    const info = this.fileInfo();
    if (!info) return;

    this.fileService.openPreviewModal({
      originalName: info.originalName,
      mimeType: info.mimeType,
      size: info.size,
      token: this.token,
      canDownload: true,
    });
  }

  async ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error.set('No token provided.');
      this.loading.set(false);
      return;
    }

    try {
      const info = await this.fileService.getPublicFileInfo(this.token);
      if (info) {
        this.fileInfo.set(info);
      } else {
        this.error.set('This public share link has expired, been revoked, or is invalid.');
      }
    } catch {
      this.error.set('This public share link has expired or is invalid.');
    } finally {
      this.loading.set(false);
    }
  }

  async downloadPublicFile() {
    const info = this.fileInfo();
    if (!info) return;

    await this.fileService.downloadPublicFile(this.token, info.originalName);
  }
}
