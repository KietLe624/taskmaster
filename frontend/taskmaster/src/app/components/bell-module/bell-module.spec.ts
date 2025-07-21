import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BellModule } from './bell-module';

describe('BellModule', () => {
  let component: BellModule;
  let fixture: ComponentFixture<BellModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BellModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BellModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
