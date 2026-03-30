# Database Schema (Supabase/PostgreSQL)

## Tables

This is version 1 - DEMO version.

### 1. `profiles` (Public Schema)
Extends `auth.users`. Created via database trigger on signup.
- `id`: uuid (PK, references auth.users)
- `full_name`: text
- `username`: text (unique)
- `avatar_url`: text
- `bio`: text

### 2. `equipment` (Public Schema)
The inventory items.
- `id`: uuid (PK)
- `owner_id`: uuid (FK -> profiles.id)
- `category`: text (e.g., 'Body', 'Lens', 'Lighting')
- `name`: text (e.g., 'Sony A7IV')
- `serial_number`: text (private/owner-only)
- `image_url`: text
- `status`: enum ('available', 'loaned', 'maintenance')
- `description`: text

### 3. `loans` (Phase 2/3)
Tracks the P2P movement of gear.
- `id`: uuid (PK)
- `item_id`: uuid (FK -> equipment.id)
- `borrower_id`: uuid (FK -> profiles.id)
- `status`: text ('pending', 'active', 'returned')
- `start_date`: timestamp
- `end_date`: timestamp

