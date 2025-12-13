# Views Description - Budget Management Application

This document provides a detailed description of each view in the application, including the actions users can perform.

---

## 1. Dashboard (`/`)

**Status:** 🚧 Placeholder (Not yet implemented)

**Description:**
The main dashboard view is currently a placeholder. According to the project plan, it will display financial summaries and visualizations.

**Planned Features:**

- Summary cards showing:
  - Total income for selected period
  - Total expenses for selected period
  - Balance (income - expenses)
- Period selector component (presets: Today, This Week, This Month, This Year, Custom Range)
- Charts:
  - Pie chart: Expenses breakdown by category
  - Bar chart: Income vs Expenses comparison per month
- Responsive grid layout optimized for mobile and desktop

**Planned User Actions:**

- Select time period using period selector (presets or custom date range)
- View financial summary for selected period
- Navigate to other views (Transactions, Categories, Settings)
- View visual breakdown of expenses by category
- View monthly income vs expense trends

**Current Implementation:**

- Basic page structure with placeholder button
- No functional features yet

---

## 2. Transactions (`/transactions`)

**Status:** ✅ Fully Implemented

**Description:**
The transactions view is the main page for managing financial transactions. It displays a two-column layout on large screens: a form to add new transactions on the left, and a list of all transactions on the right. On mobile devices, the layout stacks vertically.

**Layout:**

- **Left Column (1/3 width on desktop):** Transaction form card
- **Right Column (2/3 width on desktop):** Transaction list card
- Responsive: Stacks vertically on mobile devices

### Transaction Form

**Location:** Left side of the transactions page

**Fields:**

1. **Amount** (`amount`)

   - Type: Number input
   - Required: Yes
   - Validation: Must be greater than 0
   - Format: Decimal with 2 decimal places
   - Placeholder: "0.00"
   - Description: "Kwota musi być większa od 0"

2. **Type** (`type`)

   - Type: Select dropdown
   - Required: Yes
   - Options:
     - "Przychód" (INCOME) - Green badge
     - "Wydatek" (EXPENSE) - Red badge
   - Placeholder: "Wybierz typ"

3. **Date** (`date`)

   - Type: Date picker
   - Required: Yes
   - Default: Today's date
   - Validation: Cannot be in the future
   - Max date: Today
   - Description: "Data nie może być z przyszłości"

4. **Category** (`categoryId`)

   - Type: Select dropdown
   - Required: No (optional)
   - Options: All available categories from database
   - Placeholder: "Wybierz kategorię (opcjonalnie)"

5. **Description** (`description`)
   - Type: Textarea
   - Required: No (optional)
   - Max length: 500 characters
   - Character counter: Shows current/max (e.g., "150/500 znaków")
   - Placeholder: "Opcjonalny opis transakcji"

**User Actions:**

- Fill in transaction details
- Submit form to create new transaction
- View real-time validation feedback
- See success message after successful submission
- See error messages for validation failures
- Form automatically resets after successful submission

**Validation:**

- **Client-side validation:**
  - Amount must be > 0
  - Date cannot be in the future
  - Type must be selected (INCOME or EXPENSE)
  - Description cannot exceed 500 characters
- **Server-side validation:**
  - Same validations as client-side
  - Additional error handling for database operations

**Feedback:**

- Success message: Green banner "Transakcja została dodana pomyślnie!" (displays for 2 seconds)
- Error messages: Red banner with specific validation error
- Loading state: Submit button shows "Dodawanie..." while processing

### Transaction List

**Location:** Right side of the transactions page

**Display:**

- Shows all transactions from the database
- Sorted by date (most recent first, based on typical database queries)
- Empty state: "Brak transakcji" message when no transactions exist

**Transaction Item Display:**
Each transaction item shows:

1. **Type Badge:**

   - Green badge with "Przychód" for INCOME transactions
   - Red badge with "Wydatek" for EXPENSE transactions
   - Positioned at the top left

2. **Date:**

   - Formatted as DD.MM.YYYY (Polish locale)
   - Displayed next to type badge
   - Format: "dd.mm.yyyy"

3. **Category Name:**

   - Displayed if transaction has an assigned category
   - Shown below date/type line
   - Text color: Default-600

4. **Description:**

   - Displayed if transaction has a description
   - Shown below category (or below date if no category)
   - Text color: Default-500
   - Truncated if too long

5. **Amount:**
   - Large, bold text
   - Positioned on the right side
   - Color:
     - Green (success) for INCOME transactions
     - Red (danger) for EXPENSE transactions
   - Format: Prefixed with "+" for income, "-" for expenses
   - Currency formatting: Uses formatCurrency() with PLN by default

**Visual Design:**

- Each transaction in a rounded card with border
- Spacing between items: 2 units (space-y-2)
- Padding: 4 units (p-4)
- Responsive layout

**User Actions:**

- View all transactions
- See transaction details (type, date, category, description, amount)
- Visual distinction between income and expense transactions
- (Planned) Click to edit transaction
- (Planned) Delete transaction with confirmation

**Planned Features (Not Yet Implemented):**

