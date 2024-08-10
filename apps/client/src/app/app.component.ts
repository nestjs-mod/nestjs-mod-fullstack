import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HttpClient } from '@angular/common/http';

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

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit() {
    this.httpClient
      .get<{ message: string }>('http://localhost:3000/api')
      .subscribe((result) => (this.serverMessage = result.message));
  }
}
