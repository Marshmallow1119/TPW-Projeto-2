import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanhiasPageComponent } from './companhias-page.component';

describe('CompanhiasPageComponent', () => {
  let component: CompanhiasPageComponent;
  let fixture: ComponentFixture<CompanhiasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanhiasPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanhiasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
