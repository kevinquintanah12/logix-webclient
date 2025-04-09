import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackerComponent } from './tracker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('TrackerComponent', () => {
  let component: TrackerComponent;
  let fixture: ComponentFixture<TrackerComponent>;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  beforeEach(async () => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['watchQuery']);

    await TestBed.configureTestingModule({
      imports: [TrackerComponent, CommonModule, ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: Apollo, useValue: apolloSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form control', () => {
    const guideValue = component.form.get('numeroGuia')?.value;
    expect(guideValue).toBe('');
  });

  it('should show alert if guide number is empty or invalid on search', () => {
    spyOn(window, 'alert');
    component.form.get('numeroGuia')?.setValue('');
    component.rastrearPaquete();
    expect(window.alert).toHaveBeenCalledWith('Por favor ingrese un número de guía válido.');
  });

  it('should call Apollo and update result on valid guide number', () => {
    const mockResponse = {
      data: {
        rutaPorGuia: {
          id: '1',
          estado: 'En tránsito',
          entregas: [
            { estado: 'Recibido en origen', paquete: { id: 'p1', numeroGuia: 'ABC1234567' } },
            { estado: 'En tránsito', paquete: { id: 'p1', numeroGuia: 'ABC1234567' } }
          ]
        }
      }
    };

    apolloSpy.watchQuery.and.returnValue({
      valueChanges: of(mockResponse)
    } as any);

    component.form.get('numeroGuia')?.setValue('ABC1234567');
    component.rastrearPaquete();

    expect(component.loader).toBeFalse();
    expect(component.resultado).toBeTruthy();
    expect(component.resultado.guia).toBe('ABC1234567');
    expect(component.resultado.estado).toBe('En tránsito');
  });

  it('should handle GraphQL errors', () => {
    spyOn(window, 'alert');
    apolloSpy.watchQuery.and.returnValue({
      valueChanges: throwError(() => new Error('GraphQL error'))
    } as any);

    component.form.get('numeroGuia')?.setValue('ABC1234567');
    component.rastrearPaquete();

    expect(window.alert).toHaveBeenCalledWith('Error al rastrear el paquete. Intente nuevamente.');
    expect(component.loader).toBeFalse();
  });
});
