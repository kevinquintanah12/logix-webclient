import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, filter } from 'rxjs/operators';
import { Subscription as RxSub } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  text: string;
  from: 'user' | 'agent';
}

interface GraphQLMensaje {
  id: string;
  remitente: string;
  destinatario: string;
  contenido: string;
  timestamp: string;
}

// Constante para el canal del agente
const AGENT_CHANNEL = 'agent';

// 1) Query: historial de mensajes recibidos (destinatario = este cliente)
const GET_MENSAJES = gql`
  query GetMensajes($nombre: String!) {
    mensajes(nombre: $nombre) {
      id
      remitente
      destinatario
      contenido
      timestamp
    }
  }
`;

// 2) Mutación: enviar mensaje (destinatario)
const ENVIAR_MENSAJE_PUBLICO = gql`
  mutation EnviarMensajePublico($destinatario: String!, $contenido: String!) {
    enviarMensajePublico(destinatario: $destinatario, contenido: $contenido) {
      mensaje {
        id
        remitente
        destinatario
        contenido
        timestamp
      }
    }
  }
`;

// 3) Suscripción privada: escucha en chat_{nombre}
const PRIVATE_CHAT_SUBSCRIPTION = gql`
  subscription PrivateChat($nombre: String!) {
    privateChat(nombre: $nombre) {
      mensaje {
        id
        remitente
        destinatario
        contenido
        timestamp
      }
    }
  }
`;

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentMessage = '';

  // Flag que indica si ya cambiamos a modo “hablar con agente”
  humanMode = false;

  visitorName = (() => {
    const key = 'visitorName';
    let name = localStorage.getItem(key);
    if (!name) {
      name = 'Usuario-' + Math.floor(Math.random() * 10000);
      localStorage.setItem(key, name);
    }
    return name!;
  })();

  messages: ChatMessage[] = [
    { from: 'agent', text: 'Hola! Soy tu asistente automático. ¿En qué puedo ayudarte?' }
  ];

  private sub?: RxSub;

  constructor(
    private apollo: Apollo,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('[INIT] Usuario actual:', this.visitorName);

    // Arrancamos la suscripción GraphQL (escucha en canal privado)
    this.sub = this.apollo
      .subscribe<{ privateChat?: { mensaje?: GraphQLMensaje } }>({
        query: PRIVATE_CHAT_SUBSCRIPTION,
        variables: { nombre: this.visitorName }
      })
      .pipe(
        map(r => r.data?.privateChat?.mensaje),
        filter((m): m is GraphQLMensaje => !!m)
      )
      .subscribe({
        next: m => {
          console.log('[RECIBIDO en cliente]', m);
          if (m.remitente !== this.visitorName) {
            this.messages.push({ from: 'agent', text: m.contenido });
          }
        },
        error: err => console.error('Error en suscripción privateChat:', err)
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const contenido = this.currentMessage.trim();
    if (!contenido) return;

    // Añadimos el mensaje del usuario a la vista
    this.messages.push({ from: 'user', text: contenido });

    // Si aún no estamos en humanMode y el usuario no pide agente:
    if (!this.humanMode) {
      const quererAgente = /agente|servicio al cliente|hablar con un agente/i.test(contenido);
      if (quererAgente) {
        // ¡Cambio a humanMode!
        this.humanMode = true;
        this.messages.push({
          from: 'agent',
          text: 'Te paso con un agente de soporte humano, un momento por favor…'
        });
      } else {
        // Modo chatbot: llamamos al endpoint REST
        this.http.post<{ source: string; answer: string }>(
          'http://localhost:8000/ask',
          { question: contenido }
        ).subscribe({
          next: res => {
            this.messages.push({ from: 'agent', text: res.answer });
          },
          error: err => {
            console.error('Error al llamar al bot:', err);
            this.messages.push({ from: 'agent', text: 'Lo siento, ha ocurrido un error. Intenta de nuevo más tarde.' });
          }
        });
        this.currentMessage = '';
        return; // salimos, no enviamos a GraphQL
      }
    }

    // Si llegamos aquí es porque estamos en humanMode: enviamos por GraphQL
    this.apollo
      .mutate<{ enviarMensajePublico?: { mensaje?: GraphQLMensaje } }>({
        mutation: ENVIAR_MENSAJE_PUBLICO,
        variables: {
          destinatario: AGENT_CHANNEL,
          contenido
        }
      })
      .subscribe({
        next: res => console.log('[ENVIADO OK]', res),
        error: err => console.error('Error enviando mensaje:', err)
      });

    this.currentMessage = '';
  }
}
