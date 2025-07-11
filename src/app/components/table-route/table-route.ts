import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ClientService, ClientDto, CreateClientDto } from '../../service/clientService/client-service';
import {
  TuiAutoColorPipe, TuiButton, TuiDropdown, TuiIcon, TuiInitialsPipe, TuiLink,
  TuiTitle, tuiItemsHandlersProvider, TuiTextfield, TuiLabel, TuiDialog
} from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiCheckbox, TuiChip, TuiItemsWithMore, TuiProgressBar, TuiRadioList, TuiStatus, TuiDataListWrapperComponent } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { TuiTable, TuiTableFilters } from '@taiga-ui/addon-table';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-table-route',
  standalone: true,
  imports: [
    ReactiveFormsModule, NgForOf, NgIf, TuiAutoColorPipe, TuiAvatar,
    TuiBadge, TuiButton, TuiCell, TuiCheckbox, TuiChip, TuiDropdown,
    TuiIcon, TuiInitialsPipe, TuiItemsWithMore, TuiLink, TuiProgressBar,
    TuiRadioList, TuiStatus, TuiTable, TuiTableFilters, TuiTitle,
    FormsModule, TuiLabel, TuiTextfield, TuiDialog,
    TuiDataListWrapperComponent
  ],
  templateUrl: './table-route.html',
  styleUrl: './table-route.less',
  providers: [
    tuiItemsHandlersProvider<{ id: string; name: string }>({
      stringify: signal((item) => item.name),
      identityMatcher: signal((a, b) => a.id === b.id),
    }),
  ],
})
export class TableRoute implements OnInit {
  constructor(private clientService: ClientService) { }
  isAddNewContact = false;
  protected data: any[] = [];
  protected routeOptions: { id: string; name: string }[] = [];
  protected search = '';
  protected readonly sizes = ['l', 'm', 's'] as const;
  protected size = this.sizes[0];
  protected sortColumn: string = '';
  protected sortDirection: 'asc' | 'desc' = 'asc';

