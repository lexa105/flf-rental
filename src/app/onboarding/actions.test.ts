import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveProfile, saveLocations, saveGearItems, completeOnboarding } from './actions';

interface MockUser {
  id: string;
}

const {
  mockGetUser,
  mockUpsert,
  mockInsert,
  mockUpdate,
  mockUpdateEq,
  mockDeleteEq,
  mockDelete,
  mockFrom,
  mockUpload,
  mockGetPublicUrl,
  mockStorageFrom,
  mockUpdateUser,
  mockRedirect,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockDeleteEq: vi.fn(),
  mockDelete: vi.fn(),
  mockFrom: vi.fn(),
  mockUpload: vi.fn(),
  mockGetPublicUrl: vi.fn(),
  mockStorageFrom: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockRedirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser, updateUser: mockUpdateUser },
    from: mockFrom,
    storage: { from: mockStorageFrom },
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const AUTHENTICATED_USER: MockUser = { id: 'user-123' };
const PUBLIC_AVATAR_URL =
  'https://example.supabase.co/storage/v1/object/public/avatars/user-123/avatar.png';

function mockUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

function mockAuthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: AUTHENTICATED_USER }, error: null });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRedirect.mockImplementation(() => {
    throw new Error('NEXT_REDIRECT');
  });
  mockDelete.mockReturnValue({ eq: mockDeleteEq });
  mockDeleteEq.mockResolvedValue({ error: null });
  mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  mockUpdateEq.mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({
    upsert: mockUpsert,
    insert: mockInsert,
    delete: mockDelete,
    update: mockUpdate,
  });
  mockStorageFrom.mockReturnValue({ upload: mockUpload, getPublicUrl: mockGetPublicUrl });
  mockUpsert.mockResolvedValue({ error: null });
  mockInsert.mockResolvedValue({ error: null });
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_AVATAR_URL } });
  mockUpdateUser.mockResolvedValue({ error: null });
});

describe('saveProfile', () => {
  const profileData = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    displayName: 'Ada',
    pronouns: 'she/her',
    jobTitle: 'Engineer',
    bio: 'Bio',
    avatarUrl: null,
  };

  it('returns not authenticated when there is no user', async () => {
    mockUnauthenticated();
    const result = await saveProfile(profileData);
    expect(result).toEqual({ success: false, message: 'Not authenticated.' });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns the supabase error message when the upsert fails', async () => {
    mockAuthenticated();
    mockUpsert.mockResolvedValue({ error: { message: 'boom' } });
    const result = await saveProfile(profileData);
    expect(result).toEqual({ success: false, message: 'boom' });
  });

  it('upserts the profile keyed on id', async () => {
    mockAuthenticated();
    const result = await saveProfile(profileData);
    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith('profile');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-123',
        first_name: 'Ada',
        last_name: 'Lovelace',
        display_name: 'Ada',
        pronouns: 'she/her',
        job_title: 'Engineer',
        bio: 'Bio',
        avatar_url: null,
      }),
    );
  });

  it('passes an https avatar URL through without uploading to storage', async () => {
    mockAuthenticated();
    const result = await saveProfile({
      ...profileData,
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
    });
    expect(result).toEqual({ success: true });
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: 'https://cdn.example.com/avatar.jpg' }),
    );
  });

  it('uploads a base64 avatar to storage and stores the resulting public URL', async () => {
    mockAuthenticated();
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const result = await saveProfile({ ...profileData, avatarUrl: dataUrl });
    expect(result).toEqual({ success: true });
    expect(mockStorageFrom).toHaveBeenCalledWith('avatars');
    expect(mockUpload).toHaveBeenCalledWith(
      'user-123/avatar.png',
      expect.any(Buffer),
      { contentType: 'image/png', upsert: true },
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: PUBLIC_AVATAR_URL }),
    );
  });
});

describe('saveLocations', () => {
  const primary = { name: 'Studio A', address: '123 Main St', type: 'studio' as const };
  const secondary = { name: 'Home', address: '456 Side St', type: 'home-studio' as const };

  it('returns not authenticated when there is no user', async () => {
    mockUnauthenticated();
    const result = await saveLocations(primary, null);
    expect(result).toEqual({ success: false, message: 'Not authenticated.' });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('deletes existing locations then inserts primary and secondary rows', async () => {
    mockAuthenticated();
    const result = await saveLocations(primary, secondary);
    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith('location');
    expect(mockDeleteEq).toHaveBeenCalledWith('profile_id', 'user-123');
    expect(mockInsert).toHaveBeenCalledWith([
      { profile_id: 'user-123', ...primary, is_primary: true },
      { profile_id: 'user-123', ...secondary, is_primary: false },
    ]);
  });
});

describe('saveGearItems', () => {
  it('returns success without calling supabase for an empty list', async () => {
    const result = await saveGearItems([]);
    expect(result).toEqual({ success: true });
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns not authenticated when there is no user', async () => {
    mockUnauthenticated();
    const result = await saveGearItems([
      { name: 'Camera', category: 'video', quantity: 1, condition: 'good', notes: '' },
    ]);
    expect(result).toEqual({ success: false, message: 'Not authenticated.' });
  });

  it('inserts equipment rows mapping owner_id and notes', async () => {
    mockAuthenticated();
    const result = await saveGearItems([
      { name: 'Camera', category: 'video', quantity: 2, condition: 'good', notes: 'Slightly scratched' },
    ]);
    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith('equipment');
    expect(mockInsert).toHaveBeenCalledWith([
      {
        owner_id: 'user-123',
        name: 'Camera',
        category: 'video',
        quantity: 2,
        condition: 'good',
        notes: 'Slightly scratched',
      },
    ]);
  });
});

describe('completeOnboarding', () => {
  it('updates the profile row and user metadata, then redirects to /', async () => {
    mockAuthenticated();
    await expect(completeOnboarding()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockFrom).toHaveBeenCalledWith('profile');
    expect(mockUpdate).toHaveBeenCalledWith({ onboarding_complete: true });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'user-123');

    expect(mockUpdateUser).toHaveBeenCalledWith({ data: { onboarding_completed: true } });
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('skips the profile update when there is no authenticated user, but still sets metadata and redirects', async () => {
    mockUnauthenticated();
    await expect(completeOnboarding()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockUpdateUser).toHaveBeenCalledWith({ data: { onboarding_completed: true } });
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
