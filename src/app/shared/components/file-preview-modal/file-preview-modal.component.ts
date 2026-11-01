import {
  Component,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  LucideAngularModule,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ExternalLink,
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  Video,
  Music,
  FileCode,
  File,
  AlertCircle,
  Eye,
} from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { PreviewFile } from '../../../core/models/file.model';

type FileCategory = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'other';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FileSizePipe],
  template: `
    @if (fileService.isPreviewModalOpen() && fileService.activePreviewFile(); as file) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/70 backdrop-blur-sm animate-fade-in select-none"
        (click)="onBackdropClick($event)"
      >
        <div
          [class.fixed]="isFullscreen()"
          [class.inset-2]="isFullscreen()"
          [class.sm:inset-4]="isFullscreen()"
          [class.w-full]="!isFullscreen()"
          [class.max-w-5xl]="!isFullscreen()"
          [class.h-[90vh]]="!isFullscreen()"
          class="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 transition-all duration-200 animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Header Bar -->
          <header class="px-5 py-3.5 border-b border-stone-200/90 flex items-center justify-between gap-3 bg-white shrink-0">
            <!-- Left: File Icon + Name + Meta Badges -->
            <div class="flex items-center gap-3 min-w-0 pr-2">
              <div
                [class]="typeInfo().badgeBgClass + ' ' + typeInfo().borderColor"
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
              >
                <lucide-icon
                  [img]="getCategoryIcon(typeInfo().category)"
                  class="w-5 h-5"
                  [class]="typeInfo().textColor"
                  [strokeWidth]="2.2"
                ></lucide-icon>
              </div>

              <div class="min-w-0">
                <h3 class="text-sm font-bold text-stone-900 truncate" [title]="file.originalName">
                  {{ file.originalName }}
                </h3>
                <div class="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                  @if (file.size) {
                    <span>{{ file.size | fileSize }}</span>
                    <span>•</span>
                  }
                  <span
                    [class]="typeInfo().badgeBgClass"
                    class="uppercase tracking-wider font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-black/5"
                  >
                    {{ typeInfo().label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Action Controls Bar -->
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <!-- Image Zoom Controls -->
              @if (category() === 'image' && !loading() && !errorMessage()) {
                <div class="hidden sm:flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200/60 mr-1">
                  <button
                    type="button"
                    (click)="zoomOut()"
                    [disabled]="zoom() <= 0.25"
                    class="p-1.5 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Zoom Out (-)"
                  >
                    <lucide-icon [img]="ZoomOut" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                  <span class="text-xs font-mono font-medium px-2 text-stone-700 select-none">
                    {{ Math.round(zoom() * 100) }}%
                  </span>
                  <button
                    type="button"
                    (click)="zoomIn()"
                    [disabled]="zoom() >= 3"
                    class="p-1.5 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Zoom In (+)"
                  >
                    <lucide-icon [img]="ZoomIn" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                  <button
                    type="button"
                    (click)="rotate()"
                    class="p-1.5 rounded-lg hover:bg-white text-stone-600 transition ml-0.5"
                    title="Rotate 90° Clockwise"
                  >
                    <lucide-icon [img]="RotateCw" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                  </button>
                </div>
              }

              <!-- Text Copy Button -->
              @if (category() === 'text' && textContent() && !loading()) {
                <button
                  type="button"
                  (click)="copyTextContent()"
                  class="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition text-xs font-semibold flex items-center gap-1.5"
                  title="Copy text content"
                >
                  <lucide-icon [img]="copied() ? Check : Copy" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                  <span class="hidden sm:inline">{{ copied() ? 'Copied!' : 'Copy' }}</span>
                </button>
              }

              <!-- Open in New Tab (for PDF & Images) -->
              @if ((category() === 'pdf' || category() === 'image') && blobUrl()) {
                <button
                  type="button"
                  (click)="openInNewTab()"
                  class="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition"
                  title="Open in new window"
                >
                  <lucide-icon [img]="ExternalLink" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                </button>
              }

              <!-- Fullscreen Toggle -->
              <button
                type="button"
                (click)="toggleFullscreen()"
                class="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition"
                [title]="isFullscreen() ? 'Exit Fullscreen' : 'Fullscreen'"
              >
                <lucide-icon [img]="isFullscreen() ? Minimize2 : Maximize2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
              </button>

              <!-- Download Button (if permitted) -->
              @if (file.canDownload !== false) {
                <button
                  type="button"
                  (click)="download(file)"
                  class="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                  title="Download file"
                >
                  <lucide-icon [img]="Download" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                  <span class="hidden sm:inline">Download</span>
                </button>
              }

              <!-- Close Button -->
              <button
                type="button"
                (click)="close()"
                class="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                title="Close (Esc)"
              >
                <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
              </button>
            </div>
          </header>

          <!-- Main Preview Area -->
          <main class="flex-1 min-h-0 bg-stone-100/70 overflow-hidden flex items-center justify-center relative p-3 sm:p-5 select-none">
            <!-- 1. LOADING STATE -->
            @if (loading()) {
              <div class="flex flex-col items-center justify-center gap-3 text-stone-500 py-12">
                <div class="w-9 h-9 border-3 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
                <p class="text-xs font-medium">Loading preview...</p>
              </div>
            }

            <!-- 2. ERROR STATE -->
            @else if (errorMessage()) {
              <div class="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-md shadow-sm space-y-3">
                <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <lucide-icon [img]="AlertCircle" class="w-6 h-6" [strokeWidth]="2"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-stone-900">Preview Unavailable</h4>
                  <p class="text-xs text-stone-500 mt-1">{{ errorMessage() }}</p>
                </div>
                <div class="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    (click)="reloadPreview(file)"
                    class="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition"
                  >
                    Retry
                  </button>
                  @if (file.canDownload !== false) {
                    <button
                      type="button"
                      (click)="download(file)"
                      class="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
                    >
                      Download File
                    </button>
                  }
                </div>
              </div>
            }

            <!-- 3. SUCCESS PREVIEWS BY CATEGORY -->
            @else {
              <!-- 3.1 IMAGE PREVIEW -->
              @if (category() === 'image' && blobUrl()) {
                <div class="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img
                    [src]="safeUrl()"
                    [alt]="file.originalName"
                    class="max-w-full max-h-full object-contain rounded-xl shadow-sm transition-transform duration-200"
                    [style.transform]="'scale(' + zoom() + ') rotate(' + rotation() + 'deg)'"
                    [style.transform-origin]="'center center'"
                  />
                </div>
              }

              <!-- 3.2 PDF PREVIEW -->
              @else if (category() === 'pdf' && safeUrl()) {
                <div class="w-full h-full bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm flex flex-col">
                  <object
                    [data]="safeUrl()"
                    type="application/pdf"
                    class="w-full h-full rounded-2xl"
                  >
                    <!-- Fallback if browser PDF plugin is blocked or unavailable -->
                    <div class="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-stone-50">
                      <lucide-icon [img]="FileText" class="w-12 h-12 text-stone-400" [strokeWidth]="2"></lucide-icon>
                      <div>
                        <h4 class="text-sm font-bold text-stone-900">PDF Reader Plugin</h4>
                        <p class="text-xs text-stone-500 mt-1 max-w-sm">
                          Your browser does not embed PDF directly. You can open it in a new window or download it.
                        </p>
                      </div>
                      <div class="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          (click)="openInNewTab()"
                          class="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition flex items-center gap-1.5"
                        >
                          <lucide-icon [img]="ExternalLink" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                          <span>Open PDF in New Window</span>
                        </button>
                      </div>
                    </div>
                  </object>
                </div>
              }

              <!-- 3.3 VIDEO PREVIEW -->
              @else if (category() === 'video' && safeUrl()) {
                <div class="w-full h-full flex items-center justify-center p-2">
                  <video
                    controls
                    playsinline
                    [src]="safeUrl()"
                    class="max-h-full max-w-full rounded-2xl shadow-xl bg-black"
                  >
                    Your browser does not support HTML5 video preview.
                  </video>
                </div>
              }

              <!-- 3.4 AUDIO PREVIEW -->
              @else if (category() === 'audio' && safeUrl()) {
                <div class="bg-white p-8 rounded-3xl border border-stone-200 shadow-md max-w-md w-full space-y-6 text-center">
                  <div class="w-20 h-20 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
                    <lucide-icon [img]="Music" class="w-10 h-10" [strokeWidth]="2"></lucide-icon>
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-stone-900 truncate">{{ file.originalName }}</h4>
                    <p class="text-xs text-stone-400 mt-1">{{ file.size | fileSize }} • Audio Recording</p>
                  </div>
                  <div class="pt-2">
                    <audio controls [src]="safeUrl()" class="w-full focus:outline-none"></audio>
                  </div>
                </div>
              }

              <!-- 3.5 TEXT & CODE PREVIEW -->
              @else if (category() === 'text' && textContent() !== null) {
                <div class="w-full h-full bg-[#18181b] rounded-2xl overflow-hidden border border-stone-800 shadow-lg flex flex-col select-text">
                  <!-- Code Header -->
                  <div class="px-4 py-2.5 bg-[#27272a] border-b border-stone-800 flex items-center justify-between text-xs text-stone-400 select-none">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span class="ml-2 font-mono text-stone-300 font-semibold text-[11px]">{{ file.originalName }}</span>
                    </div>
                    <span class="text-[11px] font-mono text-stone-400">
                      {{ textLinesCount() }} lines
                    </span>
                  </div>

                  <!-- Code Content -->
                  <div class="flex-1 overflow-auto p-4 sm:p-5 font-mono text-xs leading-relaxed text-stone-100">
                    <pre class="whitespace-pre-wrap break-words"><code>{{ textContent() }}</code></pre>
                  </div>
                </div>
              }

              <!-- 3.6 OTHER / UNPREVIEWABLE FILE TYPE FALLBACK -->
              @else {
                <div class="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 text-center max-w-md w-full shadow-md space-y-5">
                  <div
                    [class]="typeInfo().badgeBgClass + ' ' + typeInfo().borderColor"
                    class="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border shadow-xs"
                  >
                    <lucide-icon
                      [img]="getCategoryIcon(typeInfo().category)"
                      class="w-8 h-8"
                      [class]="typeInfo().textColor"
                      [strokeWidth]="2"
                    ></lucide-icon>
                  </div>

                  <div>
                    <span
                      [class]="typeInfo().badgeBgClass + ' ' + typeInfo().borderColor"
                      class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-2xs"
                    >
                      {{ typeInfo().label }} DOCUMENT
                    </span>
                    <h4 class="text-base font-bold text-stone-900 mt-2.5 truncate" [title]="file.originalName">
                      {{ file.originalName }}
                    </h4>
                    <p class="text-xs text-stone-500 mt-1">
                      {{ file.size | fileSize }} • {{ file.mimeType || 'Application binary' }}
                    </p>
                    <p class="text-xs text-stone-400 mt-3 max-w-xs mx-auto">
                      Inline browser preview is not supported for this file type. You can download the file to view it on your device.
                    </p>
                  </div>

                  @if (file.canDownload !== false) {
                    <div class="pt-2">
                      <button
                        type="button"
                        (click)="download(file)"
                        class="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-2xl transition shadow-xs flex items-center justify-center gap-2"
                      >
                        <lucide-icon [img]="Download" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                        <span>Download to view ({{ file.size | fileSize }})</span>
                      </button>
                    </div>
                  }
                </div>
              }
            }
          </main>
        </div>
      </div>
    }
  `,
})
export class FilePreviewModalComponent implements OnDestroy {
  readonly fileService = inject(FileService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly Math = Math;

  // Lucide Icons
  readonly X = X;
  readonly ZoomIn = ZoomIn;
  readonly ZoomOut = ZoomOut;
  readonly RotateCw = RotateCw;
  readonly Maximize2 = Maximize2;
  readonly Minimize2 = Minimize2;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly ExternalLink = ExternalLink;
  readonly Download = Download;
  readonly FileText = FileText;
  readonly Image = Image;
  readonly Video = Video;
  readonly Music = Music;
  readonly FileCode = FileCode;
  readonly File = File;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly AlertCircle = AlertCircle;
  readonly Eye = Eye;

  typeInfo = computed(() => {
    return this.fileService.getFileTypeInfo(this.fileService.activePreviewFile());
  });

  // State Signals
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  blobUrl = signal<string | null>(null);
  safeUrl = signal<SafeResourceUrl | null>(null);
  textContent = signal<string | null>(null);
  textLinesCount = signal<number>(0);
  category = signal<FileCategory>('other');
  zoom = signal<number>(1);
  rotation = signal<number>(0);
  isFullscreen = signal<boolean>(false);
  copied = signal<boolean>(false);

  private currentBlobUrl: string | null = null;
  private currentRawBlob: Blob | null = null;

  constructor() {
    effect(
      () => {
        const isOpen = this.fileService.isPreviewModalOpen();
        const activeFile = this.fileService.activePreviewFile();

        if (isOpen && activeFile) {
          this.loadPreview(activeFile);
        } else {
          this.cleanupBlob();
        }
      },
      { allowSignalWrites: true }
    );
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.fileService.isPreviewModalOpen()) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent) {
    this.close();
  }

