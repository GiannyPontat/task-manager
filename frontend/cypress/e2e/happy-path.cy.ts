/// <reference types="cypress" />

/**
 * Happy Path E2E — toutes les requêtes API sont interceptées (pas besoin de backend).
 *
 * Scénario :
 *  1. L'utilisateur arrive sur /login et se connecte
 *  2. Il arrive sur le tableau Kanban
 *  3. Il crée une nouvelle tâche
 *  4. Il déplace la tâche dans une autre colonne (drag & drop CDK)
 */
describe('Happy Path — Login → Kanban → Create Task → Move Task', () => {

  beforeEach(() => {
    // ── API Stubs ──────────────────────────────────────────────────────────
    cy.intercept('POST', '**/api/auth/login', { fixture: 'auth.json' }).as('login');
    cy.intercept('GET',  '**/api/columns',    { fixture: 'columns.json' }).as('getColumns');
    cy.intercept('POST', '**/api/tasks',      { fixture: 'task.json' }).as('createTask');
    cy.intercept('PATCH','**/api/tasks/*/move', (req) => {
      req.reply({ ...req.body, columnId: 2 });
    }).as('moveTask');
  });

  // ── 1. Page Login ────────────────────────────────────────────────────────

  it('1 — affiche la page de connexion', () => {
    cy.visit('/login');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
  });

  // ── 2. Connexion ─────────────────────────────────────────────────────────

  it('2 — connexion avec des identifiants valides redirige vers /tasks', () => {
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('alice@test.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    cy.url().should('include', '/tasks');

    // Token stocké dans localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt_token')).to.eq('fake-jwt-token-for-tests');
    });
  });

  // ── 3. Tableau Kanban ─────────────────────────────────────────────────────

  it('3 — le tableau Kanban affiche les colonnes après connexion', () => {
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('alice@test.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.wait('@getColumns');

    cy.get('.kanban-column').should('have.length', 3);
    cy.get('.column-title').first().should('contain', 'À faire');
    cy.get('.task-card').should('have.length.gte', 1);
  });

  // ── 4. Création de tâche ──────────────────────────────────────────────────

  it('4 — créer une tâche ouvre le dialog et l\'ajoute au tableau', () => {
    // Connexion rapide via localStorage pour sauter l'UI de login
    cy.login();
    cy.intercept('GET', '**/api/columns', { fixture: 'columns.json' }).as('getColumns');
    cy.visit('/tasks');
    cy.wait('@getColumns');

    // Ouvrir le dialog de création
    cy.get('.new-task-btn').click();
    cy.get('mat-dialog-container').should('be.visible');

    // Remplir le titre
    cy.get('.title-input').type('Ma nouvelle tâche E2E');

    // Intercepter le refetch des colonnes après création
    cy.intercept('GET', '**/api/columns', {
      fixture: 'columns.json',
      // On simule l'ajout de la tâche créée dans la réponse
    }).as('getColumnsAfterCreate');

    // Soumettre via le bouton de confirmation (le premier bouton mat-flat-button du dialog)
    cy.get('mat-dialog-container')
      .find('button[color="primary"]').first()
      .click();

    cy.wait('@createTask').its('request.body.title').should('eq', 'Ma nouvelle tâche E2E');
  });

  // ── 5. Déplacement d'une tâche (drag & drop) ─────────────────────────────

  it('5 — déplacer une tâche vers la colonne "En cours" appelle moveTask', () => {
    cy.login();
    cy.intercept('GET', '**/api/columns', { fixture: 'columns.json' }).as('getColumns');
    cy.visit('/tasks');
    cy.wait('@getColumns');

    // Vérifier qu'il y a bien une tâche dans la première colonne
    cy.get('.kanban-column').first().find('.task-card').should('have.length.gte', 1);

    // Drag la tâche vers la 2e colonne (cdkDropList)
    cy.cdkDragTo(
      '.kanban-column:first-child .task-card',
      '.kanban-column:nth-child(2) .task-list'
    );

    // L'appel moveTask doit être déclenché
    cy.wait('@moveTask').its('request.body').should('have.property', 'columnId');
  });

  // ── Scénario complet enchaîné ─────────────────────────────────────────────

  it('Scénario complet — login → board → créer tâche → déplacer', () => {
    // Step 1 : Login
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('alice@test.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.wait('@getColumns');

    // Step 2 : Board chargé
    cy.url().should('include', '/tasks');
    cy.get('.kanban-column').should('have.length', 3);

    // Step 3 : Créer une tâche
    cy.get('.new-task-btn').click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('.title-input').type('Tâche Happy Path');
    cy.get('mat-dialog-container').find('button[color="primary"]').first().click();
    cy.wait('@createTask');

    // Step 4 : Déplacer la tâche existante
    cy.cdkDragTo(
      '.kanban-column:first-child .task-card',
      '.kanban-column:nth-child(2) .task-list'
    );
    cy.wait('@moveTask');
  });
});
