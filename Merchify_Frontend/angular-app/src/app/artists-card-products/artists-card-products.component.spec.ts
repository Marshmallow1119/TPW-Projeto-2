import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistsCardProductsComponent } from './artists-card-products.component';

describe('ArtistsCardProductsComponent', () => {
  let component: ArtistsCardProductsComponent;
  let fixture: ComponentFixture<ArtistsCardProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsCardProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistsCardProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
