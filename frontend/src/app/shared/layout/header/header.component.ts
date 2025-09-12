import { Component, HostListener } from '@angular/core';
import { UserInfoType } from 'src/types/user-info.type';
import { UserService } from '../../services/user.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLogged: boolean = false;
  userInfo: UserInfoType | null = null;
  linkElement: HTMLElement | null = null;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private userService: UserService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    if (this.isLogged) {
      this.userService.getUserInfo()
        .subscribe((data: UserInfoType | DefaultResponseType) => {
          this.userInfo = data as UserInfoType;
        });
    }

    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean) => {
        this.isLogged = isLoggedIn;

        if (this.isLogged) {
          this.userService.getUserInfo()
            .subscribe((data: UserInfoType | DefaultResponseType)  => {
              this.userInfo = data as UserInfoType;
            });
        }
      });
  }

  logout() {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.doLogout();
        }
      })
  }

  doLogout() {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  scrollToSection(sectionId: string): void {
    // Если мы уже на главной странице
    if (this.router.url === '/') {
      // Добавляем задержку для полной загрузки страницы
      setTimeout(() => {
        const element :HTMLElement|null = document.getElementById(sectionId);
        if (element) {
          // Плавная прокрутка к элементу
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Обновляем URL с якорем
          this.router.navigate([], {
            fragment: sectionId,
            replaceUrl: true
          });
        }
      }, 100);
    } else {
      // Если мы не на главной странице, переходим на главную с якорем
      this.router.navigate(['/'], { fragment: sectionId })
        .then(() => {
          // После навигации добавляем задержку для прокрутки
          setTimeout(() => {
            const element :HTMLElement|null = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 300); // Большая задержка при переходе между страницами
        });
    }
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if ((event.target as HTMLElement)) {
      try {
        if ((event.target as HTMLElement).className.indexOf('header-menu-link') !== -1) {
          if (this.linkElement !== event.target) {
            this.linkElement?.classList.remove('active');
            this.linkElement = event.target as HTMLElement;
            this.linkElement.classList.add('active');
          }
        }
      } catch (error) {
        // Обработка ошибок, если необходимо
      }
    }
  }
}
