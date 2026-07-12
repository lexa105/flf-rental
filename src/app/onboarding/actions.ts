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
 * `avatarUrl` may arrive as a base64 dataURL (freshly picked file), an
 * existing http(s) URL (already-uploaded avatar, unchanged), or null.
 */
export async function saveProfile(
  data: ProfileData,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Not authenticated.' };

  let avatarUrl = data.avatarUrl;

  if (avatarUrl && avatarUrl.startsWith('data:')) {
    const match = avatarUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) return { success: false, message: 'Invalid avatar image data.' };

    const [, mimeType, base64Payload] = match;
    const ext = mimeType.split('/')[1] || 'jpg';
    const buffer = Buffer.from(base64Payload, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}/avatar.${ext}`, buffer, { contentType: mimeType, upsert: true });
    if (uploadError) return { success: false, message: uploadError.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/avatar.${ext}`);
    avatarUrl = publicUrl;
  }

  const { error } = await supabase.from('profile').upsert({
    id: user.id,
    first_name: data.firstName,
    last_name: data.lastName,
    display_name: data.displayName,
    pronouns: data.pronouns,
    job_title: data.jobTitle,
    bio: data.bio,
    avatar_url: avatarUrl,
  });
  if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Step 2 ─────────────────────────────────────────────────────────────────────

/**
 * Saves the user's inventory locations after Step 2.
 *
 * We delete existing locations first so re-running onboarding doesn't
 * create duplicates.
 */
export async function saveLocations(
  primary: Omit<LocationData, 'isPrimary'>,
  secondary: Omit<LocationData, 'isPrimary'> | null,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Not authenticated.' };

  await supabase.from('location').delete().eq('profile_id', user.id);

  const rows = [
    { profile_id: user.id, ...primary, is_primary: true },
    ...(secondary ? [{ profile_id: user.id, ...secondary, is_primary: false }] : []),
  ];
  const { error } = await supabase.from('location').insert(rows);
  if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Step 3 ─────────────────────────────────────────────────────────────────────

/**
 * Bulk-inserts the user's initial gear items after Step 3.
 */
export async function saveGearItems(
  items: GearItemData[],
): Promise<{ success: boolean; message?: string }> {
  if (items.length === 0) return { success: true };

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Not authenticated.' };

  const { error } = await supabase.from('equipment').insert(
    items.map((item) => ({
      owner_id: user.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
      notes: item.notes || null,
    })),
  );
  if (error) return { success: false, message: error.message };

  return { success: true };
}

// ── Final step ─────────────────────────────────────────────────────────────────

/**
 * Marks the user as fully onboarded and redirects to the main app.
 *
 * Sets `profile.onboarding_complete` (the durable, queryable record) and the
 * `onboarding_completed` auth user_metadata flag (what middleware checks on
 * every request) before redirecting.
 */
export async function completeOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from('profile').update({ onboarding_complete: true }).eq('id', user.id);
  }

  await supabase.auth.updateUser({ data: { onboarding_completed: true } });
  redirect('/');
}
