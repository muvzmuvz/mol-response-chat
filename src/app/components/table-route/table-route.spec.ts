import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRoute } from './table-route';

describe('TableRoute', () => {
  let component: TableRoute;
  let fixture: ComponentFixture<TableRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRoute]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableRoute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
