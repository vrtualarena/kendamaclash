# Kendama Clash Landing Page

Landing page static pentru `kendamaclash.ro`, pregatit pentru deploy gratuit pe GitHub Pages.

## Structura

- `index.html` - structura paginii
- `styles.css` - stiluri
- `app.js` - citeste `config.json` si randare dinamica
- `config.json` - configuratie editabila (hero, parteneri, evenimente, social)
- `resources/` - imagini promo
- `atmosfera/` - imagini atmosfera evenimente

## Cum personalizezi rapid

Editeaza doar `config.json`.

### Eveniment nou

Adauga un obiect nou in array-ul `events` cu campuri:

- `city`
- `venue`
- `address`
- `date` (`YYYY-MM-DD` sau gol daca urmeaza anunt)
- `time` (`HH:mm`)
- `iabiletUrl`
- `entryPrice`
- `vipPrice`
- `seats`
- `categories` (lista)
- `prizes` (lista de obiecte cu `category` + `prize`)
- `ticketCategories` (lista de obiecte cu `category` + `price`)
- `importantNotes` (lista de mentiuni importante)
- `notes`
- `image`

### Poze atmosfera

1. Pune pozele in folderul `atmosfera/` (ex: `atmosfera/poza1.jpg`).
2. Adauga fisierele in `config.json`, in `atmosphereGallery`, de exemplu:

```json
"atmosphereGallery": [
  "atmosfera/poza1.jpg",
  "atmosfera/poza2.jpg"
]
```

## Deploy pe GitHub Pages

## Varianta recomandata (repo dedicat)

1. Creeaza un repository GitHub nou, public, ex: `kendama-clash-landing`.
2. Urca fisierele proiectului in branch-ul `main`.
3. In GitHub: `Settings` -> `Pages`.
4. La `Build and deployment` seteaza:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` + `/ (root)`
5. Salveaza si asteapta 1-3 minute.
6. URL-ul va fi de forma: `https://<user>.github.io/kendama-clash-landing/`.

## Daca vrei domeniu custom (`kendamaclash.ro`)

1. In `Settings` -> `Pages` -> `Custom domain`, pune domeniul.
2. In DNS provider adauga:
   - `A` records catre IP-urile GitHub Pages
   - sau `CNAME` catre `<user>.github.io` (pentru subdomenii)
3. Bifeaza `Enforce HTTPS` dupa propagare.

## Editari viitoare

1. Modifici `config.json` (sau CSS/HTML).
2. Commit + push in `main`.
3. GitHub Pages publica automat update-ul.
