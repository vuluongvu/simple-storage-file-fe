import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Share2, FileText, SlidersHorizontal, Eye } from 'lucide-angular';
import { FileService } from '../../core/services/file.service';
import { FileItem } from '../../core/models/file.model';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { FileThumbnailComponent } from '../../shared/components/file-thumbnail/file-thumbnail.component';

@Component({
  selector: 'app-shared-by-me',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FileSizePipe, FileThumbnailComponent],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto pb-16">
      <!-- Header -->
      <div class="border-b border-stone-200/80 pb-4">
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Shared by me</h1>
        <p class="text-sm text-stone-500 mt-1">Files you have shared with teammates, collaborators, or via public links.</p>
      </div>

      <!-- File List -->
      @if (sharedFiles().length === 0) {
        <div class="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <div class="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <lucide-icon [img]="Share2" class="w-6 h-6" [strokeWidth]="2"></lucide-icon>
          </div>
          <h3 class="text-base font-semibold text-stone-900">No shared files yet</h3>
          <p class="text-xs text-stone-500 mt-1">You haven't shared any of your files yet. Share files easily via email or public link.</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-xs">
          @for (file of sharedFiles(); track file.id) {
            <div
              (click)="fileService.openFileDetailsModal(file)"
              class="group flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-stone-50 transition cursor-pointer gap-4"
            >
              <!-- Left: File Info -->
              <div class="flex items-center gap-4 min-w-0">
                <div
                  (click)="$event.stopPropagation(); openPreview(file)"
                  class="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200/80 cursor-pointer group shadow-2xs relative"
                  title="Quick preview"
                >
                  <app-file-thumbnail [file]="file" size="md" [showHoverOverlay]="true" />
                </div>

                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-stone-900 group-hover:text-blue-600 transition truncate">
                    {{ file.originalName }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                    <span>{{ file.size | fileSize }}</span>
                    <span>•</span>
                    <span class="text-stone-600 font-medium">{{ file.createdAt | date:'shortDate' }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Collaborators badges & Manage Share button -->
              <div class="flex items-center gap-4 flex-shrink-0" (click)="$event.stopPropagation()">
                <!-- Collaborators Avatars Stack -->
                <div class="flex items-center -space-x-1.5">
                  @if (file.collaborators && file.collaborators.length > 0) {
                    @for (c of file.collaborators; track c.id) {
                      <div
                        [class]="c.color || 'bg-stone-300'"
                        class="w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-[9px] text-stone-900 shadow-2xs"
                        [title]="c.name"
                      >
                        {{ c.initials || c.name.slice(0, 2) }}
                      </div>
                    }
                  }
                </div>

                <!-- Preview & Manage Share Buttons -->
                <button
                  type="button"
                  (click)="openPreview(file)"
                  class="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  title="Preview file"
                >
                  <lucide-icon [img]="Eye" class="w-3.5 h-3.5 text-stone-600" [strokeWidth]="2"></lucide-icon>
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  (click)="fileService.openShareModal(file)"
                  class="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <lucide-icon [img]="SlidersHorizontal" class="w-3.5 h-3.5 text-stone-600" [strokeWidth]="2"></lucide-icon>
                  <span>Manage Access</span>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SharedByMeComponent implements OnInit {
  readonly fileService = inject(FileService);
  readonly Share2 = Share2;
  readonly FileText = FileText;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly Eye = Eye;

  openPreview(file: FileItem) {
    this.fileService.openPreviewModal({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      canDownload: true,
    });
  }

  ngOnInit() {
    this.fileService.fetchSharedByMe();
  }

  sharedFiles = computed(() => {
    const list = this.fileService.sharedByMeList();
    if (list.length > 0) return list;
    return this.fileService.files().filter(
      (f: FileItem) => f.visibility === 'SHARED' || (f.collaborators && f.collaborators.length > 0)
    );
  });
}
