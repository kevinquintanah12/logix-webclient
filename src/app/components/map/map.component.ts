import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { LoggerService } from 'src/app/services/logger.service';
import { environment } from 'src/environments/environment';

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
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MapComponent implements OnDestroy {
  
  protected remoteId: any;
  protected loader: boolean = environment.conditionTrue;
  protected timestamp: any;
  private reload: boolean = environment.conditionFalse;
  private mapFetchSubscription: any;
  
  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router, 
    private apollo: Apollo
  ) {
    this.activatedRoute.queryParamMap.subscribe((query) => {
      this.remoteId = query.get("id");
      if (this.remoteId == null || this.remoteId == "") {
        this.router.navigate(["/"], { replaceUrl: true });
        LoggerService.warn("Unable to fetch data, UID Not Found");
      } else {
        this.fetchData();
      }
    });
  }

  // Se realiza la consulta GraphQL usando Apollo
  protected fetchData(): void {
    this.loader = true;

    this.apollo.watchQuery<any>({
      query: RUTA_POR_GUIA,
      variables: { numeroGuia: this.remoteId }
    })
    .valueChanges
    .subscribe(({ data, loading }) => {
      if (loading) {
        this.loader = true;  // Muestra el loader mientras se espera la respuesta
      }

      if (!data || !data.rutaPorGuia) {
        alert("No Data Found");
        LoggerService.warn("Unable to fetch data, UID Not Found");
        this.router.navigate(["/"], { replaceUrl: environment.conditionTrue });
        return;
      }

      let ruta = data.rutaPorGuia;
      if (!ruta.estado || ruta.estado === "INACTIVO") {
        alert("Device Not Yet Activated");
        LoggerService.info("Device Not Yet Activated");
        this.router.navigate(["/"], { replaceUrl: environment.conditionTrue });
        return;
      }

      // Si la respuesta es válida, mostramos los detalles del mapa
      this.timestamp = new Date(ruta.fechaInicio);
      let maps = document.getElementById('map');
      setTimeout(() => {
        if (maps) {
          this.loader = false;
          maps.innerHTML = `<iframe src="https://maps.google.com/maps?q=${ruta.entregas[0]?.paquete?.id}&hl=en&z=16&t=k&output=embed" style="border:0; width: 100%; height: 100%;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        }
      }, 1500);
    });
  }

  ngOnDestroy(): void {
    if (this.mapFetchSubscription) {
      this.mapFetchSubscription.unsubscribe();
    }
  }
}
