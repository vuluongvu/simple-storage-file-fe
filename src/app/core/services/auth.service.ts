import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface RegisterResult {
  isVerified: boolean;
  message?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly USER_KEY = 'simple_storage_user_session';
  private readonly TOKEN_KEY = 'simple_storage_jwt_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (savedUser && token) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
        // Verify token with backend
        this.fetchProfile().catch(() => {
          this.logout();
        });
      } catch {
        this.logout();
      }
    } else {
      this.currentUser.set(null);
    }
  }

  async fetchProfile(): Promise<User | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: User }>(`${environment.apiUrl}/auth/me`)
      );
      if (res?.data) {
        const user: User = {
          ...res.data,
          avatarUrl: res.data.avatarUrl,
        };
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch {
      // If token invalid, handle in caller
    }
    return null;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ data: { accessToken: string; user: User } }>(
          `${environment.apiUrl}/auth/login`,
          { email, password }
        )
      );

      if (res?.data?.accessToken && res?.data?.user) {
        const user: User = {
          ...res.data.user,
          fullName: res.data.user.fullName || email.split('@')[0],
          avatarUrl: res.data.user.avatarUrl,
        };
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
        return true;
      }
      throw new Error('Authentication failed');
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Invalid email or password';
      throw new Error(msg);
    }
  }

  async register(
    email: string,
    password: string,
    fullName?: string,
    verificationCode?: string
  ): Promise<RegisterResult> {
    try {
      const payload: any = {
        email,
        password,
        fullName: fullName || email.split('@')[0],
      };
      if (verificationCode) {
        payload.verificationCode = verificationCode;
      }

      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/register`, payload)
      );

      const data = res?.data || res;

      // If user was verified immediately (pre-registration code)
      if (data?.accessToken && data?.user) {
        const user: User = {
          ...data.user,
          fullName: data.user.fullName || fullName || email.split('@')[0],
          avatarUrl: data.user.avatarUrl,
        };
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        return { isVerified: true, message: data.message, email };
      }

      // Default flow: created but needs verification
      return {
        isVerified: false,
        message:
          data?.message ||
          'Tài khoản đã tạo. Vui lòng kiểm tra email để xác thực tài khoản.',
        email,
      };
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Registration failed';
      throw new Error(msg);
    }
  }

  /**
   * Send pre-registration verification code
   */
  async sendVerificationCode(email: string): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/send-verification-code`, {
          email,
        })
      );
      return res?.data || res;
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Failed to send verification code';
      throw new Error(msg);
    }
  }

  /**
   * Verify account using OTP code
   */
  async verifyAccount(data: { email?: string; code: string }): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/verify-account`, data)
      );
      const resData = res?.data || res;

      if (resData?.accessToken) {
        localStorage.setItem(this.TOKEN_KEY, resData.accessToken);
        await this.fetchProfile();
      }

      return resData;
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Verification failed';
      throw new Error(msg);
    }
  }

  /**
   * Resend account verification code
   */
  async resendVerification(email: string): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/resend-verification`, {
          email,
        })
      );
      return res?.data || res;
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Failed to resend verification code';
      throw new Error(msg);
    }
  }

  /**
   * Request password reset code via email
   */
  async forgotPassword(email: string): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, {
          email,
        })
      );
      return res?.data || res;
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Failed to send password reset code';
      throw new Error(msg);
    }
  }

  /**
   * Redirect to Google OAuth2 flow
   */
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  /**
   * Save OAuth token and load user profile
   */
  async handleOAuthToken(token: string): Promise<User | null> {
    localStorage.setItem(this.TOKEN_KEY, token);
    return this.fetchProfile();
  }

  /**
   * Reset user password using token/OTP
   */
  async resetPassword(data: {
    email?: string;
    token: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, data)
      );
      return res?.data || res;
    } catch (err: any) {
      const msg =
        err?.error?.message?.message ||
        err?.error?.message ||
        err?.message ||
        'Failed to reset password';
      throw new Error(msg);
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