- Edit transaction functionality
- Delete transaction with confirmation modal
- Filtering by:
  - Transaction type (Income/Expense)
  - Category
  - Date range
- Sorting options (by date, amount, category)
- Pagination for large transaction lists

---

## 3. Categories (`/categories`)

**Status:** 📋 Planned (Not yet implemented)

**Description:**
The categories view will allow users to manage transaction categories. Categories are shared between income and expense transactions.

**Planned Layout:**

- List of all categories
- Form to add/edit categories
- Each category item with edit/delete actions

**Planned User Actions:**

- **Create Category:**

  - Enter category name
  - Submit to create new category
  - Validation: Name must be unique and not empty

- **Edit Category:**

  - Click edit button on category item
  - Modify category name
  - Save changes

- **Delete Category:**

  - Click delete button on category item
  - Confirm deletion in modal
  - Transactions with deleted category will have category set to null (cascade: set null)

- **View Categories:**
  - See all available categories
  - See which categories are in use
  - View category creation/update timestamps

**Planned Features:**

- Category name uniqueness validation
- Safe deletion (transactions remain but lose category assignment)
- Empty state when no categories exist
- Search/filter categories (if many exist)

---

## 4. Settings (`/settings`)

**Status:** 📋 Planned (Not yet implemented)

**Description:**
The settings view will allow users to configure application preferences, primarily currency settings.

**Planned Layout:**

- Settings form in a card
- Currency selector
- Save button

**Planned User Actions:**

- **Change Currency:**

  - Select currency from dropdown
  - Options: PLN (default), EUR, USD
  - Save settings
  - Currency change affects formatting throughout the application

- **View Current Settings:**
  - See currently selected currency
  - View other settings (if added in future)

**Planned Features:**

- Currency selection (PLN, EUR, USD)
- Settings persistence in database
- Global currency formatting across all views
- Settings stored as singleton record in database

**Impact:**

- Currency selection affects:
  - Transaction amount display
  - Summary calculations display
  - Chart labels and tooltips
  - All currency formatting throughout the app

---

## Navigation & Layout

**Current Navigation:**

- No navigation menu implemented yet
- Users navigate by URL directly

**Planned Navigation:**

- Navigation bar or sidebar with links to:
  - Dashboard (/)
  - Transactions (/transactions)
  - Categories (/categories)
  - Settings (/settings)
- Active route highlighting
- Responsive mobile menu

**Root Layout:**

- Provides theme provider (dark/light mode support via next-themes)
- Global styles
- Font configuration (Geist Sans, Geist Mono)
- Wraps all pages

---

## Data Flow & State Management

**Current Implementation:**

- Server-side data fetching using Next.js Server Components
- Server Actions for mutations (addTransaction)
- Client-side form state management with React hooks
- Router refresh after mutations to update data

**Transaction Flow:**

1. User fills form → Client-side validation
2. Submit → Server Action (addTransaction)
3. Server-side validation
4. Database insert
5. Revalidate path
6. Router refresh
7. Updated transaction list displayed

**Planned Improvements:**

- React Query or similar for optimistic updates
- Context API for global state (period, currency)
- Better loading states
- Error boundaries

---

## Responsive Design

**Breakpoints:**

- Mobile: Single column layout
- Desktop (lg: 1024px+): Multi-column layout

**Transaction Page:**

- Mobile: Form and list stack vertically
- Desktop: Form (1/3) and list (2/3) side by side

**All Views:**

- Container max-width: 6xl (1152px)
- Padding: 6 units (p-6)
- Gap between elements: 6 units (gap-6)

---

## Empty States

**Current Implementation:**

- Transaction list: "Brak transakcji" message

**Planned:**

- Empty states for all views with helpful messages
- Call-to-action buttons to add first item
- Illustrations or icons for better UX

---

## Error Handling

**Current Implementation:**

- Form validation errors displayed inline
- Server action errors returned and displayed
- Generic error messages for unexpected failures

**Planned:**

- Error boundaries for component-level errors
- Toast notifications for better UX
- Retry mechanisms for failed operations

---

## Accessibility

**Current Implementation:**

- Semantic HTML
- Form labels and descriptions
- Keyboard navigation support (HeroUI components)
- ARIA attributes via HeroUI

**Planned:**

- Screen reader optimizations
- Focus management
- Keyboard shortcuts
- High contrast mode support

---

## Summary

**Implemented Views:**

1. ✅ Transactions (`/transactions`) - Fully functional

**Planned Views:** 2. 📋 Dashboard (`/`) - Placeholder, planned with summaries and charts 3. 📋 Categories (`/categories`) - Planned for category management 4. 📋 Settings (`/settings`) - Planned for currency and preferences

**Key Actions Available:**

- ✅ Add transaction with full validation
- ✅ View all transactions with formatted display
- 📋 Edit transaction (planned)
- 📋 Delete transaction (planned)
- 📋 Filter transactions (planned)
- 📋 Manage categories (planned)
- 📋 Change currency settings (planned)
- 📋 View financial summaries (planned)
- 📋 View charts and visualizations (planned)
