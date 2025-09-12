import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, finalize, Observable, switchMap, throwError} from "rxjs";
import {Injectable} from "@angular/core";


import {Router} from "@angular/router";
import { AuthService } from "./auth/auth.service";
import { LoaderService } from "../shared/services/loader.service";
import { DefaultResponseType } from "src/types/default-response.type";
import { LoginResponseType } from "src/types/login-response.type";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService,
              private router: Router,
              private loaderService: LoaderService) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.show()

      let tokens: { accessToken: string | null; refreshToken: string | null };
      tokens = this.authService.getTokens();

    if (tokens && tokens.accessToken) {
      const authReq :HttpRequest<any>  = req.clone({
        headers: req.headers.set('x-auth', tokens.accessToken)
      });

      return next.handle(authReq)
        .pipe(
          catchError((error)  => {
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              return this.handle401Error(authReq, next);
            }

            return throwError(() => error);
          }),
          finalize(() :void => {
            this.loaderService.hide();
          })
      );
    }

    return next.handle(req).pipe(finalize(() :void => {
      this.loaderService.hide();
    }));
  }

  handle401Error = (req: HttpRequest<any>, next: HttpHandler) => this.authService.refresh()
      .pipe(
          switchMap((result: DefaultResponseType | LoginResponseType) => {
              let error :string = '';
              if ((result as DefaultResponseType).error !== undefined) {
                  error = (result as DefaultResponseType).message;
              }

              const refreshResult :LoginResponseType = result as LoginResponseType;
              if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
                  error = 'Ошибка авторизации';
              }

              if (error) {
                  return throwError(() => new Error(error));
              }

              this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);

              const authReq :HttpRequest<any> = req.clone({
                  headers: req.headers.set('x-access-token', refreshResult.accessToken)
              });

              return next.handle(authReq);
          }),
          catchError(error => {
              this.authService.removeTokens();
              this.router.navigate(['/']);
              return throwError(() => error);
          })
      );
}
