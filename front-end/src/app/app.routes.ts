import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { VariableComponent } from './variable/variable.component';

export const routes: Routes = [
    { path: 'menuComponente', component: MenuComponent },
    { path: 'variableComponente', component: VariableComponent },
    { path: '', redirectTo: '/menuComponente', pathMatch: 'full' }
];
