# Uruchomienie

## Wymagania

- Node.js 20 lub nowszy
- pnpm (lub npm/yarn)

## Instalacja

```bash
# 1. Instalacja zależności
pnpm install

# 2. Utworzenie pliku konfiguracyjnego
echo "DB_FILE_NAME=file:./local.db" > .env.local

# 3. Inicjalizacja bazy danych
pnpm drizzle-kit push

# 4. Załadowanie danych testowych
pnpm seed
```

## Uruchomienie serwera deweloperskiego

```bash
pnpm dev
```

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

## Uruchomienie produkcyjne

```bash
# Budowa aplikacji
pnpm build

# Uruchomienie serwera produkcyjnego
pnpm start
```

## Dostępne strony

- **/** - Dashboard z podsumowaniem i wykresami
- **/transactions** - Zarządzanie transakcjami
- **/categories** - Zarządzanie kategoriami
- **/settings** - Ustawienia waluty

