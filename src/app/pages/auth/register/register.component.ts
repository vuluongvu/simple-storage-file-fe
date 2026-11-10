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
            <path d="M6 19.3l6 3.8 6-3.8-6-3.8 6 3.8z"/>
          </svg>
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-stone-900">
          {{ step() === 1 ? 'Create your account' : 'Verify your account' }}
        </h2>
        <p class="mt-1.5 text-sm text-stone-500 font-medium">
          {{ step() === 1 ? 'Get 50 GB free storage for your files and documents' : 'Enter the 6-digit code sent to your email to activate' }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm rounded-3xl border border-stone-200/90 sm:px-10 space-y-6">

          <!-- STEP 1: REGISTRATION FORM -->
          @if (step() === 1) {
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
                class="w-full py-3 px-4 bg-brownblack hover:bg-brownblack-800 text-white text-base font-semibold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
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

            <!-- GOOGLE OAUTH DIVIDER & BUTTON -->
            <div class="relative my-3">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-stone-200"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white px-3 text-stone-400 font-bold tracking-wider">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              (click)="loginWithGoogle()"
              class="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 text-sm font-bold rounded-2xl shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>
          }

          <!-- STEP 2: VERIFY ACCOUNT WITH OTP -->
          @if (step() === 2) {
            <div class="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-sm">
                <span>📩</span> Verification code sent!
              </div>
              <p>A 6-digit OTP code was sent to <strong class="text-blue-950">{{ email }}</strong>. Please enter the code to activate your account.</p>
            </div>

            <form (ngSubmit)="onVerifyAccount()" class="space-y-4">
              <div>
                <label for="otpCode" class="block text-sm font-bold text-stone-700">Verification code (OTP)</label>
                <div class="mt-1.5">
                  <input
                    id="otpCode"
                    type="text"
                    [(ngModel)]="verificationCode"
                    name="verificationCode"
                    required
                    placeholder="123456"
                    class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-base font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                [disabled]="verifying()"
                class="w-full py-3 px-4 bg-brownblack hover:bg-brownblack-800 text-white text-base font-semibold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                @if (verifying()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Activating...</span>
                } @else {
                  <span>Activate account & Sign in</span>
                }
              </button>

              <div class="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  (click)="onResendVerification()"
                  [disabled]="resending()"
                  class="font-semibold text-stone-600 hover:text-stone-900 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {{ resending() ? 'Resending...' : "Didn't receive code? Resend" }}
                </button>
                <button
                  type="button"
                  (click)="step.set(1)"
                  class="font-semibold text-stone-500 hover:text-stone-800 hover:underline cursor-pointer"
                >
                  Change details
                </button>
              </div>
            </form>
          }

          <!-- FOOTER -->
          <div class="space-y-2 text-center text-sm text-stone-500 pt-2 font-medium">
            <div>
              Already have an account?
              <a routerLink="/auth/login" class="font-bold text-stone-900 hover:underline">Sign in</a>
            </div>
            <div>
              <a
                [routerLink]="['/auth/forgot-password']"
                [queryParams]="email ? { email: email } : null"
                class="text-xs font-semibold text-stone-500 hover:text-stone-900 hover:underline cursor-pointer"
              >
                Forgot your password? Reset here
              </a>
            </div>
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

  step = signal<1 | 2>(1);
  email = '';
  password = '';
  confirmPassword = '';
  verificationCode = '';

  loading = signal(false);
  verifying = signal(false);
  resending = signal(false);

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
      .then((res) => {
        this.loading.set(false);
        if (res.isVerified) {
          this.toast.success('Registration successful! Welcome to Simple File Storage.');
          this.router.navigate(['/my-files']);
        } else {
          // Requires verification
          this.toast.info(res.message || 'Please enter the verification code sent to your email.');
          this.step.set(2);
        }
      })
      .catch((err: any) => {
        this.loading.set(false);
        this.toast.error(err?.message || 'Registration failed');
      });
  }

  onVerifyAccount() {
    if (!this.verificationCode) {
      this.toast.error('Please enter the OTP verification code.');
      return;
    }

    this.verifying.set(true);
    this.auth
      .verifyAccount({
        email: this.email,
        code: this.verificationCode.trim(),
      })
      .then(() => {
        this.verifying.set(false);
        this.toast.success('Account verified successfully! Welcome to Simple File Storage.');
        this.router.navigate(['/my-files']);
      })
      .catch((err: any) => {
        this.verifying.set(false);
        this.toast.error(err?.message || 'Verification failed');
      });
  }

  onResendVerification() {
    if (!this.email) {
      this.toast.error('Please enter your email.');
      this.step.set(1);
      return;
    }

    this.resending.set(true);
    this.auth
      .resendVerification(this.email)
      .then((res: any) => {
        this.resending.set(false);
        this.toast.success(res?.message || 'A new verification code has been sent to your email.');
      })
      .catch((err: any) => {
        this.resending.set(false);
        this.toast.error(err?.message || 'Failed to resend verification code');
      });
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }
}
