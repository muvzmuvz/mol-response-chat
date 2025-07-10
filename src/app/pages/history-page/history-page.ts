import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, CommonModule } from '@angular/common';

import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import {
  TuiInputDateRange,
  TuiCalendarRange,
} from '@taiga-ui/kit';
import { TuiStatus } from '@taiga-ui/kit';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiCell } from '@taiga-ui/layout';
import { HistoryService } from '../../service/historyService/history-service';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    CommonModule,
    TuiTable,
    TuiStatus,
    TuiTextfield,
    TuiInputDateRange,
    TuiCalendarRange,
    Navbar,
    TuiCell
  ],
  templateUrl: './history-page.html',
  styleUrls: ['./history-page.less'],
})
export class HistoryPage implements OnInit {
  constructor(private historyService: HistoryService) { }
  protected readonly sizes = ['l', 'm', 's'] as const;
  sortColumn: string = ''; // какая колонка сортируется
  sortDirection: 'asc' | 'desc' = 'asc'; // направление сортировки
  search = '';
  data: any[] = [];
  routeOptions: { id: string; name: string }[] = [];

  size: 's' | 'm' | 'l' = 'm';
  route = 'all';

  // Функция для форматирования даты в "YYYY-MM-DD"
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Вычисляем вчерашнюю дату для установки в dateRange.to
  private getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(yesterday);
  }
  private getToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Диапазон дат с типом, где from и to — строки в формате "YYYY-MM-DD" или null
  dateRange: { from: string | null; to: string | null } = {
    from: this.getYesterday(),
    to: this.getToday(),
  };

  minDateString = '2023-01-01';
  maxDateString = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  })();


  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.historyService.getAll().subscribe((clients) => {
      const allHistory = [];

      for (const client of clients) {
        const routeTitle = client.route?.title || 'Без маршрута';

        for (const entry of client.history) {
          allHistory.push({
            routeTitle,
            organization: client.organization,
            name: client.name,
            phone: client.phone,
            status: entry.status,
            date: entry.date,
            comment: client.comment, // ISO строка с датой и временем
          });
        }
      }

      this.data = allHistory;

      const routeNames = Array.from(
        new Set(
          this.data.map((d) => d.routeTitle?.split('-')[0]).filter(Boolean)
        )
      );

      this.routeOptions = [
        { id: 'all', name: 'Все маршруты' },
        ...routeNames.map((n) => ({ id: n, name: n })),
      ];
    });
  }

  get filteredData() {
    const searchTerm = this.search.toLowerCase().trim();

    // Преобразуем строки из dateRange в миллисекунды для сравнения
    const fromDate = this.dateRange.from
      ? new Date(this.dateRange.from + 'T00:00:00').getTime()
      : null;

    const toDate = this.dateRange.to
      ? new Date(this.dateRange.to + 'T23:59:59.999').getTime()
      : null;

    let filtered = this.data.filter((item) => {
      const routeMatch =
        this.route === 'all' ||
        item.routeTitle.toLowerCase().startsWith(this.route.toLowerCase());

      const itemDate = new Date(item.date).getTime();

      const dateMatch =
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate);

      const searchMatch =
        !searchTerm ||
        item.routeTitle.toLowerCase().includes(searchTerm) ||
        item.organization.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.phone.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm);

      return routeMatch && dateMatch && searchMatch;
    });

    if (this.sortColumn) {
      filtered = filtered.sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        if (this.sortColumn === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else {
          aVal = aVal?.toString().toLowerCase() || '';
          bVal = bVal?.toString().toLowerCase() || '';
        }

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = '';
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Выполнено':
        return 'var(--tui-status-positive)';
      case 'Не выполнено':
        return 'var(--tui-status-negative)';
      default:
        return 'var(--tui-status-warning)';
    }
  }

  // Форматируем дату с временем для отображения
  formatDateTime(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}



