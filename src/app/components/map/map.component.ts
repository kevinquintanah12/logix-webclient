import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms'; // Importa FormControl y FormGroup
import { RouterModule } from '@angular/router';

const RUTA_POR_GUIA = gql`
  query RutaPorGuia($numeroGuia: String!) {
    rutaPorGuia(numeroGuia: $numeroGuia) {
      id
      distancia
      prioridad
      estado
      fechaInicio
      fechaFin
      conductor {
        id
        nombre
      }
      vehiculo {
        id
        marca
      }
      entregas {
        id
        paquete {
          id
          numeroGuia
        }
        estado
      }
    }
  }
`;

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
  rutaData: any = null;

  // Definir un FormGroup para el formulario reactivo
  guideForm = new FormGroup({
    guideNumber: new FormControl('') // Creamos un control para el número de guía
  });

  constructor(private apollo: Apollo) {}

  searchRoute(): void {
    const guideNumber = this.guideForm.get('guideNumber')?.value; // Obtener el valor del campo de formulario

    if (!guideNumber) {
      alert('Por favor ingresa un número de guía.');
      return;
    }

    this.loader = true;

    this.apollo
      .watchQuery<any>({
        query: RUTA_POR_GUIA,
        variables: {
          numeroGuia: guideNumber,
        },
      })
      .valueChanges.subscribe({
        next: ({ data }) => {
          this.rutaData = data?.rutaPorGuia;
          this.loader = false;
          this.timestamp = new Date();
          console.log('Ruta por guía:', this.rutaData);
        },
        error: (err) => {
          console.error('Error al obtener la ruta:', err);
          this.loader = false;
        },
      });
  }
}
