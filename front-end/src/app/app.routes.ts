import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { VariableComponent } from './variable/variable.component';
import { Menu2Component } from './menu2/menu2.component';


export const routes: Routes = [
    { path: '', component: MenuComponent },
    { path: 'variableComponente', component: VariableComponent },
    {path: 'otrasVariables', component: Menu2Component}

];
