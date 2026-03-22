# Design System — Task Manager (Vibe 2: Glassmorphism)

## Scale
refined (small, Apple/Notion-like sizing)

## Palette
```
--bg-deep:        #0f172a   /* page/app background */
--bg-glass:       rgba(255,255,255,0.05)  /* glass panels */
--bg-glass-hover: rgba(255,255,255,0.09)
--border-glass:   rgba(255,255,255,0.12)
--text-main:      #f8fafc
--text-secondary: #cbd5e1
--text-muted:     rgba(255,255,255,0.4)
--accent-purple:  #6366f1
--accent-violet:  #a855f7
--accent-cyan:    #0ea5e9
--accent-teal:    #22d3ee
--urgent:         #ff4d4d
--medium:         #ffbd2e
--low:            #2ecc71
--navbar-bg:      #1e293b
```

## Glassmorphism recipe
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
```

## Background blobs (decorative)
```css
/* Blob 1 — top-left purple */
background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
filter: blur(70px); opacity: 0.4; border-radius: 50%;

/* Blob 2 — bottom-left cyan */
background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
filter: blur(60px); opacity: 0.3; border-radius: 50%;
```

## Typography
- Font: 'Inter', -apple-system, system-ui, sans-serif
- Section labels: 10px, uppercase, letter-spacing 0.1em, weight 700
- Nav items: 13px, weight 500
- User name: 13px, weight 600
- Status/meta: 11px

## Spacing & Radii
- Sidebar border-radius: 20–24px
- Nav item border-radius: 10px (active: border 1px solid rgba(255,255,255,0.2))
- Avatar border-radius: 12px
- Padding sidebar: 24px 16px
- Gap between nav items: 4px

## Active state
```css
background: rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

## Priority dots (with glow)
```css
width: 8px; height: 8px; border-radius: 50%;
box-shadow: 0 0 10px {color}88;
```

## Divider
```css
height: 1px;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
```

## Existing navbar
Background: #1e293b, height: 58px, sticky top, z-index 100.
Brand gradient: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%).