  close() {
    this.fileService.closePreviewModal();
    this.cleanupBlob();
  }

  private cleanupBlob() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.blobUrl.set(null);
    this.safeUrl.set(null);
    this.textContent.set(null);
    this.currentRawBlob = null;
    this.zoom.set(1);
    this.rotation.set(0);
    this.isFullscreen.set(false);
  }

  ngOnDestroy() {
    this.cleanupBlob();
  }

  private detectCategory(mimeType: string, filename: string): FileCategory {
    const ext = this.getFileExtension(filename).toLowerCase();
    const mime = (mimeType || '').toLowerCase();

    // Office documents, compressed archives, and binary files are NOT plain text
    if (
      ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'zip', 'rar', '7z', 'tar', 'gz', 'exe', 'bin'].includes(ext) ||
      mime.includes('officedocument') ||
      mime.includes('msword') ||
      mime.includes('ms-excel') ||
      mime.includes('ms-powerpoint') ||
      mime.includes('zip')
    ) {
      return 'other';
    }

    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
      return 'image';
    }
    if (mime.includes('pdf') || ext === 'pdf') {
      return 'pdf';
    }
    if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'].includes(ext)) {
      return 'video';
    }
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext)) {
      return 'audio';
    }
    if (
      mime.startsWith('text/') ||
      mime === 'application/json' ||
      mime === 'application/xml' ||
      mime === 'text/xml' ||
      mime.includes('javascript') ||
      mime.includes('typescript') ||
      [
        'txt', 'md', 'markdown', 'json', 'csv', 'ts', 'js', 'jsx', 'tsx',
        'html', 'htm', 'css', 'scss', 'xml', 'yaml', 'yml', 'log',
        'sh', 'bash', 'py', 'java', 'c', 'cpp', 'h', 'sql', 'env'
      ].includes(ext)
    ) {
      return 'text';
    }
    return 'other';
  }

  getFileExtension(name?: string): string {
    if (!name) return 'FILE';
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() || 'FILE' : 'FILE';
  }

  getCategoryIcon(cat: string) {
    switch (cat) {
      case 'image':
        return Image;
      case 'pdf':
      case 'doc':
      case 'slide':
      case 'text':
        return FileText;
      case 'sheet':
        return FileSpreadsheet;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'code':
        return FileCode;
      default:
        return File;
    }
  }

  reloadPreview(file: PreviewFile) {
    this.loadPreview(file);
  }

  async loadPreview(file: PreviewFile) {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.cleanupBlob();

    const cat = this.detectCategory(file.mimeType, file.originalName);
    this.category.set(cat);

    // If "other" category that browser definitely cannot render inline
    if (cat === 'other') {
      this.loading.set(false);
      return;
    }

    try {
      let blob: Blob;
      if (file.token) {
        blob = await this.fileService.getPublicPreviewBlob(file.token);
      } else if (file.id) {
        blob = await this.fileService.getPreviewBlob(file.id);
      } else {
        throw new Error('No valid file identifier provided.');
      }

      this.currentRawBlob = blob;

      if (cat === 'text') {
        const text = await blob.text();
        this.textContent.set(text);
        const lines = text.split('\n').length;
        this.textLinesCount.set(lines);
      } else {
        const url = URL.createObjectURL(blob);
        this.currentBlobUrl = url;
        this.blobUrl.set(url);
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }

      this.loading.set(false);
    } catch (err: any) {
      console.error('Failed to load preview blob', err);
      this.errorMessage.set(
        err?.error?.message ||
        err?.message ||
        'Unable to load preview for this file. You may download it to view.'
      );
      this.loading.set(false);
    }
  }

  zoomIn() {
    this.zoom.update((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  }

  zoomOut() {
    this.zoom.update((z) => Math.max(0.25, +(z - 0.25).toFixed(2)));
  }

  rotate() {
    this.rotation.update((r) => (r + 90) % 360);
  }

  toggleFullscreen() {
    this.isFullscreen.update((f) => !f);
  }

  async copyTextContent() {
    const text = this.textContent();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      this.toast.success('File content copied to clipboard');
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      this.toast.error('Failed to copy to clipboard');
    }
  }

  openInNewTab() {
    const url = this.blobUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  download(file: PreviewFile) {
    if (this.currentRawBlob) {
      // Direct instant download from in-memory blob
      const url = URL.createObjectURL(this.currentRawBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.toast.success(`Download started: ${file.originalName}`);
    } else if (file.token) {
      this.fileService.downloadPublicFile(file.token, file.originalName);
    } else if (file.id) {
      this.fileService.downloadFile(file as any);
      this.toast.success(`Download started: ${file.originalName}`);
    }
  }
}
