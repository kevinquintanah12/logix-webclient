import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { ApolloError } from '@apollo/client/core'; // <- Importamos ApolloError

const GET_ENTREGA = gql`
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
  errorMensaje: string | null = null; // <- Variable para error visible

  constructor(private apollo: Apollo) {}

  rastrearPaquete(): void {
    if (this.form.invalid) {
      this.errorMensaje = '⚠️ Por favor ingrese un número de guía válido.';
      return;
    }
  
    const numeroGuia = this.form.value.numeroGuia!;
    this.loader = true;
    this.resultado = null;
    this.errorMensaje = null;
  
    this.apollo
      .query<any>({
        query: GET_ENTREGA,
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
        },
        error: (error) => {
          console.error('Network Error:', error);
          this.loader = false;
          this.errorMensaje = '❌ No se pudo rastrear el paquete. Intente de nuevo más tarde.';
        },
      });
  }
}  