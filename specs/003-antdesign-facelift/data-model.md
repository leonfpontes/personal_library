# Data Model: AntDesign UI Facelift (Pivot to Shoelace)

**Feature**: 003-antdesign-facelift  
**Phase**: 1 (Design)  
**Date**: 2025-11-26

## Overview

This feature is **UI-only** and does not introduce new data entities or modify existing database schemas. All data structures (Users, Grants, Books) remain unchanged in PostgreSQL.

## Existing Entities (No Changes)

### User Entity
**Table**: `users`  
**Schema**: Unchanged (defined in Feature 001)

```typescript
interface User {
  id: string;           // UUID primary key
  name: string;         // Full name
  email: string;        // Unique email
  cpf: string;          // Unique CPF (Brazilian ID)
  password_hash: string; // bcrypt hash
  is_admin: boolean;    // Admin role flag
  created_at: Date;     // Timestamp
  updated_at: Date;     // Timestamp
}
```

**Frontend Usage**: Displayed in admin table, edited via drawer forms

---

### Grant Entity
**Table**: `user_grants`  
**Schema**: Unchanged (defined in Feature 001)

```typescript
interface Grant {
  user_id: string;      // Foreign key to users.id
  book_id: string;      // Book identifier (e.g., 'vivencia_pombogira')
  granted_at: Date;     // Timestamp
  granted_by: string;   // Admin user ID who granted
}
```

**Frontend Usage**: Displayed/edited in grants modal (checkboxes per book)

---

### Book Entity (Implicit)
**No Database Table** - Books are static HTML files in `/livros/`

```typescript
interface Book {
  id: string;           // Filename without extension (e.g., 'vivencia_pombogira')
  title: string;        // Display name (e.g., 'Os Mistérios de Pombogira')
  path: string;         // Relative path (e.g., 'livros/vivencia_pombogira.html')
  tags: string[];       // Metadata for filtering (e.g., ['Umbanda', 'Pombogira'])
  description: string;  // Brief summary for catalog card
}
```

**Frontend Usage**: 
- Rendered as cards in `index.html` using `<sl-card>`
- Tags displayed with `<sl-tag>`
- Filtered via `<sl-select>` component

---

## UI State Models (New - Frontend Only)

These models represent component state managed in browser memory (not persisted):

### AdminTableState
**Purpose**: Manage admin dashboard table state

```typescript
interface AdminTableState {
  users: User[];              // Fetched from /api/users
  filteredUsers: User[];      // After search/filter applied
  sortColumn: 'name' | 'email' | 'created_at' | null;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;        // Filter text
  selectedUserId: string | null;  // For edit drawer
  isDrawerOpen: boolean;      // Drawer visibility
  isModalOpen: boolean;       // Grants modal visibility
  loading: boolean;           // API call in progress
}
```

**Implementation**: JavaScript object in `scripts/admin.js`, not stored in localStorage

---

### DrawerFormState
**Purpose**: Manage create/edit user drawer form state

```typescript
interface DrawerFormState {
  mode: 'create' | 'edit';    // Form mode
  userId: string | null;      // For edit mode
  formData: {
    name: string;
    email: string;
    cpf: string;
    password: string;         // Only for create mode
    is_admin: boolean;
  };
  validationErrors: {
    name?: string;
    email?: string;
    cpf?: string;
    password?: string;
  };
  submitting: boolean;        // Form submission in progress
}
```

**Implementation**: Form state managed via Shoelace component properties and vanilla JS

---

### CatalogState
**Purpose**: Manage index.html filtering state

```typescript
interface CatalogState {
  books: Book[];              // Static list (hardcoded or from JSON)
  selectedTags: string[];     // Active filter tags
  visibleBooks: Book[];       // Filtered result
}
```

**Implementation**: JavaScript in `index.html` script section

---

### ThemeState (Existing - No Changes)
**Purpose**: Manage theme and font size preferences

```typescript
interface ThemeState {
  currentTheme: 'light' | 'dark' | 'sepia';  // Active theme
  fontSize: number;           // Base font size in pixels
}
```

**Storage**: localStorage keys `theme-index` (number 0-2) and `font-size` (number)
**Implementation**: Unchanged from current implementation

---

## API Contracts (Existing - No Changes)

All API endpoints remain unchanged. Frontend consumes same responses:

### GET /api/users
**Response**: `User[]`

### POST /api/users
**Request**: `{ name, email, cpf, password, is_admin }`  
**Response**: `User`

### PUT /api/users/:id
**Request**: `{ name?, email?, cpf?, is_admin? }`  
**Response**: `User`

### DELETE /api/users/:id
**Response**: `{ success: boolean }`

### GET /api/grants/:userId
**Response**: `Grant[]`

### PUT /api/grants/:userId
**Request**: `{ book_ids: string[] }`  
**Response**: `Grant[]`

---

## Data Flow Diagrams

### Admin CRUD Flow

```
User Action (Click "New User")
  ↓
JavaScript Event Listener
  ↓
Update AdminTableState (isDrawerOpen = true)
  ↓
Shoelace <sl-drawer>.show() method called
  ↓
User fills <sl-input> fields
  ↓
Form Submission Event
  ↓
Validate data (client-side)
  ↓
POST /api/users (fetch)
  ↓
API Response
  ↓
Update AdminTableState (users array + close drawer)
  ↓
Re-render table rows (innerHTML update)
```

### Catalog Filtering Flow

```
User selects tags in <sl-select>
  ↓
'sl-change' event fired
  ↓
Update CatalogState (selectedTags)
  ↓
Filter books array (JavaScript .filter())
  ↓
Update visibleBooks
  ↓
Show/hide <sl-card> elements (CSS display property)
```

---

## No Database Migrations Required

✅ **Zero schema changes**  
✅ **Zero new tables**  
✅ **Zero ALTER TABLE statements**  
✅ **Backend APIs unchanged**

This feature is **100% presentational layer only**.

---

## Summary

- **Entities**: No new entities, all existing entities (User, Grant, Book) unchanged
- **UI State**: New frontend state models for component management (AdminTableState, DrawerFormState, CatalogState)
- **Storage**: Only existing localStorage keys used (theme, font size)
- **API**: Zero changes to backend contracts
- **Migrations**: None required

**Ready for contracts/ generation and quickstart.md**
