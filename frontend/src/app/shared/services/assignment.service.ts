import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Assignment {
  id?: number;
  title: string;
  description?: string;
  dueDate: string;
  maxMarks: number;
  createdAt?: string;
}

export interface Submission {
  id?: number;
  assignmentId: number;
  studentId: number;
  contentUrl: string;
  marksObtained?: number;
  feedback?: string;
  submittedAt?: string;
  studentName?: string;
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = `${environment.apiUrl}/assignments`;

  constructor(private http: HttpClient) {}

  getAssignments(batchId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/batch/${batchId}`);
  }

  createAssignment(batchId: number, assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/batch/${batchId}`, assignment);
  }

  submitAssignment(assignmentId: number, studentId: number, contentUrl: string): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/${assignmentId}/submit`, { studentId, contentUrl });
  }

  getSubmissions(assignmentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/${assignmentId}/submissions`);
  }

  gradeSubmission(submissionId: number, marks: number, feedback: string): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/submissions/${submissionId}/grade`, { marks, feedback });
  }
}
