import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { EditorComponent } from './pages/editor/editor.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path: 'editor',
    component: EditorComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
