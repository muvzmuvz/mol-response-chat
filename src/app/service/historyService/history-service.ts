import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(private http: HttpClient) { }

  // Новый путь — к клиентам с историей
  getAll(): Observable<any[]> {
    return this.http.get<any[]>('http://192.168.0.174:3000/clients/with-history');
  }
}
