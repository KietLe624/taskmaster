import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserModal } from './edit-user-modal';

describe('EditUserModal', () => {
  let component: EditUserModal;
  let fixture: ComponentFixture<EditUserModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditUserModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
