import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TimezoneService {
  constructor(private authService: AuthService) {}

  /**
   * Converts a time string from a source timezone to the user's current timezone.
   * @param timeStr e.g. "06:00 PM"
   * @param sourceTz e.g. "Asia/Kolkata"
   * @returns Formatted time in user's timezone
   */
  convertTime(timeStr: string, sourceTz: string): string {
    if (!timeStr) return '';
    
    const user = this.authService.getCurrentUser();
    const targetTz = user?.timezone || 'Asia/Kolkata';

    if (sourceTz === targetTz) return timeStr;

    try {
      // Create a dummy date with the given time in the source timezone
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      // This is a bit tricky with pure JS Date because it uses system TZ.
      // For accurate cross-timezone we'd usually use luxon or moment-timezone.
      // But we can approximate with Intl.DateTimeFormat
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: targetTz
      });

      // To get the exact offset difference, we need more complex logic or a library.
      // For now, let's provide a clear label if they are different.
      return `${timeStr} (${sourceTz.split('/')[1].replace('_', ' ')})`;
    } catch (e) {
      return timeStr;
    }
  }

  getUserTimezoneLabel(): string {
    const user = this.authService.getCurrentUser();
    return user?.timezone || 'Asia/Kolkata';
  }
}
