import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudyMaterial {
  id?: number;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'LINK';
  url: string;
  uploadedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  getMaterials(batchId: number): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(`${this.apiUrl}/batch/${batchId}`);
  }

  uploadMaterial(batchId: number, material: StudyMaterial): Observable<StudyMaterial> {
    return this.http.post<StudyMaterial>(`${this.apiUrl}/batch/${batchId}`, material);
  }

  uploadFile(file: File): Observable<{url: string, filename: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string, filename: string}>(`${environment.apiUrl}/files/upload`, formData);
  }

  deleteMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
