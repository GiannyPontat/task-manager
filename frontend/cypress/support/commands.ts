/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in by intercepting the API call and injecting auth data into localStorage,
       * then visiting the target page. Avoids going through the UI on every test.
       */
      login(email?: string, username?: string): Chainable<void>;

      /**
       * Drags a CDK-draggable element to a CDK drop-list target.
       * Uses pointer events which is what Angular CDK listens to.
       */
      cdkDragTo(sourceSelector: string, targetSelector: string): Chainable<void>;
    }
  }
}

// ── cy.login() ────────────────────────────────────────────────────────────────
// Bypasses the login UI by setting localStorage directly and intercepting
// any subsequent API call that might verify the token.
Cypress.Commands.add('login', (email = 'alice@test.com', username = 'alice') => {
  const authData = {
    token: 'fake-jwt-token-for-tests',
    username,
    email,
    role: 'USER',
  };
  localStorage.setItem('jwt_token', authData.token);
  localStorage.setItem('current_user', JSON.stringify(authData));
});

// ── cy.cdkDragTo() ────────────────────────────────────────────────────────────
// Angular CDK uses pointer events (not HTML5 drag). This helper simulates
// the full pointer sequence: down → move → enter target → up.
Cypress.Commands.add('cdkDragTo', (sourceSelector: string, targetSelector: string) => {
  cy.get(sourceSelector).first().then(($source) => {
    const src = $source[0].getBoundingClientRect();
    const srcX = src.left + src.width / 2;
    const srcY = src.top + src.height / 2;

    cy.get(targetSelector).then(($target) => {
      const tgt = $target[0].getBoundingClientRect();
      const tgtX = tgt.left + tgt.width / 2;
      const tgtY = tgt.top + tgt.height / 2;

      cy.get(sourceSelector).first()
        .trigger('pointerdown', { pointerId: 1, clientX: srcX, clientY: srcY, force: true })
        .trigger('pointermove', { pointerId: 1, clientX: srcX + 5, clientY: srcY + 5, force: true });

      cy.document()
        .trigger('pointermove', { pointerId: 1, clientX: tgtX, clientY: tgtY, force: true });

      cy.get(targetSelector)
        .trigger('pointerenter', { pointerId: 1, clientX: tgtX, clientY: tgtY, force: true })
        .trigger('pointerup',   { pointerId: 1, clientX: tgtX, clientY: tgtY, force: true });
    });
  });
});

export {};
