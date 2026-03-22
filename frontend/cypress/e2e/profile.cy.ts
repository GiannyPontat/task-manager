/// <reference types="cypress" />

/**
 * Tests E2E — Page Profil
 *
 * Scénario :
 *  1. L'utilisateur navigue vers /profile
 *  2. Il change son pseudo dans le formulaire
 *  3. Il soumet → l'API répond avec les nouvelles données
 *  4. Le pseudo est mis à jour dans la navbar (username-label)
 */
describe('Page Profil — mise à jour du pseudo', () => {

  const newUsername = 'alice_updated';

  beforeEach(() => {
    // Connexion rapide via localStorage
    cy.login('alice@test.com', 'alice');

    // Stubs API
    cy.intercept('GET', '**/api/columns', { fixture: 'columns.json' }).as('getColumns');
    cy.intercept('GET', '**/api/tasks*', {
      body: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 }
    }).as('getTasks');

    cy.intercept('PATCH', '**/api/users/me', {
      statusCode: 200,
      body: {
        token: 'new-jwt-token-after-update',
        username: newUsername,
        email: 'alice@test.com',
        role: 'USER',
      },
    }).as('updateProfile');
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigue vers /profile depuis la sidebar', () => {
    cy.visit('/tasks');
    // Clic sur le lien Profil dans la sidebar
    cy.get('app-sidebar').find('a[href="/profile"], [routerLink="/profile"]').click({ force: true });
    cy.url().should('include', '/profile');
  });

  // ── Affichage initial ──────────────────────────────────────────────────────

  it('affiche le pseudo actuel dans le champ username', () => {
    cy.visit('/profile');
    cy.get('input[formControlName="username"]').should('have.value', 'alice');
  });

  it('affiche les initiales dans l\'avatar', () => {
    cy.visit('/profile');
    // Le composant profil affiche la première et dernière lettre du pseudo
    cy.get('.profile-avatar, .avatar-circle').should('contain.text', 'A');
  });

  // ── Mise à jour du pseudo ──────────────────────────────────────────────────

  it('soumettre un nouveau pseudo appelle l\'API et met à jour la navbar', () => {
    cy.visit('/profile');

    // Modifier le champ username
    cy.get('input[formControlName="username"]')
      .clear()
      .type(newUsername);

    // Soumettre le formulaire info
    cy.get('button').contains(/enregistrer|sauvegarder|save/i).first().click();

    // Vérifier l'appel API
    cy.wait('@updateProfile').then((interception) => {
      expect(interception.request.body).to.deep.equal({ username: newUsername });
    });

    // Vérifier la mise à jour dans la navbar
    // AuthService.refreshSession() est appelé → currentUser signal mis à jour → navbar re-render
    cy.get('.username-label').should('contain', newUsername);
  });

  it('le nouveau token est stocké dans localStorage après la mise à jour', () => {
    cy.visit('/profile');

    cy.get('input[formControlName="username"]').clear().type(newUsername);
    cy.get('button').contains(/enregistrer|sauvegarder|save/i).first().click();
    cy.wait('@updateProfile');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt_token')).to.eq('new-jwt-token-after-update');
      const stored = JSON.parse(win.localStorage.getItem('current_user') ?? '{}');
      expect(stored.username).to.eq(newUsername);
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it('n\'envoie pas la requête si le champ username est vide', () => {
    cy.visit('/profile');

    cy.get('input[formControlName="username"]').clear();
    cy.get('button').contains(/enregistrer|sauvegarder|save/i).first().click();

    // Aucun appel API ne doit avoir été fait
    cy.get('@updateProfile.all').should('have.length', 0);
  });
});
