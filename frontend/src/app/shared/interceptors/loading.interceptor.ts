import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loader for small/background calls (optional — can remove filter if you want all)
  const skipUrls = ['/api/feedback/session/']; // background checks जिन पर loader न दिखे
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (!shouldSkip) {
    loadingService.start();
  }

  return next(req).pipe(
    finalize(() => {
      if (!shouldSkip) {
        loadingService.stop();
      }
    })
  );
};
