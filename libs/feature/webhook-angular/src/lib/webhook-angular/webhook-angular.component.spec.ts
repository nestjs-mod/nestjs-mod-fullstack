import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebhookAngularComponent } from './webhook-angular.component';

describe('WebhookAngularComponent', () => {
  let component: WebhookAngularComponent;
  let fixture: ComponentFixture<WebhookAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebhookAngularComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebhookAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
