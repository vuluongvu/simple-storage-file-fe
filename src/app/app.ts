import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FilePreviewModalComponent } from './shared/components/file-preview-modal/file-preview-modal.component';
import { CreateFolderModalComponent } from './shared/components/create-folder-modal/create-folder-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, FilePreviewModalComponent, CreateFolderModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
