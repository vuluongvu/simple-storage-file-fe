import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { MyFilesComponent } from './pages/my-files/my-files.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SharedWithMeComponent } from './pages/shared-with-me/shared-with-me.component';
import { SharedByMeComponent } from './pages/shared-by-me/shared-by-me.component';
import { PublicFileComponent } from './pages/public-file/public-file.component';

export const routes: Routes = [
  // Authentication routes
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'auth/reset-password',
    component: ForgotPasswordComponent,
  },

  // Public file access route (unauthenticated)
  {
    path: 'public/files/:token',
    component: PublicFileComponent,
  },

  // Protected application routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'my-files',
        pathMatch: 'full',
      },
      {
        path: 'my-files',
        component: MyFilesComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'shared-with-me',
        component: SharedWithMeComponent,
      },
      {
        path: 'shared-by-me',
        component: SharedByMeComponent,
      },
    ],
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: 'my-files',
  },
];
