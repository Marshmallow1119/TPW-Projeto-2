import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistsPageComponent } from './artists-page.component';

describe('ArtistsPageComponent', () => {
  let component: ArtistsPageComponent;
  let fixture: ComponentFixture<ArtistsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
