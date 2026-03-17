import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { ColumnService } from '../../../core/services/column.service';
import { TaskService } from '../../../core/services/task.service';
import { KanbanColumn, Task, TaskRequest, Priority, TaskStatus } from '../../../core/models/task.model';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW:    '#10b981',
  MEDIUM: '#f59e0b',
  HIGH:   '#ef4444',
};

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DragDropModule,
  ],
  template: `
    <div class="kanban-page">

      <!-- ── Toolbar ── -->
      <div class="kanban-toolbar">
        <h1 class="board-title">
          <mat-icon>view_kanban</mat-icon>
          Tableau Kanban
        </h1>

        <!-- Search bar -->
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-label>Rechercher une tâche…</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput
                 [value]="searchQuery()"
                 (input)="searchQuery.set($any($event.target).value)" />
          @if (searchQuery()) {
            <button matSuffix mat-icon-button aria-label="Effacer" (click)="searchQuery.set('')">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <!-- Search hint -->
      @if (searchQuery()) {
        <p class="search-hint">
          <mat-icon>filter_list</mat-icon>
          {{ totalMatchingTasks() }} tâche(s) correspondent à
          <strong>"{{ searchQuery() }}"</strong>
        </p>
      }

      <!-- ── Loading ── -->
      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="48"></mat-spinner>
        </div>

      <!-- ── Empty state ── -->
      } @else if (columns().length === 0 && !addingColumn()) {
        <div class="empty-state">
          <mat-icon class="empty-icon">dashboard_customize</mat-icon>
          <p class="empty-text">Aucune colonne pour le moment.</p>
          <div class="empty-actions">
            <button mat-raised-button color="primary" (click)="initBoard()">
              <mat-icon>auto_awesome</mat-icon>
              Initialiser votre tableau
            </button>
            <button mat-stroked-button (click)="openAddColumn()">
              <mat-icon>add</mat-icon>
              Créer une colonne manuellement
            </button>
          </div>
        </div>

      <!-- ── Board ── -->
      } @else {
        <div class="board-scroll-wrapper">
          <div class="kanban-board" cdkDropListGroup>

            @for (col of columns(); track col.id) {
              <mat-card class="kanban-column" appearance="outlined">

                <!-- Column header -->
                <mat-card-header class="column-header">
                  <mat-card-title class="column-title">{{ col.title }}</mat-card-title>
                  <span class="task-count">
                    {{ filteredTasksFor(col).length }}
                    @if (searchQuery() && filteredTasksFor(col).length !== col.tasks.length) {
                      <span class="task-count-total"> / {{ col.tasks.length }}</span>
                    }
                  </span>
                  <button mat-icon-button class="delete-col-btn"
                          matTooltip="Supprimer la colonne"
                          (click)="deleteColumn(col)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </mat-card-header>

                <!-- Task list (drop zone) -->
                <mat-card-content class="column-body">
                  <div class="task-list"
                       cdkDropList
                       [cdkDropListData]="col.tasks"
                       [cdkDropListDisabled]="!!searchQuery()"
                       (cdkDropListDropped)="onDrop($event, col)">

                    @for (task of filteredTasksFor(col); track task.id) {
                      <mat-card class="task-card"
                                appearance="outlined"
                                cdkDrag
                                [style.border-left-color]="priorityColor(task.priority)"
                                [ngClass]="searchQuery() ? 'no-drag' : ''">

                        <!-- Drag handle -->
                        <div class="drag-handle" cdkDragHandle>
                          <mat-icon>drag_indicator</mat-icon>
                        </div>

                        <div class="task-header">
                          <span class="task-title"
                                [innerHTML]="highlightMatch(task.title, searchQuery())">
                          </span>
                          <div class="task-actions">
                            <button mat-icon-button class="task-btn"
                                    matTooltip="Modifier"
                                    (click)="editTask(col, task)">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button class="task-btn"
                                    matTooltip="Supprimer"
                                    (click)="deleteTask(col, task)">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        </div>

                        @if (task.description) {
                          <p class="task-description">{{ task.description }}</p>
                        }

                        <div class="task-chips">
                          <span class="chip" [ngClass]="'priority-' + task.priority.toLowerCase()">
                            <mat-icon class="chip-icon">{{ priorityIcon(task.priority) }}</mat-icon>
                            {{ priorityLabel(task.priority) }}
                          </span>
                          <span class="chip" [ngClass]="'status-' + task.status.toLowerCase()">
                            {{ statusLabel(task.status) }}
                          </span>
                        </div>

                        <div *cdkDragPlaceholder class="drag-placeholder"></div>
                      </mat-card>
                    }

                    @if (filteredTasksFor(col).length === 0) {
                      <div class="empty-column">
                        <mat-icon>{{ searchQuery() ? 'search_off' : 'inbox' }}</mat-icon>
                        <span>{{ searchQuery() ? 'Aucun résultat' : 'Déposez une tâche ici' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>

                <!-- Column footer -->
                <mat-card-actions class="column-footer">
                  <button mat-button color="primary" class="add-task-btn"
                          (click)="openAddTask(col)">
                    <mat-icon>add</mat-icon>
                    Ajouter une tâche
                  </button>
                </mat-card-actions>
              </mat-card>
            }

            <!-- Add column -->
            @if (addingColumn()) {
              <mat-card class="kanban-column new-column-form" appearance="outlined">
                <mat-card-content>
                  <form [formGroup]="columnForm" (ngSubmit)="submitColumn()" class="column-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom de la colonne</mat-label>
                      <input matInput formControlName="title" placeholder="Ex : Révision" />
                    </mat-form-field>
                    <div class="form-actions">
                      <button mat-raised-button color="primary" type="submit"
                              [disabled]="columnForm.invalid">Ajouter</button>
                      <button mat-button type="button" (click)="cancelAddColumn()">Annuler</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            } @else {
              <button mat-stroked-button class="add-column-btn" (click)="openAddColumn()">
                <mat-icon>add</mat-icon>
                Ajouter une colonne
              </button>
            }

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ══════════════════════════════════════════
       Page — light SaaS background
    ══════════════════════════════════════════ */
    .kanban-page {
      padding: 28px 28px 40px;
      min-height: calc(100vh - 58px);
      background: #f8fafc;
      box-sizing: border-box;
    }

    /* ── Toolbar ── */
    .kanban-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .board-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: -0.4px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #6366f1; }
    }

    .search-field {
      flex: 1;
      min-width: 200px;
      max-width: 420px;
    }

    /* Search hint */
    .search-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #6366f1;
      margin: 0 0 12px;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    /* ── Loading ── */
    .loading-center {
      display: flex;
      justify-content: center;
      padding-top: 80px;
    }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px 24px;
      text-align: center;
    }

    .empty-icon { font-size: 72px; width: 72px; height: 72px; color: #cbd5e1; }
    .empty-text { font-size: 1.05rem; color: #94a3b8; margin: 0; }
    .empty-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

    /* ══════════════════════════════════════════
       Board wrapper
    ══════════════════════════════════════════ */
    .board-scroll-wrapper {
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 24px;
      margin: 0 -28px;
      padding-left: 28px;
      padding-right: 28px;
    }

    .board-scroll-wrapper::-webkit-scrollbar { height: 5px; }
    .board-scroll-wrapper::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
    .board-scroll-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

    .kanban-board {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 18px;
      min-height: 400px;
      width: max-content;
      min-width: 100%;
    }

    /* ══════════════════════════════════════════
       Column
    ══════════════════════════════════════════ */
    .kanban-column {
      width: 300px;
      min-width: 300px;
      flex-shrink: 0;
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      border-top: 3px solid #6366f1 !important;
      background: #f1f5f9 !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04) !important;
      display: flex;
      flex-direction: column;
    }

    .column-header {
      display: flex !important;
      align-items: center;
      padding: 13px 14px 9px !important;
      border-bottom: 1px solid #e2e8f0;
    }

    .column-title {
      flex: 1;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      letter-spacing: 0.1px;
      margin: 0 !important;
    }

    .task-count {
      background: #e0e7ff;
      color: #4f46e5;
      border-radius: 20px;
      padding: 2px 9px;
      font-size: 0.7rem;
      font-weight: 700;
      margin-right: 4px;
      white-space: nowrap;
    }

    .task-count-total { opacity: 0.5; }

    .delete-col-btn {
      width: 28px; height: 28px; line-height: 1;
      display: inline-flex; align-items: center; justify-content: center;
      color: #cbd5e1;
      transition: color 0.2s, transform 0.15s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: #ef4444; transform: scale(1.15); }
    }

    /* ── Column body ── */
    .column-body { flex: 1; padding: 10px !important; }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-height: 60px;
    }

    .empty-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 22px 0;
      color: #cbd5e1;
      font-size: 0.8rem;
      border: 2px dashed #e2e8f0;
      border-radius: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }

    /* ══════════════════════════════════════════
       Task card
    ══════════════════════════════════════════ */
    .task-card {
      border-radius: 10px !important;
      padding: 10px 12px 12px !important;
      cursor: grab;
      transition: box-shadow 0.2s, transform 0.15s;
      position: relative;
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-left: 3px solid transparent !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.05) !important;
      &:hover {
        box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 15px -3px rgba(0,0,0,0.08) !important;
        transform: translateY(-2px);
      }
      &:active { cursor: grabbing; transform: scale(0.99); }
    }

    .task-card.no-drag { cursor: default; }

    .drag-handle {
      position: absolute;
      top: 7px; left: 6px;
      color: #e2e8f0;
      cursor: grab;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { color: #94a3b8; }
    }

    .drag-placeholder {
      background: #ede9fe;
      border: 2px dashed #a5b4fc;
      border-radius: 10px;
      min-height: 60px;
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    :host ::ng-deep .cdk-drag-preview {
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      border-radius: 10px;
      background: #fff;
      padding: 10px 12px 12px;
      border-left: 3px solid #6366f1;
    }

    :host ::ng-deep .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    :host ::ng-deep .task-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .task-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      padding-left: 18px;
    }

    .task-title {
      font-weight: 500;
      font-size: 0.875rem;
      color: #1e293b;
      flex: 1;
      line-height: 1.5;
      padding-top: 2px;
    }

    :host ::ng-deep .task-title mark {
      background: #fef9c3;
      color: #713f12;
      border-radius: 3px;
      padding: 0 2px;
    }

    .task-actions {
      display: flex;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .task-card:hover .task-actions { opacity: 1; }

    .task-btn {
      width: 26px; height: 26px; line-height: 1;
      display: inline-flex; align-items: center; justify-content: center;
      color: #94a3b8;
      transition: color 0.2s, transform 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { color: #334155; transform: scale(1.15); }
    }

    .task-description {
      font-size: 0.78rem;
      color: #64748b;
      margin: 4px 0 8px;
      line-height: 1.5;
      padding-left: 18px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Chips ── */
    .task-chips {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-top: 8px;
      padding-left: 18px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.67rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .chip-icon { font-size: 11px; width: 11px; height: 11px; }

    .priority-low    { background: #d1fae5; color: #065f46; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high   { background: #fee2e2; color: #991b1b; }
    .status-todo        { background: #f1f5f9; color: #475569; }
    .status-in_progress { background: #fef9c3; color: #713f12; }
    .status-done        { background: #d1fae5; color: #065f46; }

    /* ── Column footer ── */
    .column-footer {
      padding: 6px 10px 10px !important;
      border-top: 1px solid #e2e8f0;
    }

    .add-task-btn {
      width: 100%;
      font-size: 0.82rem;
      color: #6366f1 !important;
      border-radius: 8px !important;
      &:hover { background: #ede9fe !important; }
    }

    /* ── Add column inline button ── */
    .add-column-btn {
      width: 200px; min-width: 200px; height: 50px;
      flex-shrink: 0;
      align-self: flex-start;
      border-color: #c7d2fe !important;
      color: #6366f1 !important;
      border-style: dashed !important;
      border-radius: 14px !important;
      background: #f8fafc !important;
      transition: all 0.2s;
      &:hover {
        border-color: #818cf8 !important;
        background: #ede9fe !important;
      }
    }

    /* ── Add column form card ── */
    .new-column-form { border-top-color: #818cf8 !important; }

    .column-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }

    /* ══════════════════════════════════════════
       Responsive — mobile ≤ 600px
    ══════════════════════════════════════════ */
    @media (max-width: 600px) {
      .kanban-page { padding: 14px; }

      .kanban-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }

      .board-title {
        font-size: 1.2rem;
        mat-icon { font-size: 22px; width: 22px; height: 22px; }
      }

      .search-field { max-width: 100%; }

      .board-scroll-wrapper {
        margin: 0 -14px;
        padding-left: 14px;
        padding-right: 14px;
      }

      .kanban-column { width: 265px; min-width: 265px; }
    }
  `],
})
export class TaskBoardComponent implements OnInit {
  private readonly columnService = inject(ColumnService);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  columns = signal<KanbanColumn[]>([]);
  loading = signal(true);
  addingColumn = signal(false);
  searchQuery = signal('');

