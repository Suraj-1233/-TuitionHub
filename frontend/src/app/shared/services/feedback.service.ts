import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitFeedback(sessionId: number, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback/submit`, { sessionId, rating, comment });
  }

  getFeedbackForSession(sessionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/feedback/session/${sessionId}`);
  }

  getAllFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feedback/all`);
  }
}
