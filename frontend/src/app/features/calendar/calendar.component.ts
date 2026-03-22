import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

import { ColumnService } from '../../core/services/column.service';
import { ProjectService } from '../../core/services/project.service';
import { Task, Priority } from '../../core/models/task.model';
import { TaskFormComponent } from '../tasks/task-form/task-form.component';

const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH:   '#ff4d4d',
  MEDIUM: '#ffbd2e',
  LOW:    '#2ecc71',
};

interface CalendarView { key: string; label: string; }

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule,
    FullCalendarModule,
  ],
  template: `
    <div class="cal-page">

      <!-- ── Page header ── -->
      <div class="page-header">
        <div class="page-title-group">
          <mat-icon class="page-icon">calendar_today</mat-icon>
          <div>
            <h1 class="page-title">Calendrier</h1>
            <p class="page-sub">{{ events().length }} tâche(s) planifiée(s)</p>
          </div>
        </div>
      </div>

      <!-- ── Calendar card ── -->
      <div class="cal-card">

        <!-- Custom toolbar -->
        <div class="cal-toolbar">
          <div class="toolbar-left">
            <button class="nav-btn" (click)="prev()" matTooltip="Précédent">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button class="today-btn" (click)="today()">Aujourd'hui</button>
            <button class="nav-btn" (click)="next()" matTooltip="Suivant">
              <mat-icon>chevron_right</mat-icon>
            </button>
            <span class="cal-title">{{ currentTitle() }}</span>
          </div>

          <div class="toolbar-right">
            @for (v of views; track v.key) {
              <button
                class="view-btn"
                [class.active]="activeView() === v.key"
                (click)="changeView(v.key)"
              >{{ v.label }}</button>
            }
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="cal-loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <!-- FullCalendar -->
        <full-calendar
          #calendarRef
          [options]="calendarOptions"
          [class.fc-hidden]="loading()"
        ></full-calendar>

      </div>
    </div>
  `,
  styles: [`
    /* ══════════════════════════════════════
       Page
    ══════════════════════════════════════ */
    .cal-page {
      padding: 28px 24px 40px;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-title-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .page-icon {
      font-size: 28px; width: 28px; height: 28px;
      color: #6366f1;
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }

    .page-sub {
      margin: 2px 0 0;
      font-size: 0.78rem;
      color: #64748b;
    }

    /* ══════════════════════════════════════
       Calendar card
    ══════════════════════════════════════ */
    .cal-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    /* ── Custom toolbar ── */
    .cal-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
    }

    .today-btn {
      height: 32px;
      padding: 0 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      &:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
    }

    .cal-title {
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-left: 8px;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .toolbar-right {
      display: flex;
      gap: 4px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 3px;
    }

    .view-btn {
      height: 28px;
      padding: 0 14px;
      border-radius: 7px;
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      &:hover { color: #cbd5e1; }
    }

    .view-btn.active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }

    /* ── Loading ── */
    .cal-loading {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .fc-hidden { display: none; }

    /* ══════════════════════════════════════
       FullCalendar dark theme overrides
    ══════════════════════════════════════ */
    :host ::ng-deep {
      /* Core variables */
      --fc-border-color: rgba(255, 255, 255, 0.07);
      --fc-page-bg-color: transparent;
      --fc-neutral-bg-color: rgba(255, 255, 255, 0.03);
      --fc-today-bg-color: rgba(99, 102, 241, 0.1);
      --fc-highlight-color: rgba(99, 102, 241, 0.15);
      --fc-event-bg-color: #6366f1;
      --fc-event-border-color: transparent;
      --fc-event-text-color: #fff;
      --fc-non-business-color: rgba(255, 255, 255, 0.015);

      /* Remove default button toolbar (we use our own) */
      .fc-header-toolbar { display: none !important; }

      /* Table borders */
      .fc-scrollgrid,
      .fc-scrollgrid-section > td,
      .fc-scrollgrid-section > th {
        border-color: rgba(255, 255, 255, 0.07) !important;
      }

      /* Day header (Mon Tue …) */
      .fc-col-header-cell {
        padding: 10px 0;
        background: rgba(255, 255, 255, 0.03);
      }

      .fc-col-header-cell-cushion {
        color: #64748b !important;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        text-decoration: none !important;
      }

      /* Day number */
      .fc-daygrid-day-number {
        color: #475569;
        font-size: 0.78rem;
        font-weight: 500;
        padding: 6px 10px;
        text-decoration: none !important;
        transition: color 0.15s;
      }

      /* Today highlight */
      .fc-day-today .fc-daygrid-day-number {
        color: #818cf8 !important;
        font-weight: 700;
      }

      .fc-day-today {
        background: rgba(99, 102, 241, 0.08) !important;
      }

      /* Outside days */
      .fc-day-other .fc-daygrid-day-number {
        color: #2d3748 !important;
      }

      /* Cell hover */
      .fc-daygrid-day:hover {
        background: rgba(255, 255, 255, 0.02) !important;
      }

      /* Events */
      .fc-daygrid-event {
        border-radius: 5px !important;
        padding: 2px 6px !important;
        font-size: 0.72rem !important;
        font-weight: 500 !important;
        border: none !important;
        cursor: pointer;
        margin: 1px 2px !important;
        transition: opacity 0.15s, transform 0.1s !important;
      }

      .fc-daygrid-event:hover {
        opacity: 0.85 !important;
        transform: translateY(-1px) !important;
      }

      .fc-event-title {
        font-size: 0.72rem !important;
        font-weight: 500 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* "more" link */
      .fc-daygrid-more-link {
        color: #6366f1 !important;
        font-size: 0.7rem !important;
        font-weight: 600 !important;
      }

      /* Time grid (week/day) */
      .fc-timegrid-slot-label-cushion,
      .fc-timegrid-axis-cushion {
        color: #475569 !important;
        font-size: 0.7rem !important;
      }

      .fc-timegrid-event {
        border-radius: 6px !important;
        border: none !important;
        font-size: 0.72rem !important;
      }

      /* Scrollbar */
      .fc-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
      .fc-scroller::-webkit-scrollbar-track { background: transparent; }
      .fc-scroller::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
      }
    }

    /* ── full-calendar padding ── */
    :host ::ng-deep .fc {
      padding: 0 4px 16px;
    }
  `],
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendarRef') calendarRef!: FullCalendarComponent;

  private readonly columnService  = inject(ColumnService);
  private readonly projectService = inject(ProjectService);
  private readonly dialog         = inject(MatDialog);

  events   = signal<EventInput[]>([]);
  loading  = signal(true);
  activeView  = signal('dayGridMonth');
  currentTitle = signal('');

  readonly views: CalendarView[] = [
    { key: 'dayGridMonth',  label: 'Mois'    },
    { key: 'timeGridWeek',  label: 'Semaine' },
    { key: 'timeGridDay',   label: 'Jour'    },
  ];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    firstDay: 1,
    headerToolbar: false,
    height: 'auto',
    dayMaxEvents: 3,
    editable: false,
    selectable: false,
    events: [],
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    datesSet: (arg: DatesSetArg) => this.currentTitle.set(arg.view.title),
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const projectId = this.projectService.selected()?.id;
    if (!projectId) return;
    this.columnService.getColumns(projectId).subscribe({
      next: (cols) => {
        const mapped: EventInput[] = cols.flatMap(col =>
          col.tasks.map(task => ({
            id:              task.id.toString(),
            title:           task.title,
            date:            task.dueDate ?? task.createdAt?.split('T')[0],
            backgroundColor: PRIORITY_COLOR[task.priority],
            borderColor:     'transparent',
            textColor:       '#fff',
            extendedProps:   { task, columnTitle: col.title },
          }))
        );
        this.events.set(mapped);
        this.calendarOptions = { ...this.calendarOptions, events: mapped };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /* ── Toolbar actions ── */

  prev(): void  { this.calendarRef?.getApi().prev(); }
  next(): void  { this.calendarRef?.getApi().next(); }
  today(): void { this.calendarRef?.getApi().today(); }

  changeView(view: string): void {
    this.activeView.set(view);
    this.calendarRef?.getApi().changeView(view);
  }

  /* ── Event click → open task modal ── */

  onEventClick(arg: EventClickArg): void {
    const task = arg.event.extendedProps['task'] as Task;
    const ref = this.dialog.open(TaskFormComponent, {
      data:          { task },
      maxWidth:      '760px',
      minWidth:      '620px',
      panelClass:    'dark-dialog',
      backdropClass: 'dark-backdrop',
    });

    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      // Refresh calendar after edit
      this.loadTasks();
    });
  }
}