  totalMatchingTasks = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return 0;
    return this.columns().reduce(
      (acc, col) => acc + col.tasks.filter(t => t.title.toLowerCase().includes(q)).length,
      0
    );
  });

  columnForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.loading.set(true);
    this.columnService.getColumns().subscribe({
      next: (cols) => { this.columns.set(cols); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify('Erreur lors du chargement'); },
    });
  }

  /* ── Init ── */

  initBoard(): void {
    this.loading.set(true);
    this.columnService.initDefaultColumns().subscribe({
      next: (cols) => { this.columns.set(cols); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify('Erreur lors de l\'initialisation'); },
    });
  }

  /* ── Search ── */

  filteredTasksFor(col: KanbanColumn): Task[] {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return col.tasks;
    return col.tasks.filter(t => t.title.toLowerCase().includes(q));
  }

  highlightMatch(title: string, query: string): string {
    if (!query.trim()) return title;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return title.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  /* ── Column actions ── */

  openAddColumn(): void {
    this.columnForm.reset({ title: '' });
    this.addingColumn.set(true);
  }

  cancelAddColumn(): void {
    this.addingColumn.set(false);
  }

  submitColumn(): void {
    if (this.columnForm.invalid) return;
    const title = this.columnForm.value.title!;
    const position = this.columns().length;
    this.columnService.createColumn({ title, position }).subscribe({
      next: (col) => {
        this.columns.update(cols => [...cols, col]);
        this.addingColumn.set(false);
        this.notify(`Colonne "${col.title}" créée`);
      },
      error: () => this.notify('Erreur lors de la création'),
    });
  }

  deleteColumn(col: KanbanColumn): void {
    if (!confirm(`Supprimer la colonne "${col.title}" et toutes ses tâches ?`)) return;
    this.columnService.deleteColumn(col.id).subscribe({
      next: () => {
        this.columns.update(cols => cols.filter(c => c.id !== col.id));
        this.notify(`Colonne "${col.title}" supprimée`);
      },
      error: () => this.notify('Erreur lors de la suppression'),
    });
  }

  /* ── Drag & Drop ── */

  onDrop(event: CdkDragDrop<Task[]>, targetCol: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      this.columns.update(cols => cols.map(c => {
        if (c.id !== targetCol.id) return c;
        const tasks = [...c.tasks];
        moveItemInArray(tasks, event.previousIndex, event.currentIndex);
        return { ...c, tasks };
      }));
    } else {
      const sourceCol = this.columns().find(c => c.tasks === event.previousContainer.data)!;
      let sourceTasks: Task[] = [];
      let targetTasks: Task[] = [];

      this.columns.update(cols => cols.map(c => {
        if (c.id === sourceCol.id) { sourceTasks = [...c.tasks]; return { ...c, tasks: sourceTasks }; }
        if (c.id === targetCol.id) { targetTasks = [...c.tasks]; return { ...c, tasks: targetTasks }; }
        return c;
      }));

      transferArrayItem(sourceTasks, targetTasks, event.previousIndex, event.currentIndex);

      this.columns.update(cols => cols.map(c => {
        if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
        if (c.id === targetCol.id) return { ...c, tasks: targetTasks };
        return c;
      }));
    }

    const movedTask = event.container.data[event.currentIndex];
    this.taskService.moveTask(movedTask.id, targetCol.id, event.currentIndex).subscribe({
      error: () => { this.notify('Erreur lors du déplacement, rechargement…'); this.loadColumns(); },
    });
  }

  /* ── Task actions ── */

  openAddTask(col: KanbanColumn): void {
    const ref = this.dialog.open(TaskFormComponent, { data: {} });
    ref.afterClosed().subscribe((payload: TaskRequest | undefined) => {
      if (!payload) return;
      this.taskService.createTask({ ...payload, columnId: col.id }).subscribe({
        next: (task) => {
          this.columns.update(cols =>
            cols.map(c => c.id === col.id ? { ...c, tasks: [...c.tasks, task] } : c)
          );
          this.notify(`Tâche "${task.title}" créée`);
        },
        error: () => this.notify('Erreur lors de la création'),
      });
    });
  }

  editTask(col: KanbanColumn, task: Task): void {
    const ref = this.dialog.open(TaskFormComponent, { data: { task } });
    ref.afterClosed().subscribe((payload: TaskRequest | undefined) => {
      if (!payload) return;
      this.taskService.updateTask(task.id, { ...payload, columnId: col.id }).subscribe({
        next: (updated) => {
          this.columns.update(cols =>
            cols.map(c => c.id === col.id
              ? { ...c, tasks: c.tasks.map(t => t.id === task.id ? updated : t) }
              : c)
          );
          this.notify('Tâche modifiée');
        },
        error: () => this.notify('Erreur lors de la modification'),
      });
    });
  }

  deleteTask(col: KanbanColumn, task: Task): void {
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.columns.update(cols =>
          cols.map(c => c.id === col.id
            ? { ...c, tasks: c.tasks.filter(t => t.id !== task.id) }
            : c)
        );
        this.notify('Tâche supprimée');
      },
      error: () => this.notify('Erreur lors de la suppression'),
    });
  }

  /* ── Helpers ── */

  priorityColor(p: Priority): string {
    return PRIORITY_COLORS[p];
  }

  priorityLabel(p: Priority): string {
    return ({ LOW: 'Basse', MEDIUM: 'Moyenne', HIGH: 'Haute' } as Record<string, string>)[p];
  }

  priorityIcon(p: Priority): string {
    return ({ LOW: 'arrow_downward', MEDIUM: 'remove', HIGH: 'arrow_upward' } as Record<string, string>)[p];
  }

  statusLabel(s: TaskStatus): string {
    return ({ TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Terminée' } as Record<string, string>)[s];
  }

  private notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
