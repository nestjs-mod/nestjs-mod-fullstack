import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DefaultRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  title = 'client';
  serverMessage!: string;

  constructor(private readonly defaultRestService: DefaultRestService) { }

  ngOnInit() {
    this.defaultRestService.appControllerGetData()
      .subscribe((result) => (this.serverMessage = result.message));
  }
}
