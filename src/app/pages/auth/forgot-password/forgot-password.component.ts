import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
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
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-stone-900">
          {{ step() === 1 ? 'Reset your password' : 'Set a new password' }}
        </h2>
        <p class="mt-1.5 text-sm text-stone-500 font-medium">
          {{ step() === 1 ? 'Enter your account email to receive a verification code' : 'Enter the verification code from your email and create a new password' }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm rounded-3xl border border-stone-200/90 sm:px-10 space-y-6">

          <!-- STEP 1: ENTER EMAIL TO REQUEST RESET CODE -->
          @if (step() === 1) {
            <form (ngSubmit)="onRequestCode()" class="space-y-4.5">
              <div>
                <label for="email" class="block text-sm font-bold text-stone-700">Email address</label>
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

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full py-3 px-4 bg-brownblack hover:bg-brownblack-800 text-white text-base font-semibold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                @if (loading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending reset code...</span>
                } @else {
                  <span>Send reset code</span>
                }
              </button>

              <div class="pt-2 text-center">
                <button
                  type="button"
                  (click)="step.set(2)"
                  class="text-xs text-stone-500 hover:text-stone-900 font-semibold hover:underline cursor-pointer"
                >
                  Already have a reset code? Click here to enter code
                </button>
              </div>
            </form>
          }

          <!-- STEP 2: ENTER OTP CODE & NEW PASSWORD -->
          @if (step() === 2) {
            <div class="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-600 flex items-start gap-2.5">
              <span class="text-base leading-none">✉️</span>
              <div>
                Verification code sent to: <strong class="text-stone-900">{{ email || 'your email' }}</strong>.
                <button
                  type="button"
                  (click)="step.set(1)"
                  class="text-stone-900 font-bold underline ml-1 hover:text-black cursor-pointer"
                >
                  Change email
                </button>
              </div>
            </div>

            <form (ngSubmit)="onResetPassword()" class="space-y-4">
              <div>
                <label for="token" class="block text-sm font-bold text-stone-700">Verification code (OTP / Token)</label>
                <div class="mt-1.5">
                  <input
                    id="token"
                    type="text"
                    [(ngModel)]="token"
                    name="token"
                    required
                    placeholder="Enter 6-digit code or token"
                    class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <label for="newPassword" class="block text-sm font-bold text-stone-700">New password</label>
                  <span class="text-xs text-stone-400 font-medium">Min 6 characters</span>
                </div>
                <div class="mt-1.5">
                  <input
                    id="newPassword"
                    type="password"
                    [(ngModel)]="newPassword"
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-bold text-stone-700">Confirm new password</label>
                <div class="mt-1.5">
                  <input
                    id="confirmPassword"
                    type="password"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full py-3 px-4 bg-brownblack hover:bg-brownblack-800 text-white text-base font-semibold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                @if (loading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resetting password...</span>
                } @else {
                  <span>Reset Password</span>
                }
              </button>

              <div class="text-center pt-2">
                <button
                  type="button"
                  [disabled]="resending()"
                  (click)="onResendCode()"
                  class="text-xs text-stone-500 hover:text-stone-900 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {{ resending() ? 'Resending code...' : "Didn't receive code? Resend code" }}
                </button>
              </div>
            </form>
          }

          <div class="border-t border-stone-100 pt-4 text-center text-sm text-stone-500 font-medium">
            <a routerLink="/auth/login" class="font-bold text-stone-900 hover:underline inline-flex items-center gap-1.5">
              <span>←</span> Back to sign in
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  step = signal<1 | 2>(1);
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  resending = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.email = params['email'];
      }
      if (params['token']) {
        this.token = params['token'];
        this.step.set(2);
      }
    });
  }

  onRequestCode() {
    if (!this.email) {
      this.toast.error('Please enter your email address.');
      return;
    }

    this.loading.set(true);
    this.auth
      .forgotPassword(this.email)
      .then((res: any) => {
        this.loading.set(false);
        this.toast.success(
          res?.message || 'Verification code has been sent to your email.'
        );
        this.step.set(2);
      })
      .catch((err: any) => {
        this.loading.set(false);
        this.toast.error(err?.message || 'Failed to send reset code.');
      });
  }

  onResetPassword() {
    if (!this.token) {
      this.toast.error('Please enter the verification code.');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.auth
      .resetPassword({
        email: this.email ? this.email : undefined,
        token: this.token.trim(),
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      })
      .then((res: any) => {
        this.loading.set(false);
        this.toast.success(
          res?.message ||
            'Password reset successfully! Please sign in with your new password.'
        );
        this.router.navigate(['/auth/login'], {
          queryParams: { email: this.email },
        });
      })
      .catch((err: any) => {
        this.loading.set(false);
        this.toast.error(err?.message || 'Failed to reset password.');
      });
  }

  onResendCode() {
    if (!this.email) {
      this.toast.error('Please enter your email address first.');
      this.step.set(1);
      return;
    }

    this.resending.set(true);
    this.auth
      .forgotPassword(this.email)
      .then((res: any) => {
        this.resending.set(false);
        this.toast.success(
          res?.message || 'A new reset code has been sent to your email.'
        );
      })
      .catch((err: any) => {
        this.resending.set(false);
        this.toast.error(err?.message || 'Failed to resend code.');
      });
  }
}
