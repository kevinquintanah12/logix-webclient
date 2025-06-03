import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, provideHttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ToastrModule } from 'ngx-toastr';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import {
  ApolloClientOptions,
  InMemoryCache,
  split
} from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';

import { AccessService } from './services/access.service';
import { LoaderService } from './services/loader.service';
import { CryptographyService } from './services/cryptography.service';
import { DatabaseService } from './services/database.service';
import { LoggerService } from './services/logger.service';

import { IsLoginGuard } from './guards/is-login.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsUserGuard } from './guards/is-user.guard';

import { HeaderComponent } from './components/Header/Header.component';
import { LandingComponent } from './components/Landing/Landing.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

import { MatIconModule } from '@angular/material/icon';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
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
    DatabaseService,
    LoggerService,
    IsLoginGuard,
    IsAdminGuard,
    IsUserGuard,
    provideHttpClient(),
    provideApollo((): ApolloClientOptions<any> => {
      const token = localStorage.getItem('token') ?? '';

      // HTTP Link con HttpHeaders
      const httpLinkInstance = inject(HttpLink);
      const http = httpLinkInstance.create({
        uri: 'https://logix-ioz0.onrender.com/graphql/',
        headers: new HttpHeaders({
          Authorization: token ? `JWT ${token}` : ''
        })
      });

      // WebSocket Link para suscripciones
      const ws = new WebSocketLink({
        uri: 'wss://logix-ioz0.onrender.com/graphql/',
        options: {
          reconnect: true,
          connectionParams: {
            Authorization: token ? `JWT ${token}` : ''
          }
        }
      });

      // split: suscripciones VS queries/mutations
      const link = split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return def.kind === 'OperationDefinition' && def.operation === 'subscription';
        },
        ws,
        http
      );

      return {
        cache: new InMemoryCache(),
        link
      };
    }),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
