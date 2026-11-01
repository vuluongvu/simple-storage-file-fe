import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Lock, Users, Globe } from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';
import { FileVisibility } from '../../../core/models/file.model';

@Component({
  selector: 'app-visibility-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (fileService.isVisibilityModalOpen() && fileService.activeVisibilityFile(); as file) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 border border-stone-100 animate-scale-up">
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 class="text-xl font-bold text-stone-900">Access Mode</h3>
              <p class="text-sm text-stone-500 mt-0.5 truncate max-w-xs">{{ file.originalName }}</p>
            </div>
            <button
              (click)="fileService.closeVisibilityModal()"
              class="text-stone-400 hover:text-stone-600 rounded-xl p-1.5 transition-colors"
            >
              <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
            </button>
          </div>

          <!-- Options -->
          <div class="mt-5 space-y-3">
            <!-- Private -->
            <div
              (click)="selectedVisibility.set('PRIVATE')"
              [class.border-brownblack]="selectedVisibility() === 'PRIVATE'"
              [class.bg-stone-50]="selectedVisibility() === 'PRIVATE'"
              class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 hover:border-stone-400"
            >
              <div class="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700 mt-0.5">
                <lucide-icon [img]="Lock" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-[15px] font-bold text-stone-900">PRIVATE</p>
                  @if (selectedVisibility() === 'PRIVATE') {
                    <span class="w-3 h-3 rounded-full bg-brownblack"></span>
                  }
                </div>
                <p class="text-[13px] text-stone-500 mt-1">Only you can view, download, and manage this file.</p>
              </div>
            </div>

            <!-- Shared -->
            <div
              (click)="selectedVisibility.set('SHARED')"
              [class.border-brownblack]="selectedVisibility() === 'SHARED'"
              [class.bg-stone-50]="selectedVisibility() === 'SHARED'"
              class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 hover:border-stone-400"
            >
              <div class="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700 mt-0.5">
                <lucide-icon [img]="Users" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-[15px] font-bold text-stone-900">SHARED</p>
                  @if (selectedVisibility() === 'SHARED') {
                    <span class="w-3 h-3 rounded-full bg-brownblack"></span>
                  }
                </div>
                <p class="text-[13px] text-stone-500 mt-1">Accessible to you and people you specifically invite via email with VIEW or DOWNLOAD permissions.</p>
              </div>
            </div>

            <!-- Public -->
            <div
              (click)="selectedVisibility.set('PUBLIC')"
              [class.border-brownblack]="selectedVisibility() === 'PUBLIC'"
              [class.bg-stone-50]="selectedVisibility() === 'PUBLIC'"
              class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 hover:border-stone-400"
            >
              <div class="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700 mt-0.5">
                <lucide-icon [img]="Globe" class="w-4.5 h-4.5" [strokeWidth]="2"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-[15px] font-bold text-stone-900">PUBLIC</p>
                  @if (selectedVisibility() === 'PUBLIC') {
                    <span class="w-3 h-3 rounded-full bg-brownblack"></span>
                  }
                </div>
                <p class="text-[13px] text-stone-500 mt-1">Anyone with the public share link can access and download this file without an account.</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-7 flex justify-end gap-3">
            <button
              type="button"
              (click)="fileService.closeVisibilityModal()"
              class="px-5 py-2.5 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveVisibility(file.id)"
              class="px-6 py-2.5 bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-sm"
            >
              Update Access
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class VisibilityModalComponent {
  readonly fileService = inject(FileService);
  readonly X = X;
  readonly Lock = Lock;
  readonly Users = Users;
  readonly Globe = Globe;

  selectedVisibility = signal<FileVisibility>('PRIVATE');

  constructor() {
    effect(() => {
      const file = this.fileService.activeVisibilityFile();
      if (file) {
        this.selectedVisibility.set(file.visibility);
      }
    });
  }

  async saveVisibility(fileId: number) {
    await this.fileService.updateVisibility(fileId, this.selectedVisibility());
    this.fileService.closeVisibilityModal();
  }
}
