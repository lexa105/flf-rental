'use client';

import React, { useState, useRef } from 'react';
import { saveProfile, saveLocations, saveGearItems, completeOnboarding } from '@/app/onboarding/actions';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

type LocationType = 'studio' | 'home-studio' | 'remote' | 'office' | 'other';
type GearCategory = 'camera' | 'lens' | 'audio' | 'lighting' | 'grip' | 'storage' | 'accessory' | 'other';
type GearCondition = 'excellent' | 'good' | 'fair' | 'needs-repair';

interface Profile {
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle: string;
  bio: string;
  avatar: string | null;
}

interface Location {
  name: string;
  address: string;
  type: LocationType;
  isPublic: boolean;
}

interface LocationsData {
  primary: Location;
  hasSecondary: boolean;
  secondary: Location;
}

interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
  condition: GearCondition;
  notes: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'About you' },
  { n: 2, label: 'Locations' },
  { n: 3, label: 'Your gear' },
  { n: 4, label: 'Explore'   },
  { n: 5, label: 'All set'   },
] as const;

const TOTAL = STEPS.length;

const LOCATION_TYPES: { id: LocationType; label: string; desc: string }[] = [
  { id: 'studio',      label: 'Studio',      desc: 'Pro space'     },
  { id: 'home-studio', label: 'Home',         desc: 'Your own space'},
  { id: 'remote',      label: 'On location',  desc: 'No fixed cage' },
  { id: 'office',      label: 'Office',       desc: 'Corp space'    },
];

const GEAR_CATEGORIES: { id: GearCategory; label: string }[] = [
  { id: 'camera',      label: 'Cameras'     },
  { id: 'lens',        label: 'Lenses'      },
  { id: 'audio',       label: 'Audio'       },
  { id: 'lighting',    label: 'Lighting'    },
  { id: 'grip',        label: 'Grip'        },
  { id: 'storage',     label: 'Storage'     },
  { id: 'accessory',   label: 'Accessories' },
  { id: 'other',       label: 'Other'       },
];

const GEAR_CONDITIONS: { id: GearCondition; label: string }[] = [
  { id: 'excellent',    label: 'Excellent'    },
  { id: 'good',         label: 'Good'         },
  { id: 'fair',         label: 'Fair'         },
  { id: 'needs-repair', label: 'Needs repair' },
];

const CONDITION_COLORS: Record<GearCondition, string> = {
  'excellent':    'text-status-green bg-green-soft',
  'good':         'text-status-blue bg-blue-soft',
  'fair':         'text-status-amber bg-amber-soft',
  'needs-repair': 'text-status-red bg-red-soft',
};

// TODO: MOCK DATA — the Step 4 "Explore" creators below are made-up people,
// shown only so the step isn't empty. When the P2P/community features land,
// replace them with real users from Supabase, e.g.:
//   select p.display_name, p.job_title, p.avatar_url, count(e.id) as item_count
//   from profile p
//   left join equipment e on e.owner_id = p.id and e.is_public
//   where p.id != auth.uid()
//   group by p.id, p.display_name, p.job_title, p.avatar_url
//   limit 6
// (RLS note: only is_public gear is countable for other users.)
const MOCK_CREATORS = [
  { id: '1', name: 'Riley Bauer',  initials: 'RB', role: 'Director of Photography', itemCount: 15, badges: ['Cameras', 'Lenses', 'Lighting'] },
  { id: '2', name: 'Marco Della',  initials: 'MD', role: 'Sound Engineer',           itemCount: 16, badges: ['Audio', 'Accessories']         },
  { id: '3', name: 'Petra Novak',  initials: 'PN', role: 'Gaffer',                  itemCount: 18, badges: ['Lighting', 'Grip']             },
  { id: '4', name: 'Sam Li',       initials: 'SL', role: 'Camera Operator',          itemCount: 10, badges: ['Cameras', 'Lenses', 'Grip']    },
  { id: '5', name: 'Alex Kim',     initials: 'AK', role: 'Producer',                itemCount: 6,  badges: ['Accessories']                   },
  { id: '6', name: 'Jordan Maye',  initials: 'JM', role: 'Editor',                  itemCount: 11, badges: ['Storage', 'Accessories']       },
];

