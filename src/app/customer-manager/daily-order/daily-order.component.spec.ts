import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyOrderComponent } from './daily-order.component';

describe('DailyOrderComponent', () => {
  let component: DailyOrderComponent;
  let fixture: ComponentFixture<DailyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
