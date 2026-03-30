import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/login/login';
import { ClienteForm } from './features/clientes/cliente-form/cliente-form';
import { ClientesList } from './features/clientes/clientes-list/clientes-list';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    component: MainLayout,
    children: [
      {
        path: '',
        component: ClientesList,
      },
      {
        path: 'nuevo',
        component: ClienteForm,
      },
      {
        path: ':id/editar',
        component: ClienteForm,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
