import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { LucideAngularModule, Check, AlertCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in"
          [ngClass]="{
            'bg-emerald-50/95 border-emerald-200 text-emerald-950': toast.type === 'success',
            'bg-rose-50/95 border-rose-200 text-rose-950': toast.type === 'error',
            'bg-blue-50/95 border-blue-200 text-blue-950': toast.type === 'info',
            'bg-amber-50/95 border-amber-200 text-amber-950': toast.type === 'warning'
          }"
        >
          <div class="mt-0.5 shrink-0">
            @if (toast.type === 'success') {
              <lucide-icon [img]="Check" class="w-5 h-5 text-emerald-600" [strokeWidth]="2"></lucide-icon>
            } @else if (toast.type === 'error') {
              <lucide-icon [img]="AlertCircle" class="w-5 h-5 text-rose-600" [strokeWidth]="2"></lucide-icon>
            } @else {
              <lucide-icon [img]="Info" class="w-5 h-5 text-blue-600" [strokeWidth]="2"></lucide-icon>
            }
          </div>

          <div class="flex-1 text-sm">
            @if (toast.title) {
              <p class="font-semibold">{{ toast.title }}</p>
            }
            <p class="text-xs opacity-90 mt-0.5">{{ toast.message }}</p>
          </div>

          <button
            (click)="toastService.remove(toast.id)"
            class="text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
          >
            <lucide-icon [img]="X" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
  readonly Check = Check;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;
  readonly X = X;
}
