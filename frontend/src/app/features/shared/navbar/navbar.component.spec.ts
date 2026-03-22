import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockUser: AuthResponse = {
  token: 'mock-jwt',
  username: 'alice',
  email: 'alice@test.com',
  role: 'USER',
};

// Shared writable signal — reset in beforeEach
const currentUserSignal = signal<AuthResponse | null>(null);

const mockAuthService = {
  currentUser: currentUserSignal,
  logout: jasmine.createSpy('logout'),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    currentUserSignal.set(null); // reset between tests

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  // ── Brand ────────────────────────────────────────────────────────────────

  it('affiche le nom de marque "TaskBoard"', () => {
    expect(el.querySelector('.brand-name')?.textContent).toContain('TaskBoard');
  });

  // ── Utilisateur non connecté ──────────────────────────────────────────────

  describe('quand aucun utilisateur n\'est connecté', () => {
    it('affiche le lien "Connexion"', () => {
      expect(el.querySelector('.auth-link')?.textContent?.trim()).toContain('Connexion');
    });

    it('n\'affiche pas le username-label', () => {
      expect(el.querySelector('.username-label')).toBeNull();
    });

    it('n\'affiche pas le bouton de déconnexion', () => {
      expect(el.querySelector('.logout-btn')).toBeNull();
    });
  });

  // ── Utilisateur connecté ──────────────────────────────────────────────────

  describe('quand un utilisateur est connecté', () => {
    beforeEach(() => {
      currentUserSignal.set(mockUser);
      fixture.detectChanges();
    });

    it('affiche le pseudo de l\'utilisateur', () => {
      const label = el.querySelector('.username-label');
      expect(label?.textContent?.trim()).toBe('alice');
    });

    it('affiche l\'initiale dans l\'avatar', () => {
      // userInitial = username[0] = 'a'
      const avatar = el.querySelector('.avatar');
      expect(avatar?.textContent?.trim()).toBe('a');
    });

    it('affiche le bouton de déconnexion', () => {
      expect(el.querySelector('.logout-btn')).toBeTruthy();
    });

    it('n\'affiche pas le lien "Connexion"', () => {
      expect(el.querySelector('.auth-link')).toBeNull();
    });

    it('appelle authService.logout() au clic sur le bouton déconnexion', () => {
      const logoutBtn = el.querySelector('.logout-btn') as HTMLElement;
      logoutBtn.click();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  // ── Réactivité du signal ──────────────────────────────────────────────────

  describe('réactivité — mise à jour du signal', () => {
    it('met à jour le pseudo affiché quand currentUser change', () => {
      currentUserSignal.set(mockUser);
      fixture.detectChanges();
      expect(el.querySelector('.username-label')?.textContent?.trim()).toBe('alice');

      currentUserSignal.set({ ...mockUser, username: 'alice_updated' });
      fixture.detectChanges();
      expect(el.querySelector('.username-label')?.textContent?.trim()).toBe('alice_updated');
    });

    it('revient à l\'état non-connecté si currentUser repasse à null', () => {
      currentUserSignal.set(mockUser);
      fixture.detectChanges();
      expect(el.querySelector('.username-label')).toBeTruthy();

      currentUserSignal.set(null);
      fixture.detectChanges();
      expect(el.querySelector('.username-label')).toBeNull();
      expect(el.querySelector('.auth-link')).toBeTruthy();
    });
  });

  // ── @Output menuToggle ────────────────────────────────────────────────────

  it('émet menuToggle au clic sur le bouton hamburger', () => {
    const emitSpy = jasmine.createSpy('menuToggle');
    fixture.componentInstance.menuToggle.subscribe(emitSpy);

    const hamburger = el.querySelector('.hamburger-btn') as HTMLElement;
    hamburger.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
