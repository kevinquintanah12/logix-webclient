import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionEnvioComponent } from './cotizacion-envio.component';

describe('CotizacionEnvioComponent', () => {
  let component: CotizacionEnvioComponent;
  let fixture: ComponentFixture<CotizacionEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotizacionEnvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CotizacionEnvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
