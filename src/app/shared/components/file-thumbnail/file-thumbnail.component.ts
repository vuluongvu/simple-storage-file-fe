import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  FileText,
  FileSpreadsheet,
  Video,
  Music,
  FileCode,
  File,
  Image,
  Eye,
  Play,
} from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-file-thumbnail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="w-full h-full relative overflow-hidden select-none bg-stone-100">
      <!-- 1. IMAGE DISPLAY (Images use the actual image as background) -->
      @if (isImage() && !imageError() && mediaUrl()) {
        <img
          [src]="mediaUrl()"
          [alt]="file()?.originalName || 'Image'"
          (error)="imageError.set(true)"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      }

      <!-- 2. VIDEO DISPLAY (Videos use the video frame as background with play indicator) -->
      @else if (isVideo() && !videoError() && mediaUrl()) {
        <div class="w-full h-full relative overflow-hidden bg-stone-950 flex items-center justify-center">
          <video
            [src]="mediaUrl() + '#t=0.5'"
            preload="metadata"
            muted
            playsinline
            (error)="videoError.set(true)"
            class="w-full h-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
          ></video>

          <!-- Play Button Overlay -->
          <div class="absolute inset-0 bg-stone-950/20 flex items-center justify-center pointer-events-none">
            <div
              [class.w-12]="size() === 'hero'"
              [class.h-12]="size() === 'hero'"
              [class.w-9]="size() === 'lg'"
              [class.h-9]="size() === 'lg'"
              [class.w-6]="size() === 'md'"
              [class.h-6]="size() === 'md'"
              [class.w-5]="size() === 'sm'"
              [class.h-5]="size() === 'sm'"
              class="rounded-full bg-black/55 backdrop-blur-xs flex items-center justify-center text-white shadow-md border border-white/20"
            >
              <lucide-icon
                [img]="Play"
                [class.w-5]="size() === 'hero'"
                [class.h-5]="size() === 'hero'"
                [class.w-4]="size() === 'lg'"
                [class.h-4]="size() === 'lg'"
                [class.w-3]="size() === 'md'"
                [class.h-3]="size() === 'md'"
                [class.w-2.5]="size() === 'sm'"
                [class.h-2.5]="size() === 'sm'"
                class="fill-white ml-0.5"
                [strokeWidth]="0"
              ></lucide-icon>
            </div>
          </div>

          <!-- Video format badge on cards -->
          @if (size() === 'lg' || size() === 'hero') {
            <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs uppercase tracking-wider">
              {{ typeInfo().label }}
            </span>
          }
        </div>
      }

      <!-- 3. DISTINCT FILE BADGE (PDF = PDF, XLSX = XLSX, DOCX = DOCX, etc. instead of "FILE") -->
      @else {
        <!-- 3.1 SMALL SIZE (e.g. Dashboard recent items) -->
        @if (size() === 'sm') {
          <div
            [class]="typeInfo().bgClass + ' ' + typeInfo().borderColor"
            class="w-full h-full flex flex-col items-center justify-center border font-bold"
          >
            <span
              [class]="typeInfo().textColor"
              class="text-[10px] uppercase font-extrabold tracking-wider leading-none"
            >
              {{ typeInfo().label }}
            </span>
          </div>
        }

        <!-- 3.2 MEDIUM SIZE (e.g. File list items) -->
        @else if (size() === 'md') {
          <div
            [class]="typeInfo().bgClass + ' ' + typeInfo().borderColor"
            class="w-full h-full flex items-center justify-center gap-1.5 border px-1"
          >
            <lucide-icon
              [img]="getCategoryIcon(typeInfo().category)"
              class="w-4 h-4 shrink-0"
              [class]="typeInfo().textColor"
              [strokeWidth]="2.2"
            ></lucide-icon>
            <span
              [class]="typeInfo().textColor"
              class="text-[11px] uppercase font-extrabold tracking-wider"
            >
              {{ typeInfo().label }}
            </span>
          </div>
        }

        <!-- 3.3 LARGE SIZE (e.g. Grid view cards) -->
        @else if (size() === 'lg') {
          <div
            [class]="typeInfo().bgClass + ' ' + typeInfo().borderColor"
            class="w-full h-full flex flex-col items-center justify-center gap-2 border p-3"
          >
            <div
              [class]="typeInfo().badgeBgClass"
              class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs"
            >
              <lucide-icon
                [img]="getCategoryIcon(typeInfo().category)"
                class="w-6 h-6"
                [class]="typeInfo().textColor"
                [strokeWidth]="2"
              ></lucide-icon>
            </div>
            <span
              [class]="typeInfo().badgeBgClass"
              class="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-lg border border-black/5"
            >
              {{ typeInfo().label }}
            </span>
          </div>
        }

        <!-- 3.4 HERO SIZE (e.g. FileDetailsModal & PublicFile) -->
        @else {
          <div
            [class]="typeInfo().bgClass"
            class="w-full h-full flex flex-col items-center justify-center gap-3 p-6"
          >
            <div
              [class]="typeInfo().badgeBgClass + ' ' + typeInfo().borderColor"
              class="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xs border"
            >
              <lucide-icon
                [img]="getCategoryIcon(typeInfo().category)"
                class="w-8 h-8"
                [class]="typeInfo().textColor"
                [strokeWidth]="2"
              ></lucide-icon>
            </div>
            <span
              [class]="typeInfo().badgeBgClass + ' ' + typeInfo().borderColor"
              class="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border shadow-2xs"
            >
              {{ typeInfo().label }} DOCUMENT
            </span>
          </div>
        }
      }

      <!-- 4. HOVER OVERLAY (For quick preview) -->
      @if (showHoverOverlay()) {
        <div
          class="absolute inset-0 bg-stone-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs backdrop-blur-2xs z-10"
        >
          <lucide-icon [img]="Eye" class="w-4 h-4" [strokeWidth]="2.5"></lucide-icon>
          @if (size() !== 'sm') {
            <span>Preview</span>
          }
        </div>
      }
    </div>
  `,
})
export class FileThumbnailComponent {
  readonly fileService = inject(FileService);

  // Angular signal inputs for reliable reactivity
  file = input<any>(null);
  size = input<'sm' | 'md' | 'lg' | 'hero'>('md');
  showHoverOverlay = input<boolean>(false);

  readonly Eye = Eye;
  readonly Play = Play;

  imageError = signal(false);
  videoError = signal(false);

  constructor() {
    effect(
      () => {
        // Automatically reset error states when file input updates
        this.file();
        this.imageError.set(false);
        this.videoError.set(false);
      },
      { allowSignalWrites: true }
    );
  }

  isImage = computed(() => {
    return this.fileService.isImageFile(this.file());
  });

  isVideo = computed(() => {
    return this.fileService.isVideoFile(this.file());
  });

  mediaUrl = computed(() => {
    return this.fileService.getFileImageUrl(this.file());
  });

  typeInfo = computed(() => {
    return this.fileService.getFileTypeInfo(this.file());
  });

  getCategoryIcon(category: string) {
    switch (category) {
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
}
