import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CotizacionEnvioComponent } from './components/cotizacion-envio/cotizacion-envio.component';

import { AccessService } from './services/access.service';
import { LoaderService } from './services/loader.service';
import { IsLoginGuard } from './guards/is-login.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsUserGuard } from './guards/is-user.guard';
import { CryptographyService } from './services/cryptography.service';
import { RouterModule } from '@angular/router';
import { DatabaseService } from './services/database.service';
import { LoggerService } from './services/logger.service';

import { HeaderComponent } from './components/Header/Header.component';
import { LandingComponent } from './components/Landing/Landing.component';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

// Apollo
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { CONFIG } from './config';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingComponent,
    CotizacionEnvioComponent,
  ],
  imports: [
    BrowserModule,
    // ApolloModule removed as it is no longer needed
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    AccessService,
    LoaderService,
    CryptographyService,
    IsLoginGuard,
    IsAdminGuard,
    IsUserGuard,
    DatabaseService,
    LoggerService,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({ uri: CONFIG.GRAPHQL_API_URL })
        };
      },
      deps: [HttpLink],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
