import { RenderMode, ServerRoute } from '@angular/ssr';
import path from 'path';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'history',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat',
    renderMode: RenderMode.Server
  },
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: 'register',
    renderMode: RenderMode.Server
  }
];
