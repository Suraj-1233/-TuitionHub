import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _activeRequests = signal(0);

  // true जब कोई भी API call चल रही हो
  readonly isLoading = computed(() => this._activeRequests() > 0);

  start() {
    this._activeRequests.update(n => n + 1);
  }

  stop() {
    this._activeRequests.update(n => Math.max(0, n - 1));
  }
}