  protected onSort(column: string): void {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        // Первый клик по колонке - сортировка по возрастанию уже была,
        // переключаем на убывание
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        // Второй клик по колонке - был убывающий порядок,
        // третий клик - сбрасываем сортировку
        this.sortColumn = '';
        this.sortDirection = 'asc'; // сбрасываем на asc для следующей сортировки
      }
    } else {
      // Клик по новой колонке - сортируем по возрастанию
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
  isButtonActive = true;

  addNewPhone() {
    this.isAddNewContact = true;
    if (this.isAddNewContact = true) {
      this.isButtonActive = false;
    }

  }
  protected readonly form = new FormGroup({
    route: new FormControl<string>('all'),
  });

  get routeControl(): FormControl<string> {
    return this.form.get('route') as FormControl<string>;
  }

  ngOnInit(): void {
    this.loadRoutes();
  }

  private loadRoutes(): void {
    this.clientService.getAll().subscribe({
      next: (routes) => {
        this.data = routes.map((r) => this.mapDtoToView(r));
        const routeNames = Array.from(
          new Set(routes.map(r => r.route.title.split('-')[0]))
        ).filter(name => name);

        this.routeOptions = [
          { id: 'all', name: 'Все маршруты' },
          ...routeNames.map(n => ({ id: n, name: n }))
        ];
      },
      error: (err) => console.error('Ошибка загрузки маршрутов:', err)
    });
  }
  private mapDtoToView(dto: ClientDto) {
    return {
      id: dto.id!,
      checkbox: { title: dto.route.title },
      title: {
        icon: '@tui.user',
        title: dto.organization,
        subtitle: dto['subtitle'],
      },
      cell: {
        name2: dto.name2,
        phone2: dto.phone2,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
      },
      status: {
        value: dto.status,
        color: this.getStatusColor(dto.status),
      },
      comment: dto.comment, // 🔹 ВОТ ЭТО ДОБАВЛЯЕМ
      selected: false,
      route: dto.route,
    };
  }

  protected get filteredData() {
    const selectedRouteId = this.routeControl.value;
    const searchTerm = this.search.toLowerCase().trim();

    let filtered = [...this.data];
    if (selectedRouteId !== 'all') {
      filtered = filtered.filter(item =>
        item.checkbox.title.toLowerCase().startsWith(selectedRouteId.toLowerCase())
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        this.isMatch(item.checkbox.title, searchTerm) ||
        this.isMatch(item.title.title, searchTerm) ||
        this.isMatch(item.cell.name, searchTerm) ||
        this.isMatch(item.cell.phone, searchTerm) ||
        this.isMatch(item.cell.name2, searchTerm) ||
        this.isMatch(item.cell.phone2, searchTerm) ||
        this.isMatch(item.cell.subtitle, searchTerm) ||
        this.isMatch(item.status.value, searchTerm)
      );
    }

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valA = this.getSortValue(a, this.sortColumn);
        const valB = this.getSortValue(b, this.sortColumn);

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  private getSortValue(item: any, column: string): string {
    switch (column) {
      case 'route': return item.checkbox.title?.toLowerCase() || '';
      case 'organization': return item.title.title?.toLowerCase() || '';
      case 'phone': return item.cell.phone?.toLowerCase() || '';
      case 'status': return item.status.value?.toLowerCase() || '';
      default: return '';
    }
  }

  private isMatch(value: string | undefined, searchTerm: string): boolean {
    return value?.toLowerCase().includes(searchTerm) ?? false;
  }

  protected get checked(): boolean | null {
    const every = this.data.every(({ selected }) => selected);
    const some = this.data.some(({ selected }) => selected);
    return every || (some && null);
  }

  protected onCheck(checked: boolean): void {
    this.data.forEach(item => item.selected = checked);
  }

  isAddModalOpen = false;
  isEditModalOpen = false;
  editingRouteId: number | null = null;

  addForm = new FormGroup({
    routeTitle: new FormControl('', { nonNullable: true }),
    organization: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    name2: new FormControl('', { nonNullable: true }),
    phone2: new FormControl('', { nonNullable: true }),
    subtitle: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    comment: new FormControl('', { nonNullable: true }),
    status: new FormControl(
      {
        label: 'В процессе',
        value: 'В процессе',
        color: 'var(--tui-status-warning)',
      },
      { nonNullable: true }
    ),
  });

  editForm = new FormGroup({
    routeTitle: new FormControl('', { nonNullable: true }),
    organization: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    name2: new FormControl('', { nonNullable: true }),
    phone2: new FormControl('', { nonNullable: true }),
    subtitle: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    comment: new FormControl('', { nonNullable: true }),
    status: new FormControl(
      {
        label: 'В процессе',
        value: 'В процессе',
        color: 'var(--tui-status-warning)',
      },
      { nonNullable: true }
    ),
  });

  addRoute() {
    this.isAddModalOpen = true;
  }
  submitAddForm() {
    if (this.addForm.invalid) return;

    const formValue = this.addForm.getRawValue();
    const dto: CreateClientDto = {
      ...formValue,
      status: formValue.status.value, // 💡 ВАЖНО: берем value
    };

    this.clientService.addRoute(dto).subscribe({
      next: () => {
        this.loadRoutes();
        this.addForm.reset();
        this.isButtonActive = true;
        this.isAddNewContact = false;
        this.isAddModalOpen = false;
      },
      error: (err) => console.error('Ошибка добавления:', err),
    });
  }
  deleteRoute(id: number): void {
    if (!confirm('Вы действительно хотите удалить маршрут?')) return;

    this.clientService.deleteRoute(id).subscribe({
      next: () => {
        // Удаляем маршрут из локального списка
        this.data = this.data.filter(item => item.id !== id);
      },
      error: (err) => {
        console.error('Ошибка удаления маршрута:', err);
        // Тут можно показать уведомление об ошибке
      }
    });
  }

  editRoute(id: number) {
    const item = this.data.find(d => d.id === id);
    if (!item) return;

    const matchedStatus = this.statusOptions.find(opt => opt.value === item.status.value) || this.statusOptions[0];

    this.editingRouteId = id;
    this.editForm.setValue({
      routeTitle: item.route.title,
      organization: item.title.title,
      name: item.cell.name,
      name2: item.cell.name2,
      phone: item.cell.phone,
      email: item.cell.email,
      status: matchedStatus,
      comment: item.comment,
      phone2: item.cell.phone2,
      subtitle: item.title.subtitle,
    });

    this.isEditModalOpen = true;
  }

  get addFormStatusControl(): FormControl<{ label: string; value: string; color: string }> {
    return this.addForm.get('status') as FormControl<{ label: string; value: string; color: string }>;
  }
  get editFormStatusControl(): FormControl<string> {
    return this.editForm.get('status') as unknown as FormControl<string>;
  }


  submitEditForm() {
    if (this.editingRouteId === null || this.editForm.invalid) return;

    const formValue = this.editForm.getRawValue();
    const dto = {
      ...formValue,
      status: formValue.status.value, // 💡 вытаскиваем значение
    };

    this.clientService.updateRoute(this.editingRouteId, dto).subscribe({
      next: (updated) => {
        const index = this.data.findIndex(d => d.id === this.editingRouteId);
        if (index !== -1) {
          this.data[index] = this.mapDtoToView(updated);
        }
        this.isEditModalOpen = false;
        this.editingRouteId = null;
      },
      error: (err) => console.error('Ошибка обновления:', err),
    });
  }


  cancelModals() {
    this.isAddModalOpen = false;
    this.isEditModalOpen = false;
    this.isButtonActive = true;
    this.isAddNewContact = false;
    this.addForm.reset();
    this.editForm.reset();
  }
  statusOptions = [
    { label: 'В процессе', value: 'В процессе', color: 'var(--tui-status-warning)' },
    { label: 'Выполнено', value: 'Выполнено', color: 'var(--tui-status-positive)' },
    { label: 'Не выполнено', value: 'Не выполнено', color: 'var(--tui-status-negative)' },
  ];

selectedStatus = this.statusOptions[0].value;
private getStatusColor(status: string): string {
  switch (status) {
    case 'Выполнено':
      return 'var(--tui-status-positive)';
    case 'Не выполнено':
      return 'var(--tui-status-negative)';
    default:
      return 'var(--tui-status-warning)';
  }
}
}