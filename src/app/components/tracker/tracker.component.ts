// tracker.component.ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { ApolloError } from '@apollo/client/core';

const GET_TRACKER = gql`
  query ($numeroGuia: String!) {
    entregaPorGuia(numeroGuia: $numeroGuia) {
      id
      fechaEntrega
      estado
      pin
      paquete {
        id
        numeroGuia
        producto {
          id
          destinatario {
            id
            latitud
            longitud
            colonia
            telefono
            nombre
            apellidos
          }
        }
      }
    }
    sensoresPorGuia(numeroGuia: $numeroGuia) {
      placeName
    }
  }
`;

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class TrackerComponent {
  loader = false;
  form = new FormGroup({
    numeroGuia: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Z0-9]{10}$'),
    ]),
  });

  resultado: any = null;
  fechaConsulta: Date | null = null;
  ruta: { placeName: string }[] = [];
  errorMensaje: string | null = null;

  constructor(private apollo: Apollo) {}

  rastrearPaquete(): void {
    if (this.form.invalid) {
      this.errorMensaje = '⚠️ Por favor ingrese un número de guía válido.';
      return;
    }

    const numeroGuia = this.form.value.numeroGuia!;
    this.loader = true;
    this.resultado = null;
    this.ruta = [];
    this.errorMensaje = null;

    this.apollo
      .query<{ entregaPorGuia: any; sensoresPorGuia: { placeName: string }[] }>({
        query: GET_TRACKER,
        variables: { numeroGuia },
        errorPolicy: 'all',
      })
      .subscribe({
        next: ({ data, errors }) => {
          this.loader = false;
          this.fechaConsulta = new Date();

          if (errors && errors.length > 0) {
            console.warn('GraphQL Errors:', errors);
            this.errorMensaje = '❌ No se encontró información para el número de guía.';
            return;
          }

          if (!data.entregaPorGuia) {
            this.errorMensaje = '❌ No se encontró información para el número de guía.';
            return;
          }

          this.resultado = data.entregaPorGuia;

          // Filtrar placeName únicos
          const nombres = data.sensoresPorGuia.map(s => s.placeName);
          this.ruta = Array.from(new Set(nombres)).map(name => ({ placeName: name }));
        },
        error: (networkError: ApolloError) => {
          console.error('Network Error:', networkError);
          this.loader = false;
          this.errorMensaje = '❌ No se pudo rastrear el paquete. Intente de nuevo más tarde.';
        },
      });
  }
}
