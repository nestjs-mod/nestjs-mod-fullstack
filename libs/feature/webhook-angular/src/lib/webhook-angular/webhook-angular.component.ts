import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webhook-angular.component.html',
  styleUrl: './webhook-angular.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookAngularComponent {}
