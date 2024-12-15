import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChatsComponent } from './list-chats.component';

describe('ListChatsComponent', () => {
  let component: ListChatsComponent;
  let fixture: ComponentFixture<ListChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListChatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
