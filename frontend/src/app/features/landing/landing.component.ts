import { Component, ElementRef, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: { 'data-theme': 'light' },
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        query('.h-item', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          stagger(80, [
            animate('620ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('visualEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.96)' }),
        animate('800ms 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ],
  template: `
    <!-- Atmospheric blobs -->
    <div class="bg-mesh" aria-hidden="true">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>

    <!-- ── NAVBAR ── -->
    <nav class="nav">
      <div class="nav-wrap">
        <a class="logo" routerLink="/">Flowly</a>
        <div class="nav-links">
          <a href="#features" (click)="scrollToSection($event, 'features')" class="nav-a">Fonctionnalités</a>
          <a href="#stack" (click)="scrollToSection($event, 'stack')" class="nav-a">Stack Tech</a>
        </div>
        <a routerLink="/login" class="btn-login">
          <span>Connexion</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </nav>

    <!-- ── HERO — Split layout ── -->
    <section class="hero" [@heroEnter]="true">

      <div class="hero-left">
        <div class="h-item hero-eyebrow">
          <span class="status-ping">
            <span class="status-ping-anim"></span>
            <span class="status-ping-core"></span>
          </span>
          Portfolio · Développeur Java Full Stack
        </div>
        <h1 class="h-item hero-h1">
          Le kanban qui<br>
          <span class="hero-em">parle code.</span>
        </h1>
        <p class="h-item hero-p">
          Construit avec <strong>Angular 17</strong> et <strong>Spring Boot</strong>.
          Authentification JWT, board kanban, invitations
          par email via l'API REST Resend.
        </p>
        <div class="h-item hero-actions">
          <a routerLink="/login" class="btn-primary">
            <span>Voir la démo</span>
            <svg class="btn-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="https://github.com/Gianny-Pnt/task-manager" target="_blank" rel="noopener" class="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
        <div class="h-item hero-pills">
          <span class="pill">JWT</span>
          <span class="pill">RxJS</span>
          <span class="pill">Docker</span>
          <span class="pill">PostgreSQL</span>
          <span class="pill">Resend</span>
        </div>
      </div>

      <div class="hero-right" [@visualEnter]="true">
        <div class="mock-window">
          <div class="mock-bar">
            <div class="mock-dots">
              <span class="md md-r"></span>
              <span class="md md-y"></span>
              <span class="md md-g"></span>
            </div>
            <span class="mock-bar-title">Flowly · Sprint Q2</span>
          </div>
          <div class="mock-board">
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>À faire</span>
                <span class="mc-badge">3</span>
              </div>
              <div class="mock-task">Tests E2E Cypress</div>
              <div class="mock-task">Tests intégration backend</div>
              <div class="mock-task">Documentation API</div>
            </div>
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>En cours</span>
                <span class="mc-badge mc-orange">2</span>
              </div>
              <div class="mock-task mock-active">Tests unitaires frontend</div>
              <div class="mock-task mock-active">Tests unitaires backend</div>
            </div>
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>Terminé</span>
                <span class="mc-badge mc-green">8</span>
              </div>
              <div class="mock-task mock-done">Auth JWT + Refresh tokens</div>
              <div class="mock-task mock-done">API REST complète</div>
              <div class="mock-task mock-done">Kanban drag-and-drop</div>
              <div class="mock-task mock-done">Docker + CI/CD</div>
              <div class="mock-task mock-done">Déploiement Vercel / Render</div>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- ── FEATURES BENTO ── -->
    <section class="section" id="features">
      <div class="section-meta" data-reveal>
        <span class="eyebrow-label">Fonctionnalités</span>
        <h2 class="section-h">Ce que Flowly <span class="section-h-accent">sait faire.</span></h2>
      </div>

      <div class="bento">

        <!-- Card 1: Collaboration (wide 2fr) -->
        <div class="bcard bcard-wide" data-reveal style="--i:0">
          <div class="bcard-icon icon-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h3 class="bcard-h">Collaboration en temps réel</h3>
          <p class="bcard-p">
            Invitez vos collègues par email. Gérez les rôles par workspace.
            Propulsé par l'<strong>API REST Resend</strong> — aucune restriction SMTP.
          </p>
          <div class="mock-invite">
            <div class="mi-row">
              <span class="mi-av mi-a">M</span>
              <div class="mi-info">
                <span class="mi-name">Marie Leconte</span>
                <span class="mi-email">marie&#64;studio.io</span>
              </div>
              <span class="mi-badge">Member</span>
            </div>
            <div class="mi-row">
              <span class="mi-av mi-b">T</span>
              <div class="mi-info">
                <span class="mi-name">Thomas Renard</span>
                <span class="mi-email">thomas&#64;dev.co</span>
              </div>
              <span class="mi-badge mi-admin">Admin</span>
            </div>
            <div class="mi-input-row">
              <span class="mi-placeholder">Inviter par email...</span>
              <span class="mi-send-btn">Envoyer</span>
            </div>
          </div>
          <div class="bcard-tag">API Resend · Workspaces</div>
        </div>

        <!-- Card 2: Security (narrow 1fr) -->
        <div class="bcard bcard-narrow" data-reveal style="--i:1">
          <div class="bcard-icon icon-emerald">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 class="bcard-h">Sécurité enterprise</h3>
          <p class="bcard-p">Tokens JWT + refresh, Spring Security, guards Angular.</p>
          <div class="sec-list">
            <div class="sec-item"><span class="sec-dot"></span><span>JWT access token</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Refresh token rotation</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Spring Security filters</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Angular route guards</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>HTTP interceptors</span></div>
          </div>
          <div class="bcard-tag">JWT · Spring Security</div>
        </div>

        <!-- Card 3: Dashboard (full width) -->
        <div class="bcard bcard-full" data-reveal style="--i:2">
          <div class="bcard-full-inner">
            <div class="bcard-full-left">
              <div class="bcard-icon icon-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 class="bcard-h">Dashboard dynamique</h3>
              <p class="bcard-p">
                Interface kanban propulsée par <strong>RxJS / Observables</strong>.
                Filtres temps réel, drag-and-drop CDK, pagination automatique.
              </p>
              <div class="bcard-tag">RxJS · Angular Signals · CDK</div>
            </div>
            <div class="bcard-full-right" aria-hidden="true">
              <div class="mini-chart-label">Tâches complétées / semaine</div>
              <svg class="mini-chart-svg" viewBox="0 0 210 64" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff7335" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="#ffb088" stop-opacity="0.2"/>
                  </linearGradient>
                </defs>
                <rect x="0"   y="28" width="22" height="36" rx="3" fill="url(#bGrad)"/>
                <rect x="28"  y="12" width="22" height="52" rx="3" fill="url(#bGrad)"/>
                <rect x="56"  y="20" width="22" height="44" rx="3" fill="url(#bGrad)"/>
                <rect x="84"  y="4"  width="22" height="60" rx="3" fill="url(#bGrad)"/>
                <rect x="112" y="16" width="22" height="48" rx="3" fill="url(#bGrad)"/>
                <rect x="140" y="26" width="22" height="38" rx="3" fill="url(#bGrad)"/>
                <rect x="168" y="8"  width="22" height="56" rx="3" fill="url(#bGrad)"/>
              </svg>
              <div class="mini-chart-days">
                <span>Lun</span><span>Mar</span><span>Mer</span>
                <span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── TECHNICAL CHALLENGE ── -->
    <section class="section">
      <div class="challenge" data-reveal>
        <div class="challenge-hd">
          <div class="challenge-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span class="challenge-eyebrow">Défi technique résolu</span>
        </div>
        <h3 class="challenge-h">SMTP bloqué sur Render → Migration vers l'API REST Resend</h3>
        <p class="challenge-txt">
          Render <strong>bloque les connexions SMTP sortantes</strong> sur les ports 465/587 (plan gratuit) —
          rendant JavaMailSender inutilisable. Solution : migration vers l'<strong>API REST Resend</strong>,
          qui transite par HTTPS :443 sans restriction d'hébergeur.
        </p>
        <div class="diff-row">
          <div class="diff-side">
            <span class="diff-lbl lbl-red">Avant</span>
            <code class="diff-code code-red">JavaMailSender → SMTP :587 → bloqué</code>
          </div>
          <svg class="diff-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <div class="diff-side">
            <span class="diff-lbl lbl-green">Après</span>
            <code class="diff-code code-green">Resend REST API → HTTPS :443 → opérationnel</code>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STACK TECH ── -->
    <section class="section" id="stack">
      <div class="section-meta" data-reveal>
        <span class="eyebrow-label">Stack Technique</span>
        <h2 class="section-h">Technologies <span class="section-h-accent">maîtrisées.</span></h2>
      </div>
      <div class="stack-grid" data-reveal style="--i:1">
        <div class="stack-item" *ngFor="let t of stack">
          <span class="stack-dot" [style.background]="t.color"></span>
          <div>
            <div class="stack-name">{{ t.name }}</div>
            <div class="stack-sub">{{ t.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer" data-reveal>
      <div class="footer-wrap">
        <span class="footer-logo">Flowly</span>
        <div class="footer-links">
          <a href="https://gianny-dev.com" target="_blank" rel="noopener" class="footer-a">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            gianny-dev.com
          </a>
          <a href="https://linkedin.com/in/gianny-pnt" target="_blank" rel="noopener" class="footer-a">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
            LinkedIn
          </a>
        </div>
        <span class="footer-copy">© 2025 Gianny_Pnt</span>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Host & tokens — palette Light App (Flowly) ── */
    :host {
      min-height: 100dvh;
      background: #E8EDF5;
      color: #1E293B;
      font-family: 'Inter', 'Outfit', system-ui, -apple-system, sans-serif;
      position: relative;
      overflow-x: hidden;

      /* Palette app light theme */
      --ink:           #1E293B;
      --ink-soft:      #1E293B;
      --ink-mid:       #334155;
      --ink-low:       #475569;
      --ink-muted:     #64748B;
      --ink-faint:     #94A3B8;
      --ink-hairline:  #CBD5E1;
      --bg-base:       #E8EDF5;
      --bg-card:       #F0F4FA;
      --bg-soft:       #F8FAFC;
      --border:        #CBD5E1;
      --border-strong: #94A3B8;

      /* Accent orange app (--primary) */
      --orange:        #ff7335;
      --orange-hover:  #e55a16;
      --salmon:        #ffb088;
      --orange-bg:     rgba(255,115,53,0.08);
      --orange-bg-2:   rgba(255,115,53,0.14);
      --orange-ring:   rgba(255,115,53,0.18);
      --orange-glow:   rgba(255,115,53,0.35);

      /* Shadows */
      --sh-card:       0 2px 8px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04);
      --sh-card-hover: 0 30px 60px -20px rgba(15,23,42,0.22),
                       0 12px 30px -12px rgba(255,115,53,0.20),
                       0 0 0 1px rgba(255,115,53,0.25);
      --radius:        20px;
    }

    /* ── Background blobs (orange + indigo subtils) ── */
    .bg-mesh {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .blob { position: absolute; border-radius: 50%; }
    .b1 {
      width: 720px; height: 720px;
      top: -220px; left: -180px;
      background: radial-gradient(circle, rgba(255,115,53,0.14) 0%, transparent 65%);
      filter: blur(60px);
    }
    .b2 {
      width: 620px; height: 620px;
      bottom: -160px; right: -120px;
      background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
      filter: blur(60px);
    }
    .b3 {
      width: 480px; height: 480px;
      top: 40%; left: 55%;
      background: radial-gradient(circle, rgba(249,176,149,0.07) 0%, transparent 70%);
      filter: blur(80px);
    }

    /* ── Navbar ── */
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(253,252,252,0.78);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid var(--border);
    }
    .nav-wrap {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 28px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .logo {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      text-decoration: none;
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      transition: filter 0.2s, transform 0.2s;
    }
    .logo:hover { filter: brightness(1.1); transform: scale(1.04); }
    .nav-links {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }
    .nav-a {
      position: relative;
      color: var(--ink-mid);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 10px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-a::after {
      content: '';
      position: absolute;
      left: 14px; right: 14px; bottom: 4px;
      height: 2px;
      background: linear-gradient(90deg, var(--orange), var(--salmon));
      border-radius: 2px;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-a:hover { color: var(--ink); background: var(--orange-bg); }
    .nav-a:hover::after { transform: scaleX(1); }

    .btn-login {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      color: #FFFFFF;
      background: var(--ink);
      padding: 9px 18px;
      border-radius: 11px;
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(15,23,42,0.18);
    }
    .btn-login:hover {
      background: var(--ink-soft);
      transform: scale(1.04);
      box-shadow: 0 8px 24px rgba(15,23,42,0.28);
    }
    .btn-login:active { transform: scale(0.97); }
    .btn-login svg { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .btn-login:hover svg { transform: translateX(3px); }

    /* ── Hero — Split grid ── */
    .hero {
      position: relative;
      z-index: 1;
      max-width: 1120px;
      margin: 0 auto;
      padding: 96px 28px 80px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 56px;
      align-items: center;
    }

    .hero-left { display: flex; flex-direction: column; gap: 0; }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-bottom: 22px;
      padding: 6px 14px 6px 12px;
      background: rgba(255,115,53,0.06);
      border: 1px solid rgba(255,115,53,0.18);
      border-radius: 999px;
      width: fit-content;
    }
    .status-ping {
      position: relative;
      display: inline-flex;
      width: 8px; height: 8px;
    }
    .status-ping-anim {
      position: absolute; inset: 0;
      border-radius: 50%;
      background: var(--orange);
      opacity: 0.75;
      animation: pingAnim 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .status-ping-core {
      position: relative;
      display: inline-flex;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--orange-hover);
    }
    @keyframes pingAnim {
      0%        { transform: scale(1);   opacity: 0.75; }
      75%, 100% { transform: scale(2.4); opacity: 0; }
    }

    .hero-h1 {
      font-size: clamp(2.6rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.045em;
      color: var(--ink);
      margin: 0 0 22px;
    }
    .hero-em {
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-style: normal;
      font-weight: 800;
      display: inline-block;
    }

    .hero-p {
      font-size: 15.5px;
      line-height: 1.72;
      color: var(--ink-low);
      max-width: 460px;
      margin: 0 0 36px;
    }
    .hero-p strong { color: var(--ink); font-weight: 600; }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    /* Primary CTA (Login style — black + scale) */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 14.5px;
      font-weight: 600;
      color: #FFFFFF;
      background: var(--ink);
      padding: 13px 24px;
      border-radius: 13px;
      position: relative;
      overflow: hidden;
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(15,23,42,0.22);
    }
    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .btn-primary > * { position: relative; z-index: 1; }
    .btn-primary:hover {
      background: var(--ink-soft);
      transform: scale(1.04);
      box-shadow: 0 14px 36px rgba(255,115,53,0.32);
    }
    .btn-primary:hover::before { opacity: 1; }
    .btn-primary:active { transform: scale(0.97); }
    .btn-arr { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .btn-primary:hover .btn-arr { transform: translateX(4px); }

    /* Ghost CTA */
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink-soft);
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      padding: 12px 22px;
      border-radius: 13px;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .btn-ghost:hover {
      background: #FFFFFF;
      border-color: var(--orange);
      color: var(--orange);
      transform: scale(1.04);
      box-shadow: 0 0 0 4px var(--orange-ring);
    }
    .btn-ghost:active { transform: scale(0.97); }

    /* Pills */
    .hero-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }
    .pill {
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--ink-mid);
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 999px;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .pill:hover {
      background: var(--orange-bg);
      border-color: var(--orange);
      color: var(--orange-hover);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 16px rgba(255,115,53,0.18);
    }

    /* ── Mock kanban window ── */
    .hero-right { animation: floatY 7s ease-in-out infinite; }
    @keyframes floatY {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-14px); }
    }

    .mock-window {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 30px 70px -20px rgba(15,23,42,0.18),
                  0 12px 36px -12px rgba(15,23,42,0.10),
                  inset 0 1px 0 rgba(255,255,255,0.7);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
    }
    .mock-window:hover {
      transform: translateY(-6px) scale(1.015);
      box-shadow: 0 40px 90px -20px rgba(15,23,42,0.24),
                  0 16px 50px -12px rgba(255,115,53,0.18);
    }
    .mock-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-soft);
    }
    .mock-dots { display: flex; gap: 6px; }
    .md { width: 11px; height: 11px; border-radius: 50%; }
    .md-r { background: #FF5F56; }
    .md-y { background: #FFBD2E; }
    .md-g { background: #27C93F; }
    .mock-bar-title {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--ink-muted);
      margin-left: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .mock-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }
    .mock-col {
      padding: 14px 12px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .mock-col:last-child { border-right: none; }
    .mock-col-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .mock-col-hd > span:first-child {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--ink-muted);
    }
    .mc-badge {
      font-size: 10px;
      font-weight: 700;
      color: var(--ink-low);
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 1px 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .mc-orange { color: var(--orange-hover); background: var(--orange-bg-2); border-color: rgba(255,115,53,0.3); }
    .mc-green  { color: #15803D; background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); }

    .mock-task {
      font-size: 11.5px;
      color: var(--ink-mid);
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 7px 9px;
      line-height: 1.4;
      transition: border-color 0.2s, transform 0.2s, background 0.2s;
    }
    .mock-task:hover {
      border-color: var(--orange);
      background: #FFFFFF;
      transform: translateX(2px);
    }
    .mock-active {
      color: var(--ink-soft);
      background: var(--orange-bg);
      border-color: rgba(255,115,53,0.35);
      animation: activePulse 2.5s ease-in-out infinite;
    }
    @keyframes activePulse {
      0%, 100% { border-color: rgba(255,115,53,0.35); box-shadow: 0 0 0 0 rgba(255,115,53,0.2); }
      50%      { border-color: rgba(255,115,53,0.7);  box-shadow: 0 0 0 4px rgba(255,115,53,0); }
    }
    .mock-done {
      color: var(--ink-faint);
      background: transparent;
      border-color: transparent;
      text-decoration: line-through;
    }

    /* ── Sections base ── */
    .section {
      position: relative;
      z-index: 1;
      max-width: 1120px;
      margin: 0 auto;
      padding: 80px 28px;
    }
    .section-meta {
      margin-bottom: 44px;
      text-align: center;
    }
    .eyebrow-label {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      background: var(--orange-bg);
      border: 1px solid rgba(255,115,53,0.2);
      border-radius: 999px;
      padding: 5px 14px;
      margin-bottom: 16px;
    }
    .section-h {
      font-size: clamp(1.85rem, 3.2vw, 2.4rem);
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.035em;
      color: var(--ink);
      margin: 0;
    }
    .section-h-accent {
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* ── Bento grid ── */
    .bento {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto auto;
      gap: 16px;
    }
    .bcard-wide   { grid-column: 1; grid-row: 1; }
    .bcard-narrow { grid-column: 2; grid-row: 1; }
    .bcard-full   { grid-column: 1 / -1; grid-row: 2; }

    /* Base card */
    .bcard {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 30px;
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s;
      box-shadow: var(--sh-card);
      overflow: hidden;
    }
    .bcard::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 0%),
                  rgba(255,115,53,0.07), transparent 40%);
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .bcard::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
              mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .bcard:hover {
      transform: translateY(-10px) scale(1.025);
      box-shadow: var(--sh-card-hover);
      border-color: transparent;
    }
    .bcard:hover::before { opacity: 1; }
    .bcard:hover::after  { opacity: 1; }
    .bcard:hover .bcard-icon {
      transform: scale(1.12) rotate(-6deg);
      box-shadow: 0 12px 28px var(--orange-glow);
    }
    .bcard:hover .bcard-h {
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .bcard-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
    }
    .icon-orange {
      background: var(--orange-bg-2);
      color: var(--orange);
      border: 1px solid rgba(255,115,53,0.3);
    }
    .icon-emerald {
      background: rgba(34,197,94,0.10);
      color: #16A34A;
      border: 1px solid rgba(34,197,94,0.25);
    }

    .bcard-h {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 10px;
      letter-spacing: -0.02em;
      transition: color 0.3s;
    }
    .bcard-p {
      font-size: 13.5px;
      line-height: 1.65;
      color: var(--ink-muted);
      margin: 0 0 20px;
    }
    .bcard-p strong { color: var(--ink-soft); font-weight: 600; }
    .bcard-tag {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-faint);
      margin-top: auto;
    }

    /* ── Mock invite UI ── */
    .mock-invite {
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 13px;
      padding: 13px;
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .mi-row { display: flex; align-items: center; gap: 11px; }
    .mi-av {
      width: 30px; height: 30px;
      border-radius: 9px;
      font-size: 11.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .mi-a { background: rgba(255,115,53,0.15); color: var(--orange-hover); border: 1px solid rgba(255,115,53,0.25); }
    .mi-b { background: rgba(99,102,241,0.12); color: #4F46E5; border: 1px solid rgba(99,102,241,0.22); }
    .mi-info { flex: 1; min-width: 0; }
    .mi-name  { display: block; font-size: 11.5px; font-weight: 600; color: var(--ink-soft); line-height: 1.3; }
    .mi-email { display: block; font-size: 10.5px; color: var(--ink-muted); }
    .mi-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 5px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--ink-muted);
      white-space: nowrap;
    }
    .mi-admin { background: var(--orange-bg-2); color: var(--orange-hover); border-color: rgba(255,115,53,0.3); }
    .mi-input-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 8px 11px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .mi-input-row:hover { border-color: var(--orange); box-shadow: 0 0 0 3px var(--orange-ring); }
    .mi-placeholder { font-size: 11.5px; color: var(--ink-faint); }
    .mi-send-btn {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--orange);
    }

    /* ── Security list ── */
    .sec-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
    }
    .sec-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12.5px;
      color: var(--ink-low);
      transition: transform 0.2s, color 0.2s;
    }
    .sec-item:hover { transform: translateX(3px); color: var(--ink); }
    .sec-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #16A34A;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(22,163,74,0.55);
    }

    /* ── Dashboard card full ── */
    .bcard-full-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      align-items: center;
    }
    .bcard-full-left { display: flex; flex-direction: column; }
    .mini-chart-label {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-bottom: 12px;
    }
    .mini-chart-svg {
      width: 100%;
      height: 64px;
      display: block;
    }
    .mini-chart-svg rect {
      transition: filter 0.3s;
    }
    .bcard-full:hover .mini-chart-svg rect { filter: drop-shadow(0 4px 12px rgba(255,115,53,0.4)); }
    .mini-chart-days {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    .mini-chart-days span {
      font-size: 10px;
      color: var(--ink-faint);
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Technical Challenge ── */
    .challenge {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 40px;
      box-shadow: var(--sh-card);
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s;
      overflow: hidden;
    }
    .challenge::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 3px;
      background: linear-gradient(90deg, var(--orange) 0%, var(--salmon) 50%, var(--orange) 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .challenge:hover {
      transform: translateY(-8px) scale(1.015);
      box-shadow: 0 36px 80px -20px rgba(15,23,42,0.18),
                  0 16px 40px -12px rgba(255,115,53,0.16),
                  0 0 0 1px rgba(255,115,53,0.25);
      border-color: transparent;
    }
    .challenge:hover::before { transform: scaleX(1); }
    .challenge-hd {
      display: flex;
      align-items: center;
      gap: 11px;
      margin-bottom: 16px;
    }
    .challenge-ico {
      width: 34px; height: 34px;
      border-radius: 10px;
      background: var(--orange-bg-2);
      border: 1px solid rgba(255,115,53,0.3);
      color: var(--orange);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .challenge:hover .challenge-ico {
      transform: scale(1.12) rotate(-8deg);
      box-shadow: 0 8px 20px var(--orange-glow);
    }
    .challenge-eyebrow {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--orange);
    }
    .challenge-h {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 14px;
      letter-spacing: -0.02em;
    }
    .challenge-txt {
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--ink-low);
      margin: 0 0 22px;
    }
    .challenge-txt strong { color: var(--ink); font-weight: 600; }

    .diff-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .diff-side {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 200px;
    }
    .diff-lbl {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .lbl-red   { color: #DC2626; }
    .lbl-green { color: #16A34A; }
    .diff-code {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      padding: 10px 14px;
      border-radius: 9px;
      line-height: 1.5;
    }
    .code-red   { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.18); color: #B91C1C; }
    .code-green { background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.18); color: #15803D; }
    .diff-arr   { color: var(--ink-faint); flex-shrink: 0; transition: transform 0.4s, color 0.3s; }
    .challenge:hover .diff-arr { transform: translateX(6px); color: var(--orange); }

    /* ── Stack grid ── */
    .stack-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .stack-item {
      display: flex;
      align-items: center;
      gap: 13px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 13px;
      padding: 16px 18px;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.25s;
      cursor: default;
    }
    .stack-item:hover {
      border-color: var(--orange);
      transform: translateY(-5px) scale(1.04);
      box-shadow: 0 18px 40px -10px rgba(255,115,53,0.22),
                  0 0 0 1px var(--orange-ring);
    }
    .stack-item:hover .stack-dot {
      transform: scale(1.8);
      box-shadow: 0 0 14px currentColor, 0 0 24px currentColor;
    }
    .stack-item:hover .stack-name {
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .stack-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .stack-name {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--ink);
      transition: color 0.3s;
    }
    .stack-sub  { font-size: 11.5px; color: var(--ink-muted); margin-top: 2px; }

    /* ── Footer ── */
    .footer {
      position: relative;
      z-index: 1;
      border-top: 1px solid var(--border);
      padding: 28px;
      margin-top: 40px;
    }
    .footer-wrap {
      max-width: 1120px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .footer-logo {
      font-size: 14px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--orange) 0%, var(--salmon) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .footer-links {
      display: flex;
      gap: 18px;
      margin-left: auto;
    }
    .footer-a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-muted);
      transition: color 0.2s, transform 0.2s;
    }
    .footer-a:hover { color: var(--orange); transform: translateY(-1px); }
    .footer-copy { font-size: 11.5px; color: var(--ink-faint); }

    /* ── Scroll reveal ── */
    [data-reveal] {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: calc(var(--i, 0) * 110ms);
    }
    [data-reveal].in-view {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 64px 20px 48px; gap: 40px; }
      .bento { grid-template-columns: 1fr; }
      .bcard-wide, .bcard-narrow, .bcard-full { grid-column: 1; grid-row: auto; }
      .bcard-full-inner { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero-h1 { letter-spacing: -0.03em; }
      .nav-links { display: none; }
      .hero-right { order: -1; }
      .mock-board { grid-template-columns: 1fr; }
      .mock-col:not(:first-child) { display: none; }
      .diff-row { flex-direction: column; }
      .diff-arr { transform: rotate(90deg); align-self: center; }
      .section { padding: 56px 20px; }
      .footer-links { margin-left: 0; }
      .footer-wrap { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  readonly stack = [
    { name: 'Angular 17',      desc: 'Frontend SPA',           color: '#ff7335' },
    { name: 'Spring Boot',     desc: 'API REST backend',       color: '#22C55E' },
    { name: 'PostgreSQL',      desc: 'Base de données',        color: '#3B82F6' },
    { name: 'JWT Auth',        desc: 'Sécurité / tokens',      color: '#F59E0B' },
    { name: 'Docker',          desc: 'Conteneurisation',       color: '#0EA5E9' },
    { name: 'Resend API',      desc: 'Emails transactionnels', color: '#A855F7' },
    { name: 'Spring Security', desc: 'Guards & autorisation',  color: '#10B981' },
    { name: 'RxJS',            desc: 'Programmation réactive', color: '#EC4899' },
  ];

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.observer?.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    this.el.nativeElement.querySelectorAll('[data-reveal]')
      .forEach((el: Element) => this.observer!.observe(el));

    // Spotlight effect on bcard hover (mouse-tracking radial)
    this.el.nativeElement.querySelectorAll('.bcard').forEach((card: HTMLElement) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    const target = this.el.nativeElement.querySelector(`#${id}`) as HTMLElement | null;
    if (!target) return;

    const scroller = this.findScrollContainer(target);
    const navHeight = 64;
    const offset = 12;

    if (scroller && scroller !== document.documentElement && scroller !== document.body) {
      const top = target.getBoundingClientRect().top
                - scroller.getBoundingClientRect().top
                + scroller.scrollTop
                - navHeight - offset;
      scroller.scrollTo({ top, behavior: 'smooth' });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  private findScrollContainer(el: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      const oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
  }
}
