import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = '/api/teachers';

  constructor(private http: HttpClient) { }

  updateProfile(profileData: any): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, profileData);
  }

  getApprovedTeachers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/list`);
  }

  getTeacherProfile(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }
}
