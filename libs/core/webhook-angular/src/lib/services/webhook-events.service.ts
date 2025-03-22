import { Injectable } from '@angular/core';
import { WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';

@Injectable({ providedIn: 'root' })
export class WebhookEventsService {
  constructor(private readonly webhookRestService: WebhookRestService) {}

  findMany() {
    return this.webhookRestService.webhookControllerEvents();
  }
}
