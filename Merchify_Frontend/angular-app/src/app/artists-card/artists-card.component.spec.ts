import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistsCardComponent } from './artists-card.component';

describe('ArtistsCardComponent', () => {
  let component: ArtistsCardComponent;
  let fixture: ComponentFixture<ArtistsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
