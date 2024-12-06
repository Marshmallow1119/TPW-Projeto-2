import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistsProductsComponent } from './artists-products.component';

describe('ArtistsProductsComponent', () => {
  let component: ArtistsProductsComponent;
  let fixture: ComponentFixture<ArtistsProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistsProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
