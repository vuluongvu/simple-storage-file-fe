import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { UploadModalComponent } from '../../shared/components/upload-modal/upload-modal.component';
import { ShareModalComponent } from '../../shared/components/share-modal/share-modal.component';
import { VisibilityModalComponent } from '../../shared/components/visibility-modal/visibility-modal.component';
import { FileDetailsModalComponent } from '../../shared/components/file-details-modal/file-details-modal.component';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    UploadModalComponent,
    ShareModalComponent,
    VisibilityModalComponent,
    FileDetailsModalComponent
  ],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-white text-stone-900 font-sans antialiased">
      <!-- Sidebar (Icon Strip + Tree) -->
      <app-sidebar class="hidden md:flex h-full flex-shrink-0" />

      <!-- Main Content Column -->
      <div class="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <!-- Top Navbar -->
        <app-navbar class="flex-shrink-0" />

        <!-- Router Outlet Scrollable Body -->
        <main class="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <router-outlet />
        </main>
      </div>

      <!-- Global Modals -->
      <app-upload-modal />
      <app-share-modal />
      <app-visibility-modal />
      <app-file-details-modal />
    </div>
  `
})
export class MainLayoutComponent {
  readonly fileService = inject(FileService);
}
