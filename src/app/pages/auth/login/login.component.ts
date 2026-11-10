import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
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
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-stone-900">Sign in to your account</h2>
        <p class="mt-1.5 text-sm text-stone-500 font-medium">Simple File Storage Cloud Platform</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm rounded-3xl border border-stone-200/90 sm:px-10 space-y-6">

          <!-- UNVERIFIED ACCOUNT ALERT -->
          @if (showVerifyBox()) {
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
              <div class="font-bold flex items-center gap-1.5 text-sm">
                <span>⚠️</span> Account not activated
              </div>
              <p>Please enter the OTP verification code sent to your email to activate your account before signing in.</p>
              <div class="flex gap-2 pt-1">
                <input
                  type="text"
                  [(ngModel)]="verificationCode"
                  placeholder="6-digit OTP"
                  class="flex-1 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  (click)="onVerifyAccount()"
                  [disabled]="verifying()"
                  class="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {{ verifying() ? 'Verifying...' : 'Activate' }}
                </button>
              </div>
              <div class="flex justify-between pt-1">
                <button
                  type="button"
                  (click)="onResendVerification()"
                  class="text-amber-900 underline font-semibold hover:text-black cursor-pointer"
                >
                  Resend OTP code
                </button>
                <button
                  type="button"
                  (click)="showVerifyBox.set(false)"
                  class="text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4.5">
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

            <div>
              <label for="password" class="block text-sm font-bold text-stone-700">Password</label>
              <div class="mt-1.5">
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
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
                <span>Signing in...</span>
              } @else {
                <span>Sign in</span>
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
            <span>Continue with Google</span>
          </button>

          <div class="space-y-2 text-center text-sm text-stone-500 pt-2 font-medium">
            <div>
              Don't have an account?
              <a routerLink="/auth/register" class="font-bold text-stone-900 hover:underline">Create an account</a>
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
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  email = '';
  password = '';
  loading = signal(false);

  // Unverified account state
  showVerifyBox = signal(false);
  verificationCode = '';
  verifying = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Handle Google OAuth callback redirect
      if (params['token']) {
        this.loading.set(true);
        this.auth
          .handleOAuthToken(params['token'])
          .then(() => {
            this.loading.set(false);
            this.toast.success('Google sign in successful! Welcome.');
            this.router.navigate(['/my-files']);
          })
          .catch((err: any) => {
            this.loading.set(false);
            this.toast.error(err?.message || 'Failed to authenticate with Google');
          });
      }

      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.toast.error('Please enter email and password.');
      return;
    }

    this.loading.set(true);
    this.auth
      .login(this.email, this.password)
      .then(() => {
        this.loading.set(false);
        this.toast.success(`Welcome back!`);
        this.router.navigate(['/my-files']);
      })
      .catch((err: any) => {
        this.loading.set(false);
        const errMsg = err?.message || 'Login failed';
        this.toast.error(errMsg);

        // If error mentions unverified account, open verification box
        if (
          errMsg.toLowerCase().includes('xác thực') ||
          errMsg.toLowerCase().includes('kích hoạt') ||
          errMsg.toLowerCase().includes('verify')
        ) {
          this.showVerifyBox.set(true);
        }
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
        this.showVerifyBox.set(false);
        this.toast.success('Account activated successfully! You are now logged in.');
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
      return;
    }

    this.auth
      .resendVerification(this.email)
      .then((res: any) => {
        this.toast.success(res?.message || 'A new verification code has been sent to your email.');
      })
      .catch((err: any) => {
        this.toast.error(err?.message || 'Failed to resend verification code');
      });
  }
}
