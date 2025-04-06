import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class MapComponent {
  loader = false;
  timestamp: Date | null = null;

  // Definir un FormGroup para el formulario reactivo
  guideForm = new FormGroup({
    guideNumber: new FormControl('') // Creamos un control para el número de guía
  });

  constructor() {}

  // Método para simular la carga de datos (esto reemplazaría la consulta a la base de datos)
  fetchData(): void {
    this.loader = true; // Activar el loader mientras simulamos la carga

    setTimeout(() => {
      // Simulamos que los datos se han cargado después de 2 segundos
      this.timestamp = new Date(); // Actualizamos el timestamp con la fecha y hora actuales
      this.loader = false; // Desactivamos el loader
    }, 2000); // Simulamos una espera de 2 segundos
  }

  // Método para manejar la entrada de número de guía (si es necesario)
  searchRoute(): void {
    const guideNumber = this.guideForm.get('guideNumber')?.value;

    if (!guideNumber) {
      alert('Por favor ingresa un número de guía.');
      return;
    }

    this.loader = true;

    // Aquí iría la lógica para buscar la ruta en la base de datos o mediante un API, por ejemplo.

    setTimeout(() => {
      // Simulamos una búsqueda exitosa de la ruta
      console.log('Ruta encontrada para el número de guía:', guideNumber);
      this.loader = false;
      this.timestamp = new Date(); // Actualizamos el timestamp
    }, 2000); // Simulamos una espera de 2 segundos para la búsqueda
  }
}
