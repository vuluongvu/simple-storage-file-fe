import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#f7f5f2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo -->
        <div class="w-14 h-14 mx-auto text-stone-900 flex items-center justify-center">
          <svg class="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 3.5l6 3.8-6 3.8-6-3.8 6-3.8zm12 0l6 3.8-6 3.8-6-3.8 6-3.8zM0 14.9l6 3.8 6-3.8-6-3.8-6 3.8zm24 0l-6 3.8-6-3.8 6-3.8 6 3.8zM12 16.3l6-3.8 6 3.8-6 3.8-6-3.8z"/>
            <path d="M6 19.3l6 3.8 6-3.8-6-3.8-6 3.8z"/>
          </svg>
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-stone-900">Create your account</h2>
        <p class="mt-1.5 text-sm text-stone-500 font-medium">Get 50 GB free storage for your files and documents</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm rounded-3xl border border-stone-200/90 sm:px-10 space-y-6">
          <form (ngSubmit)="onSubmit()" class="space-y-4.5">
            <div>
              <label for="email" class="block text-sm font-bold text-stone-700">Work or personal email</label>
              <div class="mt-1.5">
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-bold text-stone-700">Password</label>
              <div class="mt-1.5">
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-bold text-stone-700">Confirm Password</label>
              <div class="mt-1.5">
                <input
                  id="confirmPassword"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Repeat your password"
                  class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3 px-4 bg-brownblack hover:bg-brownblack-800 text-white text-base font-semibold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              } @else {
                <span>Create Account</span>
              }
            </button>
          </form>

          <div class="text-center text-sm text-stone-500 pt-2 font-medium">
            Already have an account?
            <a routerLink="/auth/login" class="font-bold text-stone-900 hover:underline">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);

  onSubmit() {
    if (!this.email || !this.password) {
      this.toast.error('Please enter email and password.');
      return;
    }

    if (this.password.length < 6) {
      this.toast.error('Password must be at least 6 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.error('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.auth
      .register(this.email, this.password)
      .then(() => {
        this.loading.set(false);
        this.toast.success('Registration successful! Welcome to Simple File Storage.');
        this.router.navigate(['/my-files']);
      })
      .catch((err: any) => {
        this.loading.set(false);
        this.toast.error(err?.message || 'Registration failed');
      });
  }
}
