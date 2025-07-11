import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface ClientDto {
  [x: string]: any;
  phone2: any;
  name2: any;
  id?: number;
  route: {
    id: number;
    title: string;
    
  };
  organization: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  comment: string;
  subtitle:string;
}

export interface CreateClientDto {
  routeTitle: string;
  organization: string;
  subtitle:string;
  name2:string;
  name: string;
  phone: string;
  phone2:string;
  email: string;
  status: string;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private http: HttpClient) { }

  getAll(): Observable<ClientDto[]> {
    return this.http.get<ClientDto[]>('http://192.168.0.174:3000/clients');
  }

  addRoute(dto: CreateClientDto): Observable<ClientDto> {
    return this.http.post<ClientDto>('http://192.168.0.174:3000/clients', dto);
  }

  updateRoute(id: number, dto: Partial<CreateClientDto>): Observable<ClientDto> {
    return this.http.patch<ClientDto>(`http://192.168.0.174:3000/clients/${id}`, dto);
  }
  deleteRoute(id: number): Observable<void> {
  return this.http.delete<void>(`http://192.168.0.174:3000/clients/${id}`);
}
}