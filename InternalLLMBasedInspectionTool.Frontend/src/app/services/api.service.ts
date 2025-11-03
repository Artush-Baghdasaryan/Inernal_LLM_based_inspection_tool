import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users/user.model';
import { CreateUserRequest } from '../models/users/create-user-request.model';
import { SaveUserRequest } from '../models/users/save-user-request.model';
import { appConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = appConfig.apiUrl;

  public createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${encodeURIComponent(request.nickname)}`, {});
  }

  public getUserByNickname(nickname: string): Observable<User | null> {
    return this.http.get<User | null>(`${this.apiUrl}/users/${encodeURIComponent(nickname)}`);
  }

  public updateUser(id: string, request: SaveUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${encodeURIComponent(id)}`, request);
  }
}

