import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { VariableComponent } from './variable/variable.component';

export const routes: Routes = [
    { path: '', component: MenuComponent },
    { path: 'variableComponente', component: VariableComponent }

];
