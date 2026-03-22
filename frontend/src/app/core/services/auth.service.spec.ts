import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

const TOKEN_KEY = 'jwt_token';
const USER_KEY  = 'current_user';

const mockResponse: AuthResponse = {
  token: 'mock-jwt-token',
  username: 'alice',
  email: 'alice@test.com',
  role: 'USER',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear BEFORE TestBed so loadUser() starts clean
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login() ─────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('stocke le token dans localStorage sous "jwt_token"', () => {
      service.login({ email: 'alice@test.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('http://localhost:8080/api/auth/login').flush(mockResponse);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('mock-jwt-token');
    });

    it('stocke l\'utilisateur dans localStorage sous "current_user"', () => {
      service.login({ email: 'alice@test.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('http://localhost:8080/api/auth/login').flush(mockResponse);

      const stored = JSON.parse(localStorage.getItem(USER_KEY)!);
      expect(stored.username).toBe('alice');
      expect(stored.email).toBe('alice@test.com');
      expect(stored.token).toBe('mock-jwt-token');
    });

    it('met à jour le signal currentUser', () => {
      expect(service.currentUser()).toBeNull();

      service.login({ email: 'alice@test.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('http://localhost:8080/api/auth/login').flush(mockResponse);

      expect(service.currentUser()).toEqual(mockResponse);
    });

    it('envoie un POST à /api/auth/login avec les bons identifiants', () => {
      service.login({ email: 'alice@test.com', password: 'secret' }).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'alice@test.com', password: 'secret' });
      req.flush(mockResponse);
    });
  });

  // ── register() ──────────────────────────────────────────────────────────

  describe('register()', () => {
    it('stocke le token dans localStorage après inscription', () => {
      service.register({ username: 'alice', email: 'alice@test.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('http://localhost:8080/api/auth/register').flush(mockResponse);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('mock-jwt-token');
    });

    it('met à jour le signal currentUser après inscription', () => {
      service.register({ username: 'alice', email: 'alice@test.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('http://localhost:8080/api/auth/register').flush(mockResponse);

      expect(service.currentUser()?.username).toBe('alice');
    });
  });

  // ── logout() ─────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('supprime jwt_token du localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'some-token');
      service.logout();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('supprime current_user du localStorage', () => {
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse));
      service.logout();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('remet currentUser à null', () => {
      service.currentUser.set(mockResponse);
      service.logout();
      expect(service.currentUser()).toBeNull();
    });
  });

  // ── getToken() ────────────────────────────────────────────────────────────

  describe('getToken()', () => {
    it('retourne null si aucun token en localStorage', () => {
      expect(service.getToken()).toBeNull();
    });

    it('retourne le token stocké', () => {
      localStorage.setItem(TOKEN_KEY, 'abc-token');
      expect(service.getToken()).toBe('abc-token');
    });
  });

  // ── isLoggedIn() ──────────────────────────────────────────────────────────

  describe('isLoggedIn()', () => {
    it('retourne false quand aucun token', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('retourne true quand un token est présent', () => {
      localStorage.setItem(TOKEN_KEY, 'valid-token');
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  // ── refreshSession() ──────────────────────────────────────────────────────

  describe('refreshSession()', () => {
    it('met à jour currentUser et localStorage', () => {
      const updated: AuthResponse = { ...mockResponse, username: 'alice_v2', token: 'new-token' };
      service.refreshSession(updated);

      expect(service.currentUser()?.username).toBe('alice_v2');
      expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');

      const stored = JSON.parse(localStorage.getItem(USER_KEY)!);
      expect(stored.username).toBe('alice_v2');
    });
  });

  // ── loadUser() au démarrage ───────────────────────────────────────────────

  describe('initialisation depuis localStorage', () => {
    it('charge un utilisateur valide présent dans localStorage', () => {
      // Persist → recréer le service
      localStorage.setItem(TOKEN_KEY, 'persisted-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse));

      // Recréer le module pour que AuthService relise localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.currentUser()?.username).toBe('alice');
    });

    it('rejette une session obsolète dont le username contient un @', () => {
      const obsolete = { ...mockResponse, username: 'alice@test.com' }; // ancien format
      localStorage.setItem(TOKEN_KEY, 'old-token');
      localStorage.setItem(USER_KEY, JSON.stringify(obsolete));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.currentUser()).toBeNull();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });
});
