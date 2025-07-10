import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://192.168.0.174:3000/auth';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Внедряем платформу
  ) {
    // Проверяем, на какой платформе работаем
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.API}/login`, { username, password });
  }

  register(username: string, password: string) {
    return this.http.post(`${this.API}/register`, { username, password });
  }

  saveTokens(access: string, refresh: string) {
    if (this.isBrowser) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  getAccessToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.router.navigate(['/login']);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getUsernameFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.username || null;
    } catch {
      return null;
    }
  }
  getUserIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub || null;  // Обычно sub — это ID пользователя
    } catch {
      return null;
    }
  }
}
