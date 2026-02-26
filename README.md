# Kendama Clash Landing Page

Landing page static pentru `kendamaclash.ro`, pregătită pentru deploy gratuit pe GitHub Pages.

## Structură

- `index.html` - structura paginii
- `styles.css` - stiluri
- `app.js` - logică UI și randare dinamică din config
- `config.json` - configurare editabilă (organizatori, parteneri, sponsori, evenimente, galerii, contact)
- `resources/` - postere promo (`img1.jpg`, `img2.jpg` etc.)
- `atmosfera/` - poze pentru caruselul „Atmosfera evenimentelor”
- `logo/` - logo-uri pentru parteneri/sponsori
- `scripts/sync-galleries.mjs` - script care actualizează automat galeriile în `config.json`

## Configurare rapidă

Editezi `config.json`.

### Organizatori

Cheie: `organizers`

Exemplu item:

```json
{
  "name": "VRtual Arena Zalău",
  "role": "Organizator principal",
  "logo": "logo/vrtual_arena_logo.jpg",
  "url": "https://www.facebook.com/vrtualarena"
}
```

### Parteneri

Cheie: `partners`

Folosit pentru parteneri media/promovare.

### Sponsori

Cheie: `sponsors`

Folosit pentru branduri cu contribuție financiară/materială.

### Evenimente

Cheie: `events`

Câmpuri uzuale:

- `city`, `venue`, `address`
- `date` (`YYYY-MM-DD`), `time` (`HH:mm`)
- `iabiletUrl`
- `seats`
- `categories`
- `prizes` (`category` + `prize`)
- `ticketCategories` (`category` + `price`)
- `importantNotes` (listă)
- `notes`
- `image`

## Galerie automată din directoare

Da, este automatizată prin script.

Limitare importantă: pe GitHub Pages (site static) NU poți citi automat directoarele la runtime din browser.
Soluția corectă este scriptul local care actualizează `config.json` înainte de push.

Rulează:

```bash
node scripts/sync-galleries.mjs
```

Ce face scriptul:

- actualizează `gallery` din `resources/` (fișiere `img*.jpg/png/...`)
- actualizează `atmosphereGallery` din toate imaginile din `atmosfera/`

Flux recomandat:

1. adaugi poze în directoare
2. rulezi `node scripts/sync-galleries.mjs`
3. commit + push

## Deploy GitHub Pages

1. Push în `main`
2. GitHub -> `Settings` -> `Pages`
3. `Source: Deploy from a branch`
4. `Branch: main` + `/ (root)`
5. Save

URL public:

`https://<user>.github.io/<repo>/`
