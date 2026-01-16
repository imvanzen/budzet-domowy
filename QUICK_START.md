# Quick Start Guide

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)

## Setup (First Time)

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local file
echo "DB_FILE_NAME=file:./local.db" > .env.local

# 3. Initialize database
pnpm drizzle-kit push

# 4. Seed with sample data
pnpm seed
```

## Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Pages

- **/** - Dashboard with summary and charts
- **/transactions** - Manage transactions (add, edit, delete)
- **/categories** - Manage categories (add, edit, delete)
- **/settings** - Change currency settings

## Sample Data

After seeding, you'll have:
- 11 categories (Jedzenie, Transport, Rozrywka, etc.)
- 6 sample transactions (mix of income and expenses)
- Default currency set to PLN

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm drizzle-kit push       # Push schema changes
pnpm drizzle-kit studio     # Open Drizzle Studio
pnpm seed                   # Reseed database

# Code Quality
pnpm lint             # Run linter
pnpm format           # Format code

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report
```

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Delete database and start fresh
rm local.db
pnpm drizzle-kit push
pnpm seed
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

### Dependencies Issues

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Project Structure

```
src/
├── app/              # Pages and routes
├── components/       # React components
├── services/         # Business logic
├── db/              # Database schema
└── lib/             # Utilities
```

## Features Overview

### Dashboard
- View total income, expenses, and balance
- Select time period (current month, last 3/6/12 months, custom)
- Visualize expenses by category
- Compare income vs expenses over time

### Transactions
- Add new transactions (income or expense)
- Edit existing transactions
- Delete transactions with confirmation
- Categorize transactions
- Add optional descriptions

### Categories
- Create custom categories
- Edit category names
- Delete categories (transactions become uncategorized)

### Settings
- Choose display currency (PLN, EUR, USD)
- Currency applies to all amounts in the app

## Tips

1. **Add categories first** before adding transactions for better organization
2. **Use descriptions** to add context to transactions
3. **Select period** on dashboard to focus on specific timeframes
4. **Regular backups** - copy `local.db` file periodically

## Support

For issues or questions, refer to:
- `docs/POC_PLAN.md` - Full project plan
- `docs/VIEWS_DESCRIPTION.md` - Detailed view descriptions
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

