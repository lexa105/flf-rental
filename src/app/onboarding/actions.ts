'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ── Shared types ───────────────────────────────────────────────────────────────
// These mirror the form state in OnboardingFlow.tsx.
// If you extract to a shared types.ts, import them in both places.

export interface ProfileData {
  firstName: string;
  lastName: string;
  displayName: string;
  pronouns: string;
  jobTitle: string;
  bio: string;
  /** Base64 dataURL from FileReader. Upload to Supabase Storage first, then store the public URL. */
  avatarUrl: string | null;
}

export interface LocationData {
  name: string;
  address: string;
  type: 'studio' | 'home-studio' | 'remote' | 'office' | 'other';
  isPrimary: boolean;
}

export interface GearItemData {
  name: string;
  category: string;
  quantity: number;
  condition: string;
  notes: string;
}

// ── Step 1 ─────────────────────────────────────────────────────────────────────

/**
 * Saves the user's profile info after Step 1.
 *
 * TODO(@you): Uncomment the Supabase block once the `profiles` table exists.
 *
 * Suggested schema:
 *   profiles(user_id uuid PK references auth.users, first_name text,
 *            last_name text, display_name text, pronouns text,
 *            job_title text, bio text, avatar_url text, onboarded_at timestamptz)
 *
 * Avatar: `avatarUrl` arrives as a base64 dataURL. Before upsert, decode it,
 * upload the blob to Supabase Storage (`avatars` bucket), and swap in the
 * resulting public URL. Example:
 *   const { data } = await supabase.storage.from('avatars')
 *     .upload(`${user.id}/avatar.jpg`, blob, { upsert: true });
 *   const avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
 */
export async function saveProfile(
  data: ProfileData,
): Promise<{ success: boolean; message?: string }> {
  // const supabase = await createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) return { success: false, message: 'Not authenticated.' };
  //
  // const { error } = await supabase.from('profiles').upsert({
  //   user_id:      user.id,
  //   first_name:   data.firstName,
  //   last_name:    data.lastName,
  //   display_name: data.displayName,
  //   pronouns:     data.pronouns,
  //   job_title:    data.jobTitle,
  //   bio:          data.bio,
  //   avatar_url:   data.avatarUrl,  // store the Storage URL, not the base64
  // });
  // if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Step 2 ─────────────────────────────────────────────────────────────────────

/**
 * Saves the user's inventory locations after Step 2.
 *
 * TODO(@you): Uncomment once the `locations` table exists.
 *
 * Suggested schema:
 *   locations(id uuid PK default gen_random_uuid(), user_id uuid references auth.users,
 *             name text, address text, type text, is_primary bool, created_at timestamptz)
 *
 * Note: We delete existing locations first so re-running onboarding doesn't
 * create duplicates. Adjust if you'd rather upsert by (user_id, is_primary).
 */
export async function saveLocations(
  primary: Omit<LocationData, 'isPrimary'>,
  secondary: Omit<LocationData, 'isPrimary'> | null,
): Promise<{ success: boolean; message?: string }> {
  // const supabase = await createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) return { success: false, message: 'Not authenticated.' };
  //
  // await supabase.from('locations').delete().eq('user_id', user.id);
  //
  // const rows = [
  //   { user_id: user.id, ...primary, is_primary: true },
  //   ...(secondary ? [{ user_id: user.id, ...secondary, is_primary: false }] : []),
  // ];
  // const { error } = await supabase.from('locations').insert(rows);
  // if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Step 3 ─────────────────────────────────────────────────────────────────────

/**
 * Bulk-inserts the user's initial gear items after Step 3.
 *
 * TODO(@you): Uncomment once `inventory_items` table exists.
 *
 * Suggested schema:
 *   inventory_items(id uuid PK default gen_random_uuid(), owner_id uuid references auth.users,
 *                   name text, category text, quantity int default 1,
 *                   condition text, notes text,
 *                   created_at timestamptz default now(), updated_at timestamptz)
 *
 * Tip: add a `location_id` FK if you want items scoped to the primary location
 * set in Step 2. You can join locations by user_id to get the primary one.
 */
export async function saveGearItems(
  items: GearItemData[],
): Promise<{ success: boolean; message?: string }> {
  if (items.length === 0) return { success: true };

  // const supabase = await createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) return { success: false, message: 'Not authenticated.' };
  //
  // const { error } = await supabase.from('inventory_items').insert(
  //   items.map((item) => ({ owner_id: user.id, ...item })),
  // );
  // if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Final step ─────────────────────────────────────────────────────────────────

/**
 * Marks the user as fully onboarded and redirects to the main app.
 *
 * TODO(@you): Uncomment the profile update. The middleware (or page-level check
 * in onboarding/page.tsx) should verify `onboarded_at IS NOT NULL` and skip
 * this flow for returning users.
 *
 * Also wire up the middleware in src/middleware.ts to redirect unauthenticated
 * users to /login and users without `onboarded_at` to /onboarding.
 */
export async function completeOnboarding(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.updateUser({ data: { onboarding_completed: true } });
  redirect('/');
}