const CREATOR_BG = [
  'bg-green-800',
  'bg-ink',
  'bg-[#3d2b1f]',
  'bg-[#1a2d4a]',
  'bg-[#2b3d2b]',
  'bg-[#4a2b1a]',
];

// ── Shared small components ────────────────────────────────────────────────────

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted mb-1.5 flex items-center justify-between">
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="normal-case tracking-normal font-medium text-[12px] text-muted">{children}</span>;
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full bg-surface border border-border-strong rounded-lg h-[42px] px-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent-soft ${className}`}
    />
  );
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full bg-surface border border-border-strong rounded-lg px-3 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-muted resize-none focus:border-accent focus:ring-3 focus:ring-accent-soft ${className}`}
    />
  );
}

// ── Step 1 — Profile ───────────────────────────────────────────────────────────

function StepProfile({ data, onChange }: {
  data: Profile;
  onChange: (patch: Partial<Profile>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function loadAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = () => onChange({ avatar: reader.result as string });
    reader.readAsDataURL(file);
  }

  const initials = ((data.firstName?.[0] ?? '') + (data.lastName?.[0] ?? '')).toUpperCase() || '?';

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted mb-3">01 · About you</p>
      <h2 className="font-serif text-[36px] leading-[1.08] font-medium tracking-tight mb-2">
        Tell us about <em className="italic text-accent font-normal">you</em>.
      </h2>
      <p className="text-muted text-[14px] mb-8 max-w-[44ch]">
        Your name and face show up on every checkout, return, and gear handoff. Make it count.
      </p>

      {/* Avatar + hint */}
      <div className="flex items-start gap-6 mb-7">
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadAvatar(f); }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files?.[0]; if (f) loadAvatar(f);
            }}
            className={`relative w-[112px] h-[112px] rounded-full border border-dashed overflow-hidden grid place-items-center transition cursor-pointer ${
              dragging
                ? 'border-accent text-accent bg-accent-soft'
                : 'border-border-strong text-muted bg-surface-2 hover:border-ink-2 hover:text-ink-2'
            }`}
          >
            {data.avatar ? (
              <img src={data.avatar} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-center pointer-events-none">
                <svg className="mx-auto mb-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>
                </svg>
                <div className="font-mono text-[11px]">drop photo</div>
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-7 h-7 grid place-items-center rounded-full bg-ink text-paper border-2 border-surface-2 z-10 pointer-events-none">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
          </button>
          {data.avatar && (
            <button type="button" onClick={() => onChange({ avatar: null })}
              className="text-[11px] text-muted hover:text-accent transition cursor-pointer">
              Remove
            </button>
          )}
        </div>

        <div className="flex-1 pt-1.5">
          <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted mb-1.5">Display</div>
          <p className="text-[13.5px] text-ink-2 leading-[1.55]">
            PNG or JPG, at least 200&nbsp;×&nbsp;200. We'll crop to a circle.
            {!data.avatar && (
              <span className="text-muted"> Your initials <span className="font-mono font-semibold text-ink-2 px-1 py-0.5 bg-surface-2 rounded">{initials}</span> will be used until you upload.</span>
            )}
          </p>
        </div>
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Lbl>First name</Lbl>
          <FieldInput type="text" placeholder="Maya" value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })} />
        </div>
        <div>
          <Lbl>Last name</Lbl>
          <FieldInput type="text" placeholder="Chen" value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })} />
        </div>
      </div>

      {/* Display name */}
      <div className="gap-3 mb-4">
        <div>
          <Lbl>Display name <Hint>shown in the cage</Hint></Lbl>
          <FieldInput type="text" placeholder="Maya C." value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })} />
        </div>
        
      </div>

      {/* Job title */}
      <div className="mb-4">
        <Lbl>Job title <Hint>used in handoff notes</Hint></Lbl>
        <FieldInput type="text" placeholder="Director, DP, Producer…" value={data.jobTitle}
          onChange={(e) => onChange({ jobTitle: e.target.value })} />
      </div>

      {/* Bio */}
      <div>
        <Lbl>Short bio <Hint>optional</Hint></Lbl>
        <FieldTextarea rows={2}
          placeholder="One line — what you tend to shoot, the lenses you steal first, etc."
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })} />
      </div>
    </>
  );
}

