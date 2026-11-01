import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FilePreviewModalComponent } from './shared/components/file-preview-modal/file-preview-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, FilePreviewModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
