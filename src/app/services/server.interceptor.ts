import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ServerInterceptor implements HttpInterceptor {

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let ServerReq: HttpRequest<any> = (req.url.indexOf('restapi.amap.com') > -1 || req.url.indexOf('skipper') > -1) ? req.clone({}) : req.clone({
      headers: req.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`)
    })
    return next.handle(ServerReq)
  }
}