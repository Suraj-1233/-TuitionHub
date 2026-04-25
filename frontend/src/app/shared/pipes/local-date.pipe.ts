import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Pipe({
  name: 'localDate',
  standalone: true
})
export class LocalDatePipe implements PipeTransform {
  constructor(private auth: AuthService) {}

  transform(value: any, format: string = 'medium'): string | null {
    if (!value) return null;
    
    const date = new Date(value);
    const userTz = this.auth.getUserTimezone();

    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: format === 'short' ? 'short' : 'medium',
        timeStyle: 'short',
        timeZone: userTz
      }).format(date);
    } catch (e) {
      // Fallback to browser default if timezone is invalid
      return date.toLocaleString();
    }
  }
}
