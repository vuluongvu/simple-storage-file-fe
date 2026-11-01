import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/services/file.service';
import { ToastService } from '../../core/services/toast.service';
import { SharedWithMeItem } from '../../core/models/share.model';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { FileThumbnailComponent } from '../../shared/components/file-thumbnail/file-thumbnail.component';
import {
  LucideAngularModule,
  Users,
  Download,
  Eye,
  Lock,
  FileText,
} from 'lucide-angular';

@Component({
  selector: 'app-shared-with-me',
  standalone: true,
  imports: [CommonModule, FileSizePipe, LucideAngularModule, FileThumbnailComponent],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto pb-16">
      <!-- Header -->
      <div class="border-b border-stone-200/80 pb-4">
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Shared with me</h1>
        <p class="text-sm text-stone-500 mt-1">Files and documents that colleagues and collaborators have shared with you.</p>
      </div>

      <!-- File List -->
      @if (fileService.sharedWithMeList().length === 0) {
        <div class="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <div class="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mb-3">
            <lucide-icon [img]="Users" class="w-6 h-6" [strokeWidth]="2"></lucide-icon>
          </div>
          <h3 class="text-base font-semibold text-stone-900">No shared files yet</h3>
          <p class="text-xs text-stone-500 mt-1">When someone shares a file with your email, it will appear here.</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-xs">
          @for (item of fileService.sharedWithMeList(); track item.shareId) {
            <div
              (click)="openPreview(item)"
              class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-stone-50 transition cursor-pointer gap-4"
            >
              <!-- Left: File info -->
              <div class="flex items-center gap-4 min-w-0">
                <div
                  (click)="$event.stopPropagation(); openPreview(item)"
                  class="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200/80 cursor-pointer group shadow-2xs relative"
                  title="Quick preview"
                >
                  <app-file-thumbnail [file]="item.file" size="md" [showHoverOverlay]="true" />
                </div>

                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-stone-900 group-hover:text-blue-600 transition truncate">
                    {{ item.file.originalName }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                    <span>{{ item.file.size | fileSize }}</span>
                    <span>•</span>
                    <span>Shared by <strong class="text-stone-700 font-medium">{{ item.file.user?.email || 'alex.design@partner.com' }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Right: Permissions & Actions -->
              <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0" (click)="$event.stopPropagation()">
                <!-- Permission Badge with Lucide Icon -->
                <span
                  [class]="item.permission === 'DOWNLOAD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
                >
                  <lucide-icon
                    [img]="item.permission === 'DOWNLOAD' ? Download : Eye"
                    class="w-3.5 h-3.5"
                    [strokeWidth]="2"
                  ></lucide-icon>
                  <span>{{ item.permission === 'DOWNLOAD' ? 'Can Download' : 'View Only' }}</span>
                </span>

                <!-- Preview Button -->
                <button
                  type="button"
                  (click)="openPreview(item)"
                  class="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  title="Preview file"
                >
                  <lucide-icon [img]="Eye" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                  <span>Preview</span>
                </button>

                <!-- Action Button with Lucide Icon -->
                @if (item.permission === 'DOWNLOAD') {
                  <button
                    type="button"
                    (click)="download(item)"
                    class="px-3 py-1.5 bg-brownblack hover:bg-brownblack-800 text-white text-xs font-medium rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <lucide-icon [img]="Download" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                    <span>Download</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SharedWithMeComponent implements OnInit {
  readonly fileService = inject(FileService);
  private readonly toast = inject(ToastService);

  readonly Users = Users;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly Lock = Lock;
  readonly FileText = FileText;

  ngOnInit() {
    this.fileService.fetchSharedWithMe();
  }

  openPreview(item: SharedWithMeItem) {
    this.fileService.openPreviewModal({
      id: item.file.id,
      originalName: item.file.originalName,
      mimeType: item.file.mimeType,
      size: item.file.size,
      canDownload: item.permission === 'DOWNLOAD',
    });
  }

  download(item: SharedWithMeItem) {
    if (item.permission === 'VIEW') {
      this.toast.error('You only have view permission for this file.');
      return;
    }
    this.fileService.downloadFile(item.file);
    this.toast.success(`Download started: ${item.file.originalName}`);
  }
}
