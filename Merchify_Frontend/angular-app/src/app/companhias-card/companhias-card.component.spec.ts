import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanhiasCardComponent } from './companhias-card.component';

describe('CompanhiasCardComponent', () => {
  let component: CompanhiasCardComponent;
  let fixture: ComponentFixture<CompanhiasCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanhiasCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanhiasCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
