// src/app/services/route.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Route {
  id: number;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://192.168.0.174:3000/routes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  create(title: string): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, { title });
  }
}
