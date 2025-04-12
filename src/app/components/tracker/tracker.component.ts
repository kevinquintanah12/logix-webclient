import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Agregar CommonModule

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css'],
  standalone: true,  // Este es el indicador que lo hace un componente standalone
  imports: [CommonModule] // Agregar CommonModule aquí para habilitar las directivas *ngIf, *ngFor, etc.
})
export class TrackerComponent {
  loader = false;
  form = new FormGroup({
    numeroGuia: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Z0-9]{10}$')
    ])
  });

  resultado: any = null;
  fechaConsulta: Date | null = null;

  constructor() {}

  rastrearPaquete() {
    const numeroGuia = this.form.get('numeroGuia')?.value;
    if (!this.form.valid) {
      alert('Por favor ingrese un número de guía válido.');
      return;
    }

    this.loader = true;
    this.resultado = null;

    // Simulamos la respuesta de un servicio
    setTimeout(() => {
      this.loader = false;
      this.fechaConsulta = new Date();

      // Simulamos los datos de rastreo
      this.resultado = {
        guia: numeroGuia,
        estado: 'En tránsito',
        actualizado: this.fechaConsulta?.toLocaleString(),
        historial: [
          { estado: 'En tránsito', fecha: '2025-04-08 10:00 AM' },
          { estado: 'En el centro de distribución', fecha: '2025-04-08 2:00 PM' },
          { estado: 'En camino al destino', fecha: '2025-04-09 8:00 AM' }
        ]
      };
    }, 2000); // Simula una espera de 2 segundos
  }
}
