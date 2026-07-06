# Implementation Roadmap

## Step 1: Foundation (Current Status)
- [x] Initialize Next.js project.
- [x] Connect Supabase.
- [x] Set up `profiles` and `equipment` tables.
- [ ] Create Auth trigger for new users.

## Step 2: Personal Inventory (Immediate Goal)
- [] Implement `Add Gear` form (Name, Category, Image upload to Supabase Storage).
- [] Create `Dashboard` grid view to see all my gear.
- [] Create `Edit/Delete` functionality for equipment.

## Step 3: Social & P2P (Future)
- [ ] Build "Public Profile" page (e.g., lenslease.com/u/username).
- [ ] Implement "Request to Borrow" button.
- [ ] Add "Reservation Calendar" logic.
- [ ] Integrate Stripe for damage deposits.

## AI Instructions:
When helping me write code, always prioritize:
1. Type safety with TypeScript.
2. Server Actions for data mutations.
3. Clean, responsive Tailwind UI.