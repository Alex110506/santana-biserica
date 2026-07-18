# Biserica „Sf. M. Mc. Gheorghe” - Sântana

Site-ul de prezentare al Parohiei Ortodoxe Române Sântana I (Arad), implementat din
proiectul de design [claude.ai/design](https://claude.ai/design/p/7b79c495-9637-4147-aa07-6a03de671d6b)
(„Biserica Sf Gheorghe Santana.dc.html”).

**Stack:** Vite · React 19 · Tailwind CSS v4

## Pornire

```bash
npm install
npm run dev      # server de dezvoltare
npm run build    # build de producție în dist/
npm run preview  # servește build-ul local
```

## Structura codului

```
src/
  data/site.js            # tot conținutul site-ului (texte, program, cler, evenimente, contact)
  lib/nextService.js      # calculul „următoarea slujbă” (funcție pură, testabilă)
  hooks/                  # comportamente reutilizabile
    usePrefersReducedMotion.js
    useScrolled.js        # starea navbarului după scroll
    useParallax.js        # deplasarea imaginii din hero
    useNextService.js
  components/
    ui/                   # primitive: CrossIcon, Reveal (fade-in la scroll), SectionHeading/Kicker
    layout/               # Navbar (cu meniu mobil), Footer
    sections/             # câte o secțiune a paginii per fișier
src/index.css             # tokens de design (culori, fonturi, animații) - Tailwind v4 @theme
```

Regula de organizare: **conținutul** se editează în `src/data/site.js`, **aspectul** în
`src/index.css` (tokens) și în secțiunea respectivă, **comportamentul** în `src/hooks/`.

## Înlocuirea imaginilor provizorii

`public/assets/church-*.png` sunt imagini generate local, doar ca substituent.
Descărcați imaginile reale din proiectul de design (folderul `assets/`) și
suprascrieți fișierele cu **aceleași nume**:

- `church-front-cloudy.png` (hero + galerie)
- `church-facade.png` (secțiunea „Despre” + galerie)
- `church-towers.png`, `church-entrance.png`, `church-apse.png`, `church-side.png` (galerie)

Nu este nevoie de nicio modificare de cod.
