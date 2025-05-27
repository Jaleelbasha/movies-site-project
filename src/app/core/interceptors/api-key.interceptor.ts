import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(environment.tmdbApiUrl)) {
    const modifiedRequest = req.clone({
      params: req.params.set('api_key', environment.tmdbApiKey)
    });
    return next(modifiedRequest);
  }
  return next(req);
}; 