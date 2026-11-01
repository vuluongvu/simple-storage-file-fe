import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

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
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Invalid email or password';
      throw new Error(msg);
    }
  }

  async register(email: string, password: string, fullName?: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ data: { accessToken: string; user: User } }>(
          `${environment.apiUrl}/auth/register`,
          { email, password, fullName: fullName || email.split('@')[0] }
        )
      );

      if (res?.data?.accessToken && res?.data?.user) {
        const user: User = {
          ...res.data.user,
          fullName: res.data.user.fullName || fullName || email.split('@')[0],
          avatarUrl: res.data.user.avatarUrl,
        };
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
        return true;
      }
      throw new Error('Registration failed');
    } catch (err: any) {
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Registration failed';
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
