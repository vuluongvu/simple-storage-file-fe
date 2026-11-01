import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';
import {
  LucideAngularModule,
  Menu,
  Search,
  X,
  LayoutGrid,
  Folder,
  BarChart2,
  Users,
  LayoutDashboard,
  LogOut,
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <header class="h-16 px-6 bg-white border-b border-stone-100 flex items-center justify-between gap-4 select-none">
      <!-- Left: Mobile Menu Toggle & Search Bar -->
      <div class="flex items-center gap-4 flex-1 max-w-2xl">
        <!-- Hamburger Menu Button -->
        <button
          type="button"
          (click)="toggleMenu.emit()"
          class="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition lg:hidden"
          title="Toggle Navigation"
        >
          <lucide-icon [img]="Menu" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
        </button>

        <!-- Search Bar (Pill style strictly matching screenshot) -->
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <lucide-icon [img]="Search" class="w-4 h-4 text-stone-400" [strokeWidth]="2"></lucide-icon>
          </div>
          <input
            type="text"
            [ngModel]="fileService.searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search"
            class="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-sm placeholder-stone-400 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
          />
          @if (fileService.searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
            >
              <lucide-icon [img]="X" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
            </button>
          }
        </div>
      </div>

      <!-- Right: App Grid & User Profile Avatar -->
      <div class="flex items-center gap-3 relative">
        <!-- 9-Dots Grid Launcher Icon (Matches screenshot) -->
        <button
          type="button"
          (click)="showAppsModal.set(!showAppsModal())"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
          title="Apps & Integrations"
        >
          <lucide-icon [img]="LayoutGrid" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
        </button>

        <!-- Apps Popup -->
        @if (showAppsModal()) {
          <div class="absolute right-12 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 z-50 animate-in fade-in">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-stone-400 px-2 py-1">Tools & Shortcuts</h4>
            <div class="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <a routerLink="/my-files" (click)="showAppsModal.set(false)" class="p-2.5 rounded-xl hover:bg-stone-50 flex flex-col items-center gap-1.5 text-stone-700">
                <lucide-icon [img]="Folder" class="w-5 h-5 text-stone-600" [strokeWidth]="2"></lucide-icon>
                <span class="truncate w-full text-[11px] font-medium">Drive</span>
              </a>
              <a routerLink="/dashboard" (click)="showAppsModal.set(false)" class="p-2.5 rounded-xl hover:bg-stone-50 flex flex-col items-center gap-1.5 text-stone-700">
                <lucide-icon [img]="BarChart2" class="w-5 h-5 text-stone-600" [strokeWidth]="2"></lucide-icon>
                <span class="truncate w-full text-[11px] font-medium">Metrics</span>
              </a>
              <a routerLink="/shared-with-me" (click)="showAppsModal.set(false)" class="p-2.5 rounded-xl hover:bg-stone-50 flex flex-col items-center gap-1.5 text-stone-700">
                <lucide-icon [img]="Users" class="w-5 h-5 text-stone-600" [strokeWidth]="2"></lucide-icon>
                <span class="truncate w-full text-[11px] font-medium">Sharing</span>
              </a>
            </div>
          </div>
        }

        <!-- User Profile Avatar -->
        <div class="relative">
          <button
            type="button"
            (click)="showProfileMenu.set(!showProfileMenu())"
            class="relative flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 rounded-full"
          >
            <div class="w-9 h-9 rounded-full ring-2 ring-stone-200 overflow-hidden bg-brownblack text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {{ (authService.currentUser()?.fullName || authService.currentUser()?.email || 'U').slice(0, 2).toUpperCase() }}
            </div>
          </button>

          <!-- User Dropdown Menu -->
          @if (showProfileMenu()) {
            <div class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in">
              <div class="px-4 py-3 border-b border-stone-100">
                <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Signed in as</p>
                <p class="text-sm font-bold text-stone-900 truncate">{{ authService.currentUser()?.email }}</p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Storage Cloud Plan
                  </span>
                </div>
              </div>

              <div class="py-1">
                <a
                  routerLink="/dashboard"
                  (click)="showProfileMenu.set(false)"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
                >
                  <lucide-icon [img]="LayoutDashboard" class="w-4 h-4 text-stone-500" [strokeWidth]="2"></lucide-icon>
                  <span>Dashboard & Storage</span>
                </a>
                <a
                  routerLink="/my-files"
                  (click)="showProfileMenu.set(false)"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
                >
                  <lucide-icon [img]="Folder" class="w-4 h-4 text-stone-500" [strokeWidth]="2"></lucide-icon>
                  <span>My Files</span>
                </a>
              </div>

              <div class="border-t border-stone-100 pt-1">
                <button
                  type="button"
                  (click)="logout()"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <lucide-icon [img]="LogOut" class="w-4 h-4 text-rose-500" [strokeWidth]="2"></lucide-icon>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly fileService = inject(FileService);
  private readonly router = inject(Router);

  @Output() toggleMenu = new EventEmitter<void>();

  showProfileMenu = signal(false);
  showAppsModal = signal(false);

  readonly Menu = Menu;
  readonly Search = Search;
  readonly X = X;
  readonly LayoutGrid = LayoutGrid;
  readonly Folder = Folder;
  readonly BarChart2 = BarChart2;
  readonly Users = Users;
  readonly LayoutDashboard = LayoutDashboard;
  readonly LogOut = LogOut;

  onSearchChange(query: string) {
    this.fileService.searchQuery.set(query);
    if (this.router.url !== '/my-files' && query.trim()) {
      this.router.navigate(['/my-files']);
    }
  }

  clearSearch() {
    this.fileService.searchQuery.set('');
  }

  onAvatarError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  logout() {
    this.showProfileMenu.set(false);
    this.authService.logout();
  }
}
