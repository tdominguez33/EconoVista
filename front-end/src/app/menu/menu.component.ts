import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  onButtonClick() {
    // Aquí puedes definir la lógica que deseas ejecutar al hacer clic en el botón
    console.log('Botón presionado!');
  }
}
