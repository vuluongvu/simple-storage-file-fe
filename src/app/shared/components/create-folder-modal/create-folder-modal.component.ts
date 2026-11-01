import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FolderPlus, X } from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-create-folder-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (fileService.isCreateFolderModalOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-sm animate-fade-in"
        (click)="close()"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-stone-100 animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-2xs">
                <lucide-icon [img]="FolderPlus" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-stone-900">New Folder</h3>
                <p class="text-xs text-stone-400 mt-0.5">
                  Inside: <span class="font-semibold text-stone-600">{{ fileService.currentFolder()?.name || 'My Files (Root)' }}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="text-stone-400 hover:text-stone-600 rounded-xl p-1.5 transition-colors"
            >
              <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
            </button>
          </div>

          <!-- Body Form -->
          <form (ngSubmit)="onSubmit()" class="mt-5 space-y-4">
            <div>
              <label for="parentFolder" class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Create Inside (Vị trí thư mục cha)
              </label>
              <select
                id="parentFolder"
                [(ngModel)]="selectedParentId"
                name="parentFolder"
                class="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition bg-white cursor-pointer"
              >
                <option [ngValue]="null">📁 My Files (Root)</option>
                @for (f of fileService.formattedFolderList(); track f.id) {
                  <option [ngValue]="f.id">
                    {{ '— '.repeat(f.level) }}📁 {{ f.name }} ({{ f.path }})
                  </option>
                }
              </select>
            </div>

            <div>
              <label for="folderName" class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Folder Name
              </label>
              <input
                #nameInput
                id="folderName"
                type="text"
                [(ngModel)]="folderName"
                name="folderName"
                required
                placeholder="e.g. Work Documents, Photos, Project A"
                class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>

            <!-- Actions -->
            <div class="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="close()"
                class="px-5 py-2.5 rounded-2xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!folderName.trim() || isSubmitting()"
                class="px-6 py-2.5 rounded-2xl bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-2"
              >
                @if (isSubmitting()) {
                  <span>Creating...</span>
                } @else {
                  <span>Create Folder</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CreateFolderModalComponent {
  readonly fileService = inject(FileService);
  readonly FolderPlus = FolderPlus;
  readonly X = X;

  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  folderName = '';
  selectedParentId: number | null = null;
  isSubmitting = signal(false);

  constructor() {
    effect(() => {
      if (this.fileService.isCreateFolderModalOpen()) {
        this.folderName = '';
        this.selectedParentId = this.fileService.currentFolder()?.id || null;
        setTimeout(() => {
          this.nameInput?.nativeElement?.focus();
        }, 100);
      }
    });
  }

  close() {
    this.fileService.closeCreateFolderModal();
    this.folderName = '';
    this.isSubmitting.set(false);
  }

  async onSubmit() {
    const name = this.folderName.trim();
    if (!name) return;

    this.isSubmitting.set(true);
    try {
      await this.fileService.createFolder(name, this.selectedParentId);
      this.close();
    } catch {
      this.isSubmitting.set(false);
    }
  }
}
