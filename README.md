# Whoami Project

Projekt przeglądarkowej strony WWW z TypeScript, CSS i Web Components.

## Struktura projektu

```
whoami/
├── src/           # Pliki TypeScript
├── dist/          # Skompilowane pliki JavaScript (generowane automatycznie)
├── index.html     # Główny plik HTML
├── index.css      # Style CSS
├── tsconfig.json  # Konfiguracja TypeScript
└── package.json   # Zależności i skrypty
```

## Instalacja

```bash
npm install
```

## Uruchomienie

### Tryb deweloperski (watch)
```bash
npm run dev
# lub
npm run watch
```

### Kompilacja jednorazowa
```bash
npm run build
```

## Konfiguracja TypeScript

- **Target**: ES2022 (najnowszy standard ECMAScript)
- **Module**: ES2022 (natywne importy ES6)
- **Output**: Pliki .js w katalogu `dist/`
- **Watch mode**: Automatyczna kompilacja przy zmianach
- **Source maps**: Włączone dla debugowania

## Funkcje

- ✅ TypeScript z najnowszymi funkcjami
- ✅ Natywne importy ES6 (bez bundlera)
- ✅ Web Components
- ✅ Tryb watch dla deweloperów
- ✅ Source maps
- ✅ Strict TypeScript
