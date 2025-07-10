import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Operator {
  id: number;
  checkbox: { title: string; subtitle?: string };
  title: {
    icon: string;
    title: string;
    subtitle?: string;
    chip?: string;
  };
  cell: {
    phone: string;
    name: string;
    email: string;
  };
  status: {
    value: string;
    color: string;
  };
  selected?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OperatorService {
  private baseUrl = 'http://192.168.0.174:3000/operators'; // адрес твоего API

  constructor(private http: HttpClient) { }

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(this.baseUrl);
  }

  getOperator(id: number): Observable<Operator> {
    return this.http.get<Operator>(`${this.baseUrl}/${id}`);
  }

  createOperator(operator: Partial<Operator>): Observable<Operator> {
    return this.http.post<Operator>(this.baseUrl, operator);
  }

  updateOperator(id: number, operator: Partial<Operator>): Observable<Operator> {
    return this.http.put<Operator>(`${this.baseUrl}/${id}`, operator);
  }

  deleteOperator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
