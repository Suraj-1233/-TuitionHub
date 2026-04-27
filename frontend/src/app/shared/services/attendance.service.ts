import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Attendance {
  id?: number;
  batchId: number;
  studentId: number;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remark?: string;
  markedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  markAttendance(attendance: Attendance): Observable<Attendance> {
    let params = new HttpParams()
      .set('batchId', attendance.batchId.toString())
      .set('studentId', attendance.studentId.toString())
      .set('date', attendance.attendanceDate)
      .set('status', attendance.status);
    
    if (attendance.remark) {
      params = params.set('remark', attendance.remark);
    }

    return this.http.post<Attendance>(`${this.apiUrl}/mark`, {}, { params });
  }

  getBatchAttendance(batchId: number, date: string): Observable<Attendance[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Attendance[]>(`${this.apiUrl}/batch/${batchId}`, { params });
  }

  getStudentAttendance(studentId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/student/${studentId}`);
  }
}
