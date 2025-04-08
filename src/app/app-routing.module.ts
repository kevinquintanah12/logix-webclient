import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsLoginGuard } from './guards/is-login.guard';
import { IsUserGuard } from './guards/is-user.guard';
import { HeaderComponent } from './components/Header/Header.component';
import { LandingComponent } from './components/Landing/Landing.component';
import { MapComponent } from './components/map/map.component'; // Asegúrate de que esta ruta sea correcta

const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
    children: [
      {
        path: '',
        component: LandingComponent,
        title: 'Tracker | Quality Solution',
      },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
        title: 'Tracker | Login',
        canActivate: [IsLoginGuard]
      },
      {
        path: 'signup',
        loadComponent: () => import('./components/signup/signup.component').then(c => c.SignupComponent),
        title: 'Tracker | Create Account',
        canActivate: [IsLoginGuard]
      },
      {
        path: 'forgot',
        loadComponent: () => import('./components/update-password/update-password.component').then(c => c.UpdatePasswordComponent),
        title: 'Tracker | Update Password'
      },
      {
        path: 'support',
        loadComponent: () => import('./components/support/support.component').then(c => c.SupportComponent),
        title: 'Tracker | Support'
      },
      {
        path: 'about',
        loadComponent: () => import('./components/about/about.component').then(c => c.AboutComponent),
        title: 'Tracker | About'
      },
      {
        path: 'map', // Ahora usando 'component' en vez de 'loadComponent'
        component: MapComponent, // Cambié de 'loadComponent' a 'component'
        title: 'Tracker | Map'
      },
      {
        path: 'admin',
        canActivate: [IsAdminGuard],
        loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  {
    path: 'user',
    canActivate: [IsUserGuard],
    loadChildren: () => import('./components/user/user.module').then(m => m.UserModule)
  },
  {
    path: '**',
    loadComponent: () => import('./components/NotFound/NotFound.component').then(c => c.NotFoundComponent),
    title: 'Tracker | Page Not Found | 404 Error'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
