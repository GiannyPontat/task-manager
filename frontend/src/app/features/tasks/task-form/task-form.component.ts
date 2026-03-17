import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskRequest, TaskStatus, Priority } from '../../../core/models/task.model';

export interface TaskDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isEdit ? 'edit' : 'add_task' }}</mat-icon>
      {{ isEdit ? 'Modifier la tâche' : 'Nouvelle tâche' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" novalidate class="task-form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title"
                 placeholder="Titre de la tâche" />
          <mat-icon matSuffix>title</mat-icon>
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Le titre est requis.</mat-error>
          } @else if (form.get('title')?.hasError('maxlength') && form.get('title')?.touched) {
            <mat-error>Maximum 100 caractères.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"
                    placeholder="Description optionnelle…"
                    rows="4"></textarea>
          <mat-icon matSuffix>notes</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Statut</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s.value) {
              <mat-option [value]="s.value">
                <mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon>
                {{ s.label }}
              </mat-option>
            }
          </mat-select>
          <mat-icon matSuffix>flag</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Priorité</mat-label>
          <mat-select formControlName="priority">
            @for (p of priorities; track p.value) {
              <mat-option [value]="p.value">
                <mat-icon [style.color]="p.color">{{ p.icon }}</mat-icon>
                {{ p.label }}
              </mat-option>
            }
          </mat-select>
          <mat-icon matSuffix>priority_high</mat-icon>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">
        <mat-icon>close</mat-icon>
        Annuler
      </button>
      <button mat-raised-button color="primary" class="save-btn"
              [disabled]="form.invalid"
              (click)="save()">
        <mat-icon>save</mat-icon>
        Sauvegarder
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      padding: 24px 24px 8px;
    }

    .dialog-title mat-icon {
      width: 36px; height: 36px; font-size: 20px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 400px;
      padding-top: 8px;
    }

    .full-width { width: 100%; }

    mat-dialog-actions {
      padding: 12px 24px 20px;
      gap: 10px;
      border-top: 1px solid #f1f5f9;
    }

    .save-btn {
      flex: 1;
      height: 44px;
      border-radius: 10px !important;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important;
      font-weight: 600 !important;
      font-size: 0.9rem !important;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3) !important;
    }

    mat-option mat-icon {
      vertical-align: middle;
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<TaskFormComponent>);
  readonly data: TaskDialogData = inject(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data?.task;

  readonly statuses: { value: TaskStatus; label: string; icon: string; color: string }[] = [
    { value: 'TODO',        label: 'À faire',      icon: 'radio_button_unchecked', color: '#9e9e9e' },
    { value: 'IN_PROGRESS', label: 'En cours',     icon: 'autorenew',              color: '#ff9800' },
    { value: 'DONE',        label: 'Terminée',     icon: 'check_circle',           color: '#4caf50' },
  ];

  readonly priorities: { value: Priority; label: string; icon: string; color: string }[] = [
    { value: 'LOW',    label: 'Basse',   icon: 'arrow_downward', color: '#4caf50' },
    { value: 'MEDIUM', label: 'Moyenne', icon: 'remove',         color: '#ff9800' },
    { value: 'HIGH',   label: 'Haute',   icon: 'arrow_upward',   color: '#f44336' },
  ];

  form = this.fb.group({
    title:       [this.data?.task?.title ?? '',            [Validators.required, Validators.maxLength(100)]],
    description: [this.data?.task?.description ?? '',      []],
    status:      [this.data?.task?.status ?? ('TODO' as TaskStatus), [Validators.required]],
    priority:    [this.data?.task?.priority ?? ('LOW' as Priority),  [Validators.required]],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, status, priority } = this.form.getRawValue();
    const payload: TaskRequest = {
      title:       title!,
      description: description ?? undefined,
      status:      status as TaskStatus,
      priority:    priority as Priority,
    };

    this.dialogRef.close(payload);
  }
}
