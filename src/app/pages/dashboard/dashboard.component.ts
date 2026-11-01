import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FileService } from '../../core/services/file.service';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { FileThumbnailComponent } from '../../shared/components/file-thumbnail/file-thumbnail.component';
import { FileItem } from '../../core/models/file.model';
import {
  LucideAngularModule,
  Upload,
  Folder,
  Users,
  Share2,
  Globe,
  ArrowRight,
  Eye,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FileSizePipe, LucideAngularModule, FileThumbnailComponent],
  template: `
    <div class="space-y-8 max-w-6xl mx-auto pb-16">
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-stone-900">Dashboard & Storage Overview</h1>
          <p class="text-sm text-stone-500 mt-1">Monitor storage quotas, file shares, and account activity.</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="fileService.openUploadModal()"
            class="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-2xs transition flex items-center gap-2"
          >
            <lucide-icon [img]="Upload" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
            <span>Upload File</span>
          </button>
        </div>
      </div>

      <!-- Storage Quota Hero Card -->
      <div class="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <span class="text-xs font-bold tracking-wider text-stone-400 uppercase">Cloud Storage</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-3xl font-extrabold text-stone-900">{{ (totalSize() / (1024 * 1024 * 1024)).toFixed(2) }} GB</span>
              <span class="text-stone-400 text-sm font-medium">used of 50.00 GB (Pro Plan)</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Healthy Quota</span>
            </span>
          </div>
        </div>

        <!-- Multi-segment Storage Bar -->
        <div class="mt-6 space-y-2">
          <div class="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden flex">
            <div class="bg-blue-500 h-full transition-all" [style.width.%]="videoPct()" title="Videos"></div>
            <div class="bg-rose-500 h-full transition-all" [style.width.%]="pdfPct()" title="PDF Documents"></div>
            <div class="bg-emerald-500 h-full transition-all" [style.width.%]="sheetPct()" title="Spreadsheets"></div>
            <div class="bg-amber-500 h-full transition-all" [style.width.%]="otherPct()" title="Other Assets"></div>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-600">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Videos ({{ videoBytes() | fileSize }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>PDF Documents ({{ pdfBytes() | fileSize }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Spreadsheets ({{ sheetBytes() | fileSize }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Other Assets ({{ otherBytes() | fileSize }})</span>
            </div>
            <div class="flex items-center gap-2 text-stone-400">
              <span class="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
              <span>Free Space ({{ freeSpaceBytes() | fileSize }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat Cards Grid with Lucide Icons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Files -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Files</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ fileService.files().length }}</p>
            <p class="text-[11px] text-stone-500 mt-1">In your personal drive</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <lucide-icon [img]="Folder" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
          </div>
        </div>

        <!-- 2. Shared With Me -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Shared With Me</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ fileService.sharedWithMeList().length }}</p>
            <p class="text-[11px] text-stone-500 mt-1">From team collaborators</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <lucide-icon [img]="Users" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
          </div>
        </div>

        <!-- 3. Shared By Me -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Shared By Me</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ sharedByMeCount() }}</p>
            <p class="text-[11px] text-stone-500 mt-1">Shared files</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <lucide-icon [img]="Share2" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
          </div>
        </div>

        <!-- 4. Public Share Links -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Public Links</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ publicLinksCount() }}</p>
            <p class="text-[11px] text-stone-500 mt-1">Active access tokens</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <lucide-icon [img]="Globe" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Recent Files Section with Quick Previews -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-900">Recent Files</h2>
          <a routerLink="/my-files" class="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline inline-flex items-center gap-1">
            <span>View all files</span>
            <lucide-icon [img]="ArrowRight" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
          </a>
        </div>

        <div class="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-xs">
          @for (file of fileService.files().slice(0, 4); track file.id) {
            <div
              (click)="fileService.openFileDetailsModal(file)"
              class="flex items-center justify-between p-4 hover:bg-stone-50 transition cursor-pointer"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  (click)="$event.stopPropagation(); previewFile(file)"
                  class="w-10 h-8 rounded-md overflow-hidden shrink-0 border border-stone-200/80 cursor-pointer group shadow-2xs"
                  title="Quick preview"
                >
                  <app-file-thumbnail [file]="file" size="sm" [showHoverOverlay]="true" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-stone-900 truncate">{{ file.originalName }}</p>
                  <p class="text-xs text-stone-400">{{ file.size | fileSize }} • {{ file.createdAt | date:'short' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span
                  [class]="file.visibility === 'PUBLIC' ? 'bg-emerald-50 text-emerald-700' : (file.visibility === 'SHARED' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600')"
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ file.visibility }}
                </span>
                <button
                  type="button"
                  (click)="$event.stopPropagation(); previewFile(file)"
                  class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                  title="Preview"
                >
                  <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                </button>
                <button
                  type="button"
                  (click)="$event.stopPropagation(); fileService.openShareModal(file)"
                  class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                  title="Share"
                >
                  <lucide-icon [img]="Share2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  readonly fileService = inject(FileService);

  readonly Upload = Upload;
  readonly Folder = Folder;
  readonly Users = Users;
  readonly Share2 = Share2;
  readonly Globe = Globe;
  readonly ArrowRight = ArrowRight;
  readonly Eye = Eye;

  previewFile(file: FileItem) {
    this.fileService.openPreviewModal({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      canDownload: true,
    });
  }

  ngOnInit() {
    this.fileService.refreshAll();
  }

  totalSize = computed(() => {
    return this.fileService.statistics().totalStorageBytes;
  });

  readonly maxQuota = 50 * 1024 * 1024 * 1024; // 50 GB

  videoBytes = computed(() => {
    return this.fileService.files()
      .filter((f) => f.mimeType?.includes('video') || /\.(mp4|mov|avi|mkv)$/i.test(f.originalName))
      .reduce((acc, f) => acc + (f.size || 0), 0);
  });

  pdfBytes = computed(() => {
    return this.fileService.files()
      .filter((f) => f.mimeType?.includes('pdf') || f.originalName.endsWith('.pdf'))
      .reduce((acc, f) => acc + (f.size || 0), 0);
  });

  sheetBytes = computed(() => {
    return this.fileService.files()
      .filter((f) => f.mimeType?.includes('sheet') || f.mimeType?.includes('excel') || /\.(xlsx?|csv)$/i.test(f.originalName))
      .reduce((acc, f) => acc + (f.size || 0), 0);
  });

  otherBytes = computed(() => {
    const total = this.totalSize();
    const sum = this.videoBytes() + this.pdfBytes() + this.sheetBytes();
    return Math.max(0, total - sum);
  });

  videoPct = computed(() => Math.min(100, (this.videoBytes() / this.maxQuota) * 100));
  pdfPct = computed(() => Math.min(100, (this.pdfBytes() / this.maxQuota) * 100));
  sheetPct = computed(() => Math.min(100, (this.sheetBytes() / this.maxQuota) * 100));
  otherPct = computed(() => Math.min(100, (this.otherBytes() / this.maxQuota) * 100));
  freeSpaceBytes = computed(() => Math.max(0, this.maxQuota - this.totalSize()));

  sharedByMeCount = computed(() => {
    return this.fileService.sharedByMeList().length || this.fileService.files().filter((f: FileItem) => f.visibility === 'SHARED').length;
  });

  publicLinksCount = computed(() => {
    return this.fileService.files().filter((f: FileItem) => f.visibility === 'PUBLIC').length;
  });
}
