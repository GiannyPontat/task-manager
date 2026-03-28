import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, distinctUntilChanged } from 'rxjs';
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
import { ProjectService } from '../../../core/services/project.service';
import { SidebarService } from '../../../core/services/sidebar.service';
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
          {{ projectService.selected()?.name ?? 'Tableau Kanban' }}
        </h1>
        <div class="toolbar-spacer"></div>
        @if (columns().length > 0) {
          <button class="new-task-btn" (click)="openAddTask(columns()[0])">
            <mat-icon>add</mat-icon>
            Nouvelle Tâche
          </button>
        }
      </div>

      <!-- ── No project selected ── -->
      @if (!projectService.selected()) {
        <div class="empty-state">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <p class="empty-text">Sélectionnez ou créez un projet dans la barre latérale.</p>
        </div>

      <!-- ── Loading ── -->
      } @else if (loading()) {
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
          <div class="kanban-board"
               cdkDropList
               cdkDropListOrientation="horizontal"
               [cdkDropListData]="columns()"
               (cdkDropListDropped)="onColumnDrop($event)">

            @for (col of columns(); track col.id) {
              <mat-card class="kanban-column" appearance="outlined"
                        cdkDrag [cdkDragData]="col">

                <!-- Column drag preview -->
                <div *cdkDragPlaceholder class="column-drag-placeholder"></div>

                <!-- Column header -->
                <mat-card-header class="column-header">
                  <mat-icon class="col-drag-handle" cdkDragHandle
                            matTooltip="Déplacer la colonne">drag_indicator</mat-icon>
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
                       [id]="'task-list-' + col.id"
                       [cdkDropListData]="col.tasks"
                       [cdkDropListConnectedTo]="taskListIds()"
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
                          @for (member of (task.assignedMembers ?? []); track member) {
                            <span class="chip chip-member" [matTooltip]="member">
                              <span class="member-dot">{{ memberInitials(member) }}</span>
                              {{ member }}
                            </span>
                          }
                        </div>

                        <div *cdkDragPlaceholder class="drag-placeholder"></div>
                      </mat-card>
                    }

                    @if (filteredTasksFor(col).length === 0) {
                      <div class="empty-column" [class.empty-column--compact]="col.tasks.length > 0">
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
       Page — fond hérite du thème
    ══════════════════════════════════════════ */
    .kanban-page {
      padding: 32px 32px 40px;
      min-height: 100vh;
      background: transparent;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
    }

    /* ── Toolbar ── */
    .kanban-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }

    .board-title {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-main);
      white-space: nowrap;
      letter-spacing: -0.6px;
      mat-icon { font-size: 30px; width: 30px; height: 30px; color: var(--primary); }
    }

    .toolbar-spacer { flex: 1; }

    .new-task-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 18px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
      }
      &:active { transform: scale(0.97); }
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

    .empty-icon { font-size: 72px; width: 72px; height: 72px; color: var(--text-muted); }
    .empty-text { font-size: 1.05rem; color: var(--text-muted); margin: 0; }
    .empty-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

    /* ══════════════════════════════════════════
       Board wrapper
    ══════════════════════════════════════════ */
    .board-scroll-wrapper {
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 24px;
    }

    .board-scroll-wrapper::-webkit-scrollbar { height: 4px; }
    .board-scroll-wrapper::-webkit-scrollbar-track { background: transparent; }
    .board-scroll-wrapper::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 10px;
    }

    .kanban-board {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 24px;
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
      border-radius: 16px !important;
      border: 1px solid var(--border) !important;
      background: var(--bg-card) !important;
      box-shadow: var(--shadow) !important;
      display: flex;
      flex-direction: column;
    }

    .column-drag-placeholder {
      width: 300px;
      min-height: 200px;
      background: rgba(99,102,241,0.08);
      border: 2px dashed rgba(99,102,241,0.35);
      border-radius: 16px;
      flex-shrink: 0;
    }

    :host ::ng-deep .cdk-drag-preview.kanban-column {
      box-shadow: 0 24px 48px rgba(0,0,0,0.5);
      border-radius: 16px;
      opacity: 0.92;
    }

    :host ::ng-deep .kanban-board.cdk-drop-list-dragging .kanban-column:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0.2, 0, 0, 1);
    }

    .col-drag-handle {
      font-size: 16px; width: 16px; height: 16px;
      color: var(--text-muted);
      cursor: grab;
      flex-shrink: 0;
      transition: color 0.2s;
      &:hover { color: var(--text-secondary); }
    }

    .column-header {
      display: flex !important;
      align-items: center !important;
      gap: 8px;
      padding: 14px 14px 10px !important;
      border-bottom: 1px solid var(--border);
      flex-direction: row !important;
    }

    .column-title {
      flex: 1;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      color: var(--text-main) !important;
      letter-spacing: 0.1px;
      margin: 0 !important;
      line-height: 1.2 !important;
    }

    .task-count {
      background: rgba(99,102,241,0.2);
      color: #a5b4fc;
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 20px;
      padding: 2px 9px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
      line-height: 1.6;
    }

    .task-count-total { opacity: 0.5; }

    .delete-col-btn {
      width: 28px; height: 28px; line-height: 1;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--text-muted);
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
      color: var(--text-muted);
      font-size: 0.78rem;
      border: 1.5px dashed var(--border);
      border-radius: 14px;
      transition: padding 0.2s;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    .empty-column--compact {
      padding: 10px 0;
      font-size: 0.72rem;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* ══════════════════════════════════════════
       Task card
    ══════════════════════════════════════════ */
    .task-card {
      border-radius: 10px !important;
      padding: 12px 14px 14px !important;
      cursor: grab;
      transition: box-shadow 0.2s, transform 0.15s, background 0.2s;
      position: relative;
      background: var(--bg-card) !important;
      border: 1px solid var(--border) !important;
      border-left: 3px solid transparent !important;
      box-shadow: var(--shadow) !important;
      &:hover {
        background: var(--bg-panel-hover) !important;
        box-shadow: var(--shadow) !important;
        transform: translateY(-2px);
      }
      &:active { cursor: grabbing; transform: scale(0.99); }
    }

    .task-card.no-drag { cursor: default; }

    .drag-handle {
      position: absolute;
      top: 7px; left: 6px;
      color: var(--text-muted);
      cursor: grab;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { color: var(--text-secondary); }
    }

    .drag-placeholder {
      background: rgba(99,102,241,0.1);
      border: 2px dashed rgba(99,102,241,0.4);
      border-radius: 10px;
      min-height: 60px;
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    :host ::ng-deep .cdk-drag-preview {
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      border-radius: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 10px 12px 12px;
      border-left: 3px solid var(--primary);
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
      color: var(--text-main);
      flex: 1;
      line-height: 1.5;
      padding-top: 2px;
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
      color: var(--text-muted);
      transition: color 0.2s, transform 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { color: var(--text-main); transform: scale(1.15); }
    }

    .task-description {
      font-size: 0.78rem;
      color: var(--text-muted);
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
      margin-top: 12px;
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

    .priority-low    { background: rgba(16,185,129,0.15); color: #059669; }
    .priority-medium { background: rgba(245,158,11,0.15); color: #d97706; }
    .priority-high   { background: rgba(239,68,68,0.15);  color: #dc2626; }

    .chip-member {
      background: rgba(99,102,241,0.12);
      color: var(--primary);
      gap: 5px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .member-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 0.55rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .status-todo        { background: var(--bg-panel); color: var(--text-muted); }
    .status-in_progress { background: rgba(245,158,11,0.15); color: #d97706; }
    .status-done        { background: rgba(16,185,129,0.15); color: #059669; }

    /* ── Column footer ── */
    .column-footer {
      padding: 6px 10px 10px !important;
      border-top: 1px solid var(--border);
    }

    .add-task-btn {
      width: 100%;
      font-size: 0.82rem;
      color: var(--primary) !important;
      border-radius: 8px !important;
      border: 1px dashed var(--primary) !important;
      background: transparent !important;
      transition: background 0.18s, border-color 0.18s !important;
      &:hover {
        background: rgba(99,102,241,0.08) !important;
        color: var(--primary) !important;
      }
    }

    /* ── Add column inline button ── */
    .add-column-btn {
      width: 200px; min-width: 200px; height: 50px;
      flex-shrink: 0;
      align-self: flex-start;
      border-color: var(--primary) !important;
      color: var(--primary) !important;
      border-style: dashed !important;
      border-radius: 14px !important;
      background: transparent !important;
      transition: all 0.2s;
      opacity: 0.7;
      &:hover {
        background: rgba(99,102,241,0.08) !important;
        opacity: 1;
      }
    }

    /* ── Add column form card ── */
    .new-column-form {
      background: var(--bg-panel) !important;
      border-color: var(--primary) !important;
    }

    .column-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }

    /* mat-form-field inside add-column form */
    :host ::ng-deep .new-column-form .mat-mdc-text-field-wrapper {
      background: var(--input-bg) !important;
    }
    :host ::ng-deep .new-column-form .mdc-notched-outline__leading,
    :host ::ng-deep .new-column-form .mdc-notched-outline__notch,
    :host ::ng-deep .new-column-form .mdc-notched-outline__trailing {
      border-color: var(--border) !important;
    }
    :host ::ng-deep .new-column-form .mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .new-column-form .mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .new-column-form .mat-focused .mdc-notched-outline__trailing {
      border-color: var(--primary) !important;
    }
    :host ::ng-deep .new-column-form .mdc-floating-label { color: var(--text-muted) !important; }
    :host ::ng-deep .new-column-form input.mat-mdc-input-element { color: var(--text-main) !important; caret-color: var(--primary); }
    :host ::ng-deep .new-column-form .mat-mdc-button { color: var(--text-muted) !important; }

    /* ══════════════════════════════════════════
       Responsive — mobile ≤ 600px
    ══════════════════════════════════════════ */
    @media (max-width: 600px) {
      .kanban-page { padding: 16px; }

      .kanban-toolbar { margin-bottom: 20px; }

      .board-title {
        font-size: 1.35rem;
        mat-icon { font-size: 24px; width: 24px; height: 24px; }
      }

      .kanban-column { width: 265px; min-width: 265px; }
    }
  `],
})
export class TaskBoardComponent {
  private readonly columnService  = inject(ColumnService);
  private readonly taskService    = inject(TaskService);
  readonly projectService         = inject(ProjectService);
  private readonly sidebarService = inject(SidebarService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  columns = signal<KanbanColumn[]>([]);
  loading = signal(true);
  addingColumn = signal(false);
  searchQuery = signal('');

  taskListIds = computed(() => this.columns().map(c => 'task-list-' + c.id));

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

  constructor() {
    toObservable(this.projectService.selected).pipe(
      filter(p => p !== null),
      distinctUntilChanged((a, b) => a?.id === b?.id),
      takeUntilDestroyed(),
    ).subscribe(() => this.loadColumns());
  }

  private get projectId(): number {
    return this.projectService.selected()!.id;
  }

  loadColumns(): void {
    this.loading.set(true);
    this.columnService.getColumns(this.projectId).subscribe({
      next: (cols) => { this.columns.set(cols); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify('Erreur lors du chargement'); },
    });
  }

  /* ── Init ── */

  initBoard(): void {
    this.notify('Créez un projet pour initialiser un tableau.');
  }

  /* ── Search ── */

  filteredTasksFor(col: KanbanColumn): Task[] {
    let tasks = col.tasks;
    const priority = this.sidebarService.priorityFilter();
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    const q = this.searchQuery().trim().toLowerCase();
    if (q) tasks = tasks.filter(t => t.title.toLowerCase().includes(q));
    return tasks;
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
    this.columnService.createColumn(this.projectId, { title, position }).subscribe({
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
    this.columnService.deleteColumn(this.projectId, col.id).subscribe({
      next: () => {
        this.columns.update(cols => cols.filter(c => c.id !== col.id));
        this.notify(`Colonne "${col.title}" supprimée`);
      },
      error: () => this.notify('Erreur lors de la suppression'),
    });
  }

  /* ── Drag & Drop ── */

  onColumnDrop(event: CdkDragDrop<KanbanColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.columns.update(cols => {
      const updated = [...cols];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated;
    });
    const positions = this.columns().map((c, i) => ({ id: c.id, position: i }));
    this.columnService.reorderColumns(this.projectId, positions).subscribe({
      error: () => { this.notify('Erreur lors du réordonnancement'); this.loadColumns(); },
    });
  }

  onDrop(event: CdkDragDrop<Task[]>, targetCol: KanbanColumn): void {
    // Capture the task before any mutation
    const movedTask: Task = { ...event.previousContainer.data[event.previousIndex] };
    const newStatus = targetCol.linkedStatus;
    if (newStatus) movedTask.status = newStatus;

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
      // Apply optimistic status update on the moved task in targetTasks
      const idx = targetTasks.findIndex(t => t.id === movedTask.id);
      if (idx !== -1) targetTasks[idx] = movedTask;

      this.columns.update(cols => cols.map(c => {
        if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
        if (c.id === targetCol.id) return { ...c, tasks: targetTasks };
        return c;
      }));
    }

    this.taskService.moveTask(this.projectId, movedTask.id, targetCol.id, event.currentIndex, newStatus).subscribe({
      error: () => { this.notify('Erreur lors du déplacement, rechargement…'); this.loadColumns(); },
    });
  }

  /* ── Task actions ── */

  openAddTask(col: KanbanColumn): void {
    const ref = this.dialog.open(TaskFormComponent, { data: { projectId: this.projectId }, maxWidth: '760px', minWidth: '620px', panelClass: 'dark-dialog', backdropClass: 'dark-backdrop' });
    ref.afterClosed().subscribe((payload: TaskRequest | undefined) => {
      if (!payload) return;
      this.taskService.createTask(this.projectId, { ...payload, columnId: col.id }).subscribe({
        next: (task) => {
          this.columns.update(cols =>
            cols.map(c => c.id === col.id ? { ...c, tasks: [...c.tasks, task] } : c)
          );
          this.taskService.tasksChanged.update(v => v + 1);
          this.notify(`Tâche "${task.title}" créée`);
        },
        error: () => this.notify('Erreur lors de la création'),
      });
    });
  }

  editTask(col: KanbanColumn, task: Task): void {
    const ref = this.dialog.open(TaskFormComponent, { data: { task, projectId: this.projectId }, maxWidth: '760px', minWidth: '620px', panelClass: 'dark-dialog', backdropClass: 'dark-backdrop' });
    ref.afterClosed().subscribe((payload: TaskRequest | undefined) => {
      if (!payload) return;
      this.taskService.updateTask(this.projectId, task.id, { ...payload, columnId: col.id }).subscribe({
        next: (updated) => {
          this.columns.update(cols =>
            cols.map(c => c.id === col.id
              ? { ...c, tasks: c.tasks.map(t => t.id === task.id ? updated : t) }
              : c)
          );
          this.taskService.tasksChanged.update(v => v + 1);
          this.notify('Tâche modifiée');
        },
        error: () => this.notify('Erreur lors de la modification'),
      });
    });
  }

  deleteTask(col: KanbanColumn, task: Task): void {
    this.taskService.deleteTask(this.projectId, task.id).subscribe({
      next: () => {
        this.columns.update(cols =>
          cols.map(c => c.id === col.id
            ? { ...c, tasks: c.tasks.filter(t => t.id !== task.id) }
            : c)
        );
        this.taskService.tasksChanged.update(v => v + 1);
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

  memberInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  private notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
