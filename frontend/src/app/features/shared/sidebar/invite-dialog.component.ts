import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule,
  ],
  template: `
    <div class="dlg">
      <div class="dlg-header">
        <div class="header-icon"><mat-icon>person_add</mat-icon></div>
        <h2 class="dlg-title">Inviter un membre</h2>
        <button mat-icon-button class="close-btn" (click)="cancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dlg-body">
        <p class="dlg-hint">Entrez l'adresse e-mail de la personne à inviter dans cet espace de travail.</p>
        <mat-form-field appearance="outline" class="email-field">
          <mat-label>Adresse e-mail</mat-label>
          <mat-icon matPrefix class="prefix-icon">email</mat-icon>
          <input
            matInput
            type="email"
            [(ngModel)]="email"
            placeholder="exemple@mail.com"
            (keyup.enter)="invite()"
            #emailInput="ngModel"
            email
          />
          @if (email && !emailValid()) {
            <mat-error>Adresse e-mail invalide.</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="dlg-footer">
        <button mat-button class="cancel-btn" (click)="cancel()">Annuler</button>
        <button mat-raised-button class="invite-btn" [disabled]="!emailValid()" (click)="invite()">
          <mat-icon>send</mat-icon>
          Envoyer l'invitation
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dlg {
      background: var(--navbar-bg);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, sans-serif;
      border-radius: 16px;
      min-width: min(380px, calc(100vw - 32px));
      overflow: hidden;
    }

    .dlg-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 14px;
      border-bottom: 1px solid var(--divider);
    }

    .header-icon {
      width: 32px; height: 32px; flex-shrink: 0;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #fff; }
    }

    .dlg-title {
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-main);
    }

    .close-btn { color: var(--text-muted) !important; &:hover { color: var(--text-secondary) !important; } }

    .dlg-body { padding: 18px 20px 8px; display: flex; flex-direction: column; gap: 12px; }

    .dlg-hint { font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.5; }

    .email-field { width: 100%; }

    .prefix-icon { font-size: 17px; width: 17px; height: 17px; color: var(--text-muted); margin-right: 4px; }

    /* Override Material form field for theme */
    :host ::ng-deep .email-field .mat-mdc-text-field-wrapper {
      background: var(--input-bg) !important;
    }
    :host ::ng-deep .email-field .mdc-notched-outline__leading,
    :host ::ng-deep .email-field .mdc-notched-outline__notch,
    :host ::ng-deep .email-field .mdc-notched-outline__trailing {
      border-color: var(--border-panel) !important;
    }
    :host ::ng-deep .email-field .mat-mdc-form-field-label,
    :host ::ng-deep .email-field .mdc-floating-label { color: var(--text-muted) !important; }
    :host ::ng-deep .email-field input { color: var(--text-main) !important; caret-color: #6366f1; }
    :host ::ng-deep .email-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .email-field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .email-field.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(99,102,241,0.7) !important;
    }

    .dlg-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 12px 20px 18px;
    }

    .cancel-btn { color: var(--text-muted) !important; font-size: 0.875rem !important; }

    .invite-btn {
      height: 38px;
      padding: 0 18px !important;
      border-radius: 9px !important;
      background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
      color: #fff !important;
      font-weight: 600 !important;
      font-size: 0.82rem !important;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3) !important;
      mat-icon { font-size: 15px; width: 15px; height: 15px; margin-right: 4px; }
    }
  `],
})
export class InviteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<InviteDialogComponent>);

  email = '';

  isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  emailValid(): boolean {
    return this.isValidEmail(this.email.trim());
  }

  invite(): void {
    const trimmed = this.email.trim();
    if (!this.isValidEmail(trimmed)) return;
    this.dialogRef.close(trimmed);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
