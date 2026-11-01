import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FileService } from '../../core/services/file.service';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  Home,
  Folder,
  LayoutDashboard,
  Users,
  Share2,
  Upload,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  FileSpreadsheet,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="flex h-full select-none">
      <!-- 1. LEFT ICON RAIL (Minimalist SaaS rail) -->
      <aside class="w-14 flex-shrink-0 bg-[#f7f5f2] border-r border-stone-200/70 flex flex-col items-center py-4 justify-between">
        <div class="flex flex-col items-center gap-6">
          <!-- Logo -->
          <a routerLink="/my-files" class="w-8 h-8 flex items-center justify-center text-stone-900 hover:opacity-80 transition-opacity" title="Simple File Storage">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3.5l6 3.8-6 3.8-6-3.8 6-3.8zm12 0l6 3.8-6 3.8-6-3.8 6-3.8zM0 14.9l6 3.8 6-3.8-6-3.8-6 3.8zm24 0l-6 3.8-6-3.8 6-3.8 6 3.8zM12 16.3l6-3.8 6 3.8-6 3.8-6-3.8z"/>
              <path d="M6 19.3l6 3.8 6-3.8-6-3.8-6 3.8z"/>
            </svg>
          </a>

          <!-- Icon Rail Navigation -->
          <nav class="flex flex-col items-center gap-2">
            <a
              routerLink="/my-files"
              routerLinkActive="bg-stone-200/70 text-stone-900 shadow-sm"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
              title="All files"
            >
              <lucide-icon [img]="Home" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
            </a>

            <a
              routerLink="/dashboard"
              routerLinkActive="bg-stone-200/70 text-stone-900 shadow-sm"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
              title="Dashboard"
            >
              <lucide-icon [img]="LayoutDashboard" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
            </a>

            <a
              routerLink="/shared-with-me"
              routerLinkActive="bg-stone-200/70 text-stone-900 shadow-sm"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
              title="Shared with me"
            >
              <lucide-icon [img]="Users" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
            </a>

            <a
              routerLink="/shared-by-me"
              routerLinkActive="bg-stone-200/70 text-stone-900 shadow-sm"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
              title="Shared by me"
            >
              <lucide-icon [img]="Share2" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
            </a>
          </nav>
        </div>

        <!-- Rail Bottom Upload Icon -->
        <button
          (click)="fileService.openUploadModal()"
          class="w-9 h-9 rounded-xl bg-white border border-stone-200/90 text-stone-700 flex items-center justify-center hover:bg-stone-50 transition shadow-2xs"
          title="Upload file"
        >
          <lucide-icon [img]="Upload" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
        </button>
      </aside>

      <!-- 2. SECONDARY SIDEBAR (Home, Starred, Folders, Storage) -->
      <aside class="w-56 md:w-60 bg-[#f7f5f2] border-r border-stone-200/70 flex flex-col justify-between p-4 overflow-y-auto">
        <div class="space-y-6">
          <!-- Section Header -->
          <div class="px-2 pt-1">
            <h1 class="text-xl font-bold tracking-tight text-stone-900">Home</h1>
          </div>

          <!-- Primary Navigation Links -->
          <nav class="space-y-1">
            <a
              routerLink="/my-files"
              routerLinkActive="bg-[#e9e6e0] text-stone-900 font-semibold shadow-xs"
              class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 hover:bg-[#eae7e2] transition-colors"
            >
              <lucide-icon [img]="Folder" class="w-4 h-4 text-stone-800" [strokeWidth]="2"></lucide-icon>
              <span>All files</span>
            </a>

            <a
              routerLink="/dashboard"
              routerLinkActive="bg-[#e9e6e0] text-stone-900 font-semibold"
              class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-[#eae7e2] transition-colors"
            >
              <lucide-icon [img]="LayoutDashboard" class="w-4 h-4 text-stone-500 group-hover:text-stone-800" [strokeWidth]="2"></lucide-icon>
              <span>Dashboard</span>
            </a>

            <a
              routerLink="/shared-with-me"
              routerLinkActive="bg-[#e9e6e0] text-stone-900 font-semibold"
              class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-[#eae7e2] transition-colors"
            >
              <lucide-icon [img]="Users" class="w-4 h-4 text-stone-500 group-hover:text-stone-800" [strokeWidth]="2"></lucide-icon>
              <span>Shared with me</span>
            </a>

            <a
              routerLink="/shared-by-me"
              routerLinkActive="bg-[#e9e6e0] text-stone-900 font-semibold"
              class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-[#eae7e2] transition-colors"
            >
              <lucide-icon [img]="Share2" class="w-4 h-4 text-stone-500 group-hover:text-stone-800" [strokeWidth]="2"></lucide-icon>
              <span>Shared by me</span>
            </a>
          </nav>

          <!-- Starred Section (Collapsible) -->
          <div class="space-y-1">
            <button
              (click)="starredOpen.set(!starredOpen())"
              class="flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition"
            >
              <lucide-icon
                [img]="starredOpen() ? ChevronDown : ChevronRight"
                class="w-3.5 h-3.5 text-stone-500"
                [strokeWidth]="2"
              ></lucide-icon>
              <span>Recent Files</span>
            </button>

            @if (starredOpen()) {
              <div class="space-y-0.5 pl-1 pt-1">
                @for (file of fileService.files().slice(0, 4); track file.id) {
                  <button
                    (click)="fileService.openFileDetailsModal(file)"
                    class="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-[#eae7e2] transition text-left truncate group"
                  >
                    <span class="w-4.5 h-4.5 rounded bg-stone-200/80 text-stone-700 flex items-center justify-center flex-shrink-0 group-hover:bg-brownblack group-hover:text-white transition">
                      <lucide-icon [img]="getFileIcon(file.mimeType)" class="w-3 h-3" [strokeWidth]="2"></lucide-icon>
                    </span>
                    <span class="truncate">{{ file.originalName }}</span>
                  </button>
                } @empty {
                  <span class="text-xs text-stone-400 px-2 py-1 block">No files uploaded yet</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Storage Usage Meter at Bottom -->
        <div class="pt-4 border-t border-stone-200/60 mt-4 space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="font-medium text-stone-600">Storage</span>
            <span class="text-stone-500 font-medium">{{ usedPercentageLabel() }}</span>
          </div>
          <div class="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-brownblack h-1.5 rounded-full transition-all duration-300"
              [style.width.%]="progressBarWidth()"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-stone-500">
            <span class="font-medium text-stone-600">{{ formattedUsed() }} of 50 GB</span>
            <a routerLink="/dashboard" class="text-stone-700 hover:text-stone-950 hover:underline font-semibold transition-colors">Dashboard</a>
          </div>
        </div>
      </aside>
    </div>
  `
})
export class SidebarComponent {
  readonly fileService = inject(FileService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  starredOpen = signal(true);

  readonly Home = Home;
  readonly Folder = Folder;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly Share2 = Share2;
  readonly Upload = Upload;
  readonly ChevronDown = ChevronDown;
  readonly ChevronRight = ChevronRight;
  readonly Video = Video;
  readonly FileText = FileText;
  readonly FileSpreadsheet = FileSpreadsheet;

  formattedUsed = computed(() => {
    const bytes = this.fileService.statistics().totalStorageBytes;
    if (bytes <= 0) return '0 B';
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    if (bytes < k * k * k) return `${(bytes / (k * k)).toFixed(1)} MB`;
    return `${(bytes / (k * k * k)).toFixed(2)} GB`;
  });

  usedPercentageLabel = computed(() => {
    const total = this.fileService.statistics().totalStorageBytes;
    if (total <= 0) return '0% used';
    const pct = (total / (50 * 1024 * 1024 * 1024)) * 100;
    if (pct < 0.1) return '< 0.1% used';
    if (pct < 1) return '< 1% used';
    return `${Math.round(pct)}% used`;
  });

  progressBarWidth = computed(() => {
    const total = this.fileService.statistics().totalStorageBytes;
    if (total <= 0) return 0;
    const pct = (total / (50 * 1024 * 1024 * 1024)) * 100;
    // Minimum 3.5% visual width so small files render visibly on the bar
    return Math.max(3.5, Math.min(100, pct));
  });

  getFileIcon(mimeType: string) {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('video')) return Video;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
    return FileText;
  }
}