// ── Step 2 — Locations ─────────────────────────────────────────────────────────

function LocationCard({ data, onChange, heading }: {
  data: Location;
  onChange: (patch: Partial<Location>) => void;
  heading: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted">{heading}</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Lbl>Location name</Lbl>
          <FieldInput type="text" placeholder="Studio A, Home lab…" value={data.name}
            onChange={(e) => onChange({ name: e.target.value })} />
        </div>
        <div>
          <Lbl>Address / city <Hint>optional</Hint></Lbl>
          <FieldInput type="text" placeholder="San Francisco, CA" value={data.address}
            onChange={(e) => onChange({ address: e.target.value })} />
        </div>
      </div>

      <div>
        <Lbl>Type</Lbl>
        <div className="grid grid-cols-4 gap-2">
          {LOCATION_TYPES.map((t) => {
            const active = data.type === t.id;
            return (
              <button key={t.id} type="button"
                onClick={() => onChange({ type: t.id })}
                className={`relative text-left rounded-lg p-3 border transition cursor-pointer ${
                  active ? 'border-accent bg-accent-soft' : 'border-border-strong bg-surface hover:border-ink-2'
                }`}
              >
                <div className={`text-[12.5px] font-medium leading-tight ${active ? 'text-accent' : 'text-ink'}`}>{t.label}</div>
                <div className="text-[11px] text-muted mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
        <div>
          <div className="text-[12.5px] font-medium text-ink">Share publicly</div>
          <div className="text-[11px] text-muted mt-0.5">Other users can see this location&apos;s name and address. Off = only you.</div>
        </div>
        <button type="button"
          role="switch"
          aria-checked={data.isPublic}
          onClick={() => onChange({ isPublic: !data.isPublic })}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full border transition cursor-pointer ${
            data.isPublic ? 'bg-accent border-accent' : 'bg-surface border-border-strong'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-surface shadow-sm transition-transform ${
              data.isPublic ? 'translate-x-[18px] bg-accent-ink' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function StepLocations({ data, onChange }: {
  data: LocationsData;
  onChange: (patch: Partial<LocationsData>) => void;
}) {
  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted mb-3">02 · Locations</p>
      <h2 className="font-serif text-[36px] leading-[1.08] font-medium tracking-tight mb-2">
        Dude, Where's my <em className="italic text-accent font-normal">gear</em>?
      </h2>
      <p className="text-muted text-[14px] mb-8 max-w-[44ch]">
        Set your primary inventory location — we'll default checkouts here. Add a secondary if you work across multiple spots.
      </p>

      <LocationCard
        heading="Primary location"
        data={data.primary}
        onChange={(patch) => onChange({ primary: { ...data.primary, ...patch } })}
      />

      <div className="mt-4">
        {!data.hasSecondary ? (
          <button type="button"
            onClick={() => onChange({ hasSecondary: true })}
            className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink transition cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full border border-border-strong grid place-items-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </span>
            Add a secondary location
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted">Secondary location</span>
              <button type="button"
                onClick={() => onChange({ hasSecondary: false })}
                className="text-[12px] text-muted hover:text-accent transition cursor-pointer"
              >
                Remove
              </button>
            </div>
            <LocationCard
              heading="Secondary location"
              data={data.secondary}
              onChange={(patch) => onChange({ secondary: { ...data.secondary, ...patch } })}
            />
          </div>
        )}
      </div>
    </>
  );
}

// ── Step 3 — Gear ──────────────────────────────────────────────────────────────

function StepGear({ items, onAdd, onRemove }: {
  items: GearItem[];
  onAdd: (item: GearItem) => void;
  onRemove: (id: string) => void;
}) {
  const [name,      setName]      = useState('');
  const [category,  setCategory]  = useState<GearCategory>('camera');
  const [quantity,  setQuantity]  = useState(1);
  const [condition, setCondition] = useState<GearCondition>('good');
  const [notes,     setNotes]     = useState('');

  function handleAdd() {
    if (!name.trim()) { toast.error('Enter an item name first.'); return; }
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      quantity,
      condition,
      notes: notes.trim(),
    });
    setName(''); setQuantity(1); setNotes('');
  }

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted mb-3">03 · Your gear</p>
      <h2 className="font-serif text-[36px] leading-[1.08] font-medium tracking-tight mb-2">
        Add your <em className="italic text-accent font-normal">inventory</em>.
      </h2>
      <p className="text-muted text-[14px] mb-8 max-w-[46ch]">
        Start with the gear you own or manage. You can always add more — or bulk import via CSV — from the inventory page.
      </p>

      {/* Add form */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        {/* Item name */}
        <div className="mb-4">
          <Lbl>Item name</Lbl>
          <FieldInput
            type="text"
            placeholder="Sony FX3, Sigma 35mm Art, Rode NTG4…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {/* Category chips */}
        <div className="mb-4">
          <Lbl>Category</Lbl>
          <div className="flex flex-wrap gap-1.5">
            {GEAR_CATEGORIES.map((c) => (
              <button key={c.id} type="button"
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center h-8 px-3 rounded-full text-[12.5px] border transition cursor-pointer ${
                  category === c.id
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-2 border-border-strong hover:text-ink hover:bg-surface hover:border-ink-2'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Qty + Condition */}
        <div className="grid grid-cols-[80px_1fr] gap-3 mb-4">
          <div>
            <Lbl>Qty</Lbl>
            <FieldInput type="number" min={1} value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
          </div>
          <div>
            <Lbl>Condition</Lbl>
            <div className="grid grid-cols-4 gap-1.5 h-[42px]">
              {GEAR_CONDITIONS.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => setCondition(c.id)}
                  className={`h-full rounded-lg text-[11.5px] border transition cursor-pointer ${
                    condition === c.id
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-surface-2 text-ink-2 border-border-strong hover:bg-surface hover:border-ink-2'
                  }`}
                >
                  {c.label === 'Needs repair' ? 'Repair' : c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <Lbl>Notes <Hint>optional</Hint></Lbl>
          <FieldInput type="text" placeholder="Serial #, case included, needs new battery…"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="button" onClick={handleAdd}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-ink text-paper text-[13.5px] font-medium transition hover:bg-ink-2 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add item
        </button>
      </div>

      {/* Items list */}
      {items.length > 0 ? (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted">Added items</span>
            <span className="font-mono text-[11px] text-muted">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] text-ink font-medium truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-mono text-[11px] text-muted capitalize">{item.category}</span>
                    {item.quantity > 1 && (
                      <span className="font-mono text-[11px] text-muted">× {item.quantity}</span>
                    )}
                    <span className={`text-[11px] px-1.5 py-px rounded font-medium ${CONDITION_COLORS[item.condition]}`}>
                      {item.condition}
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-muted truncate max-w-[140px]">{item.notes}</span>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(item.id)}
                  className="w-7 h-7 grid place-items-center rounded-md text-muted hover:text-status-red hover:bg-red-soft transition cursor-pointer flex-shrink-0"
                  aria-label="Remove"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface-2 border border-dashed border-border-strong rounded-xl px-5 py-8 text-center">
          <svg className="mx-auto mb-2 text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h3l2-3h8l2 3h3v12H3z"/><circle cx="12" cy="13" r="4"/>
          </svg>
          <div className="text-[13.5px] text-muted">No items yet.</div>
          <div className="text-[12px] text-muted mt-1">You can skip this and add gear from the inventory page later.</div>
        </div>
      )}
    </>
  );
}

// ── Step 4 — Explore ───────────────────────────────────────────────────────────

function StepExplore() {
  // TODO(@you): This is intentionally read-only — no data saved here.
  // Replace MOCK_CREATORS with a real fetch. If you add a "follow" feature,
  // create a `follows(follower_id, followee_id, followed_at)` table and
  // call a server action here to persist the selection.
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted mb-3">04 · Explore</p>
      <h2 className="font-serif text-[36px] leading-[1.08] font-medium tracking-tight mb-2">
        See what's in other <em className="italic text-accent font-normal">cages</em>.
      </h2>
      <p className="text-muted text-[14px] mb-8 max-w-[46ch]">
        Your team's gear is shared so you can plan shoots together. Here's who else is on the platform — take a look at what they're running.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {MOCK_CREATORS.map((creator, i) => {
          const isFollowed = followed.has(creator.id);
          return (
            <div key={creator.id}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 transition hover:border-border-strong"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full grid place-items-center font-serif text-[14px] tracking-tight flex-shrink-0 text-paper ${CREATOR_BG[i % CREATOR_BG.length]}`}>
                  {creator.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] text-ink font-medium tracking-tight truncate">{creator.name}</div>
                  <div className="font-mono text-[11px] text-muted truncate">{creator.role}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {creator.badges.map((b) => (
                  <span key={b} className="inline-block text-[11px] font-mono px-1.5 py-px bg-surface-2 border border-border text-muted rounded">
                    {b}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-mono text-[11px] text-muted">{creator.itemCount} items</span>
                <button type="button" onClick={() => toggle(creator.id)}
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] transition cursor-pointer ${
                    isFollowed
                      ? 'bg-ink text-paper'
                      : 'bg-surface-2 text-ink-2 border border-border-strong hover:text-ink hover:border-ink-2'
                  }`}
                >
                  {isFollowed && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l4.5 4.5L20 6"/>
                    </svg>
                  )}
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Step 5 — All set ───────────────────────────────────────────────────────────

function StepAllSet({ profile, locations, gearCount }: {
  profile: Profile;
  locations: LocationsData;
  gearCount: number;
}) {
  const initials = ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() || '?';
  const fullName  = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your name';
  const locType   = locations.primary.type?.replace('-', ' ') ?? '—';

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted mb-3">05 · All set</p>
      <h2 className="font-serif text-[36px] leading-[1.08] font-medium tracking-tight mb-2">
        You're <em className="italic text-accent font-normal">on the books</em>.
      </h2>
      <p className="text-muted text-[14px] mb-8 max-w-[48ch]">
        Your cage card is ready. Here's a quick look — anything wrong, go back and tweak it.
      </p>

      {/* Profile recap card */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-5">
        {/* Striped cover */}
        <div className="h-[80px] relative border-b border-border" style={{
          background: 'repeating-linear-gradient(135deg, transparent 0, transparent 8px, var(--border) 8px, var(--border) 9px)',
        }}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/60 to-transparent" />
        </div>

        <div className="px-5 pb-5 -mt-9 relative">
          {/* Avatar */}
          <div className="w-[68px] h-[68px] rounded-full border-[3px] border-surface bg-ink text-paper grid place-items-center font-serif text-[22px] tracking-tight mb-3 overflow-hidden flex-shrink-0">
            {profile.avatar
              ? <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
              : initials
            }
          </div>

          <div className="flex items-end justify-between gap-3 mb-1">
            <div>
              <h3 className="font-serif text-[22px] tracking-tight leading-tight">{fullName}</h3>
              {profile.displayName && (
                <div className="text-[13px] text-muted mt-0.5">@{profile.displayName}</div>
              )}
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-green-soft text-status-green rounded-full whitespace-nowrap flex-shrink-0">
              {gearCount} item{gearCount !== 1 ? 's' : ''} added
            </span>
          </div>

          {profile.jobTitle && (
            <div className="text-[13px] text-muted">{profile.jobTitle}</div>
          )}

          {locations.primary.name && (
            <div className="text-[13px] text-muted flex items-center gap-1.5 mt-1.5">
              <svg className="text-accent flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{[locations.primary.name, locations.primary.address].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-[13px] text-muted mt-3 pt-3 border-t border-border leading-[1.55] italic">
              {profile.bio}
            </p>
          )}

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-px bg-border mt-4 rounded-lg overflow-hidden border border-border">
            {[
              { value: gearCount,  label: 'Gear items'    },
              { value: locType,    label: 'Location type' },
              { value: locations.hasSecondary ? 2 : 1, label: locations.hasSecondary ? 'Locations' : 'Location' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-surface-2 px-3 py-2.5">
                <div className="font-serif text-[18px] tracking-tight capitalize">{value}</div>
                <div className="text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 text-[12.5px] text-muted bg-surface-2 border border-border rounded-lg px-4 py-3">
        <svg className="text-accent flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        <span>
          You can edit any of this later from your profile settings. Gear is always live — add, remove, and update from the inventory page any time.
        </span>
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const [step,      setStep]      = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    firstName: '', lastName: '', displayName: '',
    jobTitle: '', bio: '', avatar: null,
  });

  const [locations, setLocations] = useState<LocationsData>({
    primary:      { name: '', address: '', type: 'studio', isPublic: false },
    hasSecondary: false,
    secondary:    { name: '', address: '', type: 'studio', isPublic: false },
  });

  const [gear, setGear] = useState<GearItem[]>([]);

  const progress = Math.round((step / TOTAL) * 100);
  const isFirst  = step === 1;
  const isLast   = step === TOTAL;

  const nextLabel =
    step === TOTAL - 1 ? 'Finish & review' :
    step === TOTAL     ? 'Open inventory'  :
    'Continue';

  async function handleNext() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // TODO(@you): Uncomment each block once the corresponding server action
      // is wired to Supabase. Right now they're stubs that return { success: true }.
      if (step === 1) {
        const res = await saveProfile({ ...profile, avatarUrl: profile.avatar });
        if (!res.success) { toast.error('Could not save profile', { description: res.message }); return; }
      }
      if (step === 2) {
        const res = await saveLocations(
          locations.primary,
          locations.hasSecondary ? locations.secondary : null,
        );
        if (!res.success) { toast.error('Could not save locations', { description: res.message }); return; }
      }
      if (step === 3) {
        const res = await saveGearItems(
          gear.map(({ id: _id, ...item }) => item),
        );
        if (!res.success) { toast.error('Could not save gear', { description: res.message }); return; }
      }
      if (isLast) {
        await completeOnboarding();
        return; // redirect happens server-side
      }

      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      // Next.js redirect throws internally — let it propagate
      throw new Error('Navigation error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] min-h-screen font-sans selection:bg-accent/20">

      {/* ── Left: Brand + Step Rail ───────────────────────────────────────── */}
      {/* Pinned dark in both themes — theme tokens invert in dark mode, which made the
          hardcoded cream text below blend into a cream bg-ink background. */}
      <aside className="relative bg-[#1f1b16] text-[#f1ece1] px-10 py-9 hidden lg:flex flex-col overflow-hidden">
        {/* Film grain */}
        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.92  0 0 0 0 0.85  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`
        }} />
        {/* Accent glow blob */}
        <div className="absolute -top-16 -right-16 w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(184,67,30,0.22), transparent 60%)' }} />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-2.5 font-serif text-[19px] tracking-tight">
          <span className="w-[30px] h-[30px] bg-[#f1ece1] text-[#1f1b16] rounded-md grid place-items-center font-mono text-[11px] font-semibold">FLF</span>
          <span>Rental<em className="italic text-accent font-normal">&nbsp;system</em></span>
        </div>

        {/* Headline */}
        <div className="relative z-10 mt-12 max-w-[22ch]">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent flex items-center gap-3 mb-4">
            Profile setup
            <span className="flex-1 max-w-[80px] h-px bg-accent/45" />
          </div>
          <h1 className="font-serif text-[40px] leading-[1.04] tracking-tight font-normal">
            Let's get your <em className="italic text-accent">cage card</em> sorted.
          </h1>
          <p className="text-[14px] leading-[1.55] mt-4 max-w-[36ch]" style={{ color: 'rgba(241,236,225,0.65)' }}>
            A few quick questions so your check-outs, returns, and overdue pings land in the right place.
          </p>
        </div>

        {/* Step rail */}
        <ol className="relative z-10 mt-12 flex flex-col gap-1">
          {STEPS.map(({ n, label }) => {
            const isActive = n === step;
            const isDone   = n < step;
            return (
              <li key={n} className="flex items-center gap-3 py-2">
                {/* Pip */}
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-mono font-medium border transition flex-shrink-0 ${
                    isActive ? 'bg-accent border-accent text-[#fbf8f2]' :
                    isDone   ? 'bg-[#f1ece1] border-[#f1ece1] text-[#1f1b16]' : ''
                  }`}
                  style={!isActive && !isDone ? {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor:     'rgba(255,255,255,0.15)',
                    color:           'rgba(241,236,225,0.65)',
                  } : {}}
                >
                  {isDone ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l4.5 4.5L20 6"/>
                    </svg>
                  ) : String(n).padStart(2, '0')}
                </span>
                {/* Label */}
                <span
                  className="text-[13.5px] tracking-tight transition"
                  style={{ color: isActive ? '#f1ece1' : isDone ? 'rgba(241,236,225,0.75)' : 'rgba(241,236,225,0.45)' }}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-9 flex items-center justify-between gap-4 font-mono text-[11px]"
          style={{ color: 'rgba(241,236,225,0.5)' }}>
          <span>FLF · Studio A · Rental ops</span>
          <span style={{ color: 'rgba(184,67,30,0.85)' }}>v 1.0 — 2026</span>
        </div>
      </aside>

      {/* ── Right: Form ───────────────────────────────────────────────────── */}
      <section className="bg-paper flex flex-col relative">

        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 px-8 pt-6 pb-2 flex-shrink-0">
          <div className="text-[12.5px] text-muted flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12.5l2 2 4-4.5"/><circle cx="12" cy="12" r="9"/>
            </svg>
            Step {step} of {TOTAL}
          </div>
        </header>

        {/* Step content — key forces re-mount on step change, triggering the fade-in */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="w-full max-w-[560px] mx-auto">
            <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {step === 1 && (
                <StepProfile data={profile} onChange={(p) => setProfile((prev) => ({ ...prev, ...p }))} />
              )}
              {step === 2 && (
                <StepLocations data={locations} onChange={(p) => setLocations((prev) => ({ ...prev, ...p }))} />
              )}
              {step === 3 && (
                <StepGear
                  items={gear}
                  onAdd={(item) => setGear((prev) => [...prev, item])}
                  onRemove={(id) => setGear((prev) => prev.filter((i) => i.id !== id))}
                />
              )}
              {step === 4 && <StepExplore />}
              {step === 5 && (
                <StepAllSet profile={profile} locations={locations} gearCount={gear.length} />
              )}
            </div>
          </div>
        </main>

        {/* Footer: progress + nav */}
        <footer className="border-t border-border bg-surface/60 backdrop-blur-sm px-8 py-4 flex-shrink-0">
          <div className="flex items-center gap-5 max-w-[560px] mx-auto">
            {/* Progress */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="font-mono text-[11px] text-muted w-[40px] text-right">{progress}%</div>
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={handleBack}
                disabled={isFirst || isLoading}
                className="inline-flex items-center gap-2 h-[42px] px-4 rounded-lg border border-border-strong bg-surface text-ink text-[13px] font-medium tracking-tight transition hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M11 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button type="button" onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center gap-2 h-[42px] px-4 rounded-lg border border-ink bg-ink text-paper text-[13px] font-medium tracking-tight transition hover:bg-ink-2 active:translate-y-px disabled:opacity-60 cursor-pointer group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <span>{nextLabel}</span>
                    <svg className="transition-transform duration-160 group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
