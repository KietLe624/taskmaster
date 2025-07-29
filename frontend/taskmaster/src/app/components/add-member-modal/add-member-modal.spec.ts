import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberModal } from './add-member-modal';

describe('AddMemberModal', () => {
  let component: AddMemberModal;
  let fixture: ComponentFixture<AddMemberModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddMemberModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMemberModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
