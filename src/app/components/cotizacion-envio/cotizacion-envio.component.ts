import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cotizacion-envio',
  templateUrl: './cotizacion-envio.component.html',
  styleUrls: ['./cotizacion-envio.component.css']
})
export class CotizacionEnvioComponent implements OnInit {
  loader: boolean = false;
  tarifa: any = null;
  email: string = '';
  tiposProducto: any[] = [];
  origenes: any[] = [];
  destinos: any[] = [];

  formData = {
    tipoProductoId: null,
    origenCdId: null,
    destinoId: null,
    pesoUnitario: null,
    numeroPiezas: null,
    dimensionesLargo: null,
    dimensionesAncho: null,
    dimensionesAlto: null,
    descripcion: '',
    envioExpress: false,
  };

  constructor(private apollo: Apollo, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.apollo.watchQuery({
      query: gql`
        query CargarDatosIniciales {
          tipoProductos {
            id
            nombre
          }
          centrosDistribucion {
            id
            ubicacion {
              ciudad
              estado
            }
          }
          ubicaciones {
            id
            ciudad
            estado
          }
        }
      `
    }).valueChanges.subscribe((result: any) => {
      this.tiposProducto = result?.data?.tipoProductos || [];
      this.origenes = result?.data?.centrosDistribucion || [];
      this.destinos = result?.data?.ubicaciones || [];
    }, error => {
      this.toastr.error('Error al cargar los datos iniciales. Intenta nuevamente.', 'Error');
    });
  }

  calcularEnvio(form: NgForm) {
    if (form.invalid) {
      this.toastr.error('Por favor, complete todos los campos correctamente.', 'Formulario Inválido');
      return;
    }

    if ((this.formData.pesoUnitario ?? 0) <= 0 ||
        (this.formData.numeroPiezas ?? 0) <= 0 ||
        (this.formData.dimensionesLargo ?? 0) <= 0 ||
        (this.formData.dimensionesAncho ?? 0) <= 0 ||
        (this.formData.dimensionesAlto ?? 0) <= 0) {
      this.toastr.error('Por favor, ingrese valores válidos para el peso, número de piezas y dimensiones.', 'Datos Inválidos');
      return;
    }

    if (!this.formData.descripcion.trim()) {
      this.toastr.error('Por favor, ingresa una descripción del producto.', 'Descripción Incompleta');
      return;
    }

    this.loader = true;
    this.apollo.mutate({
      mutation: gql`
        mutation CrearCalcularEnvio(
          $tipoProductoId: Int!,
          $origenCdId: Int!,
          $destinoId: Int!,
          $pesoUnitario: Float!,
          $numeroPiezas: Int!,
          $dimensionesLargo: Float!,
          $dimensionesAncho: Float!,
          $dimensionesAlto: Float!,
          $descripcion: String!,
          $envioExpress: Boolean!
        ) {
          crearCalcularEnvio(
            tipoProductoId: $tipoProductoId,
            origenCdId: $origenCdId,
            destinoId: $destinoId,
            pesoUnitario: $pesoUnitario,
            numeroPiezas: $numeroPiezas,
            dimensionesLargo: $dimensionesLargo,
            dimensionesAncho: $dimensionesAncho,
            dimensionesAlto: $dimensionesAlto,
            descripcion: $descripcion,
            envioExpress: $envioExpress
          ) {
            calcularEnvio {
              id
              descripcion
              totalTarifa
              tarifaPeso
              distanciaKm
            }
          }
        }
      `,
      variables: this.formData
    }).subscribe((result: any) => {
      this.tarifa = result?.data?.crearCalcularEnvio?.calcularEnvio;
      this.loader = false;
      this.toastr.success('La tarifa de envío ha sido calculada correctamente.', 'Éxito');
    }, error => {
      this.loader = false;
      this.toastr.error('Error al calcular el envío. Inténtalo nuevamente.', 'Error');
    });
  }

  enviarCotizacion() {
    if (!this.email || !this.email.includes('@')) {
      this.toastr.error('Por favor ingresa un correo electrónico válido.', 'Correo Inválido');
      return;
    }

    this.loader = true;
    this.apollo.query({
      query: gql`
        query EnviarCotizacion($email: String!) {
          enviarUltimoCalculoEmail(email: $email) {
            id
            origenCd {
              ubicacion {
                ciudad
              }
            }
            destino {
              ciudad
            }
            tarifaPorKm
            tarifaPeso
            tarifaBase
            tarifaExtraTemperatura
            tarifaExtraHumedad
            trasladoiva
            ieps
            totalTarifa
          }
        }
      `,
      variables: {
        email: this.email
      }
    }).subscribe(() => {
      this.loader = false;
      this.toastr.success('La cotización ha sido enviada correctamente al correo.', 'Éxito');
    }, error => {
      this.loader = false;
      this.toastr.error('Error al enviar la cotización. Inténtalo nuevamente.', 'Error');
    });
  }
}

