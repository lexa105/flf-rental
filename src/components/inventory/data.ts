import type { TeamMember, Item, CategoryDef } from "./types";

export const TEAM: TeamMember[] = [
  { id: "u1",  name: "Maya Chen",    role: "Director",       initials: "MC", hue: 18,  photo: "https://i.pravatar.cc/240?img=47", email: "maya@flf.studio",   phone: "+1 (415) 555-0142", location: "San Francisco", joined: "Apr 2023", pronouns: "she/her",   bio: "Leads creative direction across all FLF productions. Likes long lenses and short briefs." },
  { id: "u2",  name: "Jordan Park",  role: "Cinematographer", initials: "JP", hue: 200, photo: "https://i.pravatar.cc/240?img=12", email: "jordan@flf.studio",  phone: "+1 (415) 555-0119", location: "Oakland",       joined: "Jun 2023", pronouns: "he/him",    bio: "Primary DP. Shoots most narrative + brand work. Loyal to the FX line." },
  { id: "u3",  name: "Sam Reyes",    role: "Editor",          initials: "SR", hue: 145, photo: "https://i.pravatar.cc/240?img=32", email: "sam@flf.studio",    phone: "+1 (415) 555-0188", location: "Remote",        joined: "Sep 2023", pronouns: "they/them", bio: "Post-production lead. Color, sound, and timeline whisperer." },
  { id: "u4",  name: "Alex Kim",     role: "Sound Mixer",     initials: "AK", hue: 280, photo: "https://i.pravatar.cc/240?img=68", email: "alex@flf.studio",   phone: "+1 (415) 555-0124", location: "San Francisco", joined: "Nov 2023", pronouns: "he/him",    bio: "Production sound + boom op. Always carries an extra windshield." },
  { id: "u5",  name: "Riley Brooks", role: "Producer",        initials: "RB", hue: 35,  photo: "https://i.pravatar.cc/240?img=49", email: "riley@flf.studio",  phone: "+1 (415) 555-0101", location: "San Francisco", joined: "Feb 2023", pronouns: "she/her",   bio: "Producer of record. Owner of the cage. Knows where everything is." },
  { id: "u6",  name: "Devon Wright", role: "Camera Op",       initials: "DW", hue: 220, photo: "https://i.pravatar.cc/240?img=15", email: "devon@flf.studio",  phone: "+1 (415) 555-0163", location: "Berkeley",      joined: "Jan 2024", pronouns: "he/him",    bio: "B-cam / steadicam operator. Reliable on long days." },
  { id: "u7",  name: "Casey Lin",    role: "Gaffer",          initials: "CL", hue: 5,   photo: "https://i.pravatar.cc/240?img=23", email: "casey@flf.studio",  phone: "+1 (415) 555-0177", location: "San Francisco", joined: "Mar 2024", pronouns: "she/her",   bio: "Lighting lead. Aputure / Astera / Nanlite. Will rebalance your color temp before you ask." },
  { id: "u8",  name: "Taylor Singh", role: "Producer",        initials: "TS", hue: 95,  photo: "https://i.pravatar.cc/240?img=44", email: "taylor@flf.studio", phone: "+1 (415) 555-0152", location: "Remote",        joined: "May 2024", pronouns: "they/them", bio: "Line producing on branded campaigns. Spreadsheet-fluent." },
  { id: "u9",  name: "Morgan Hayes", role: "DP",              initials: "MH", hue: 260, photo: "https://i.pravatar.cc/240?img=26", email: "morgan@flf.studio", phone: "+1 (415) 555-0135", location: "Oakland",       joined: "Aug 2024", pronouns: "she/her",   bio: "Secondary DP / documentary work. Prime-only when she can help it." },
  { id: "u10", name: "Jamie Cole",   role: "PA",              initials: "JC", hue: 170, photo: "https://i.pravatar.cc/240?img=59", email: "jamie@flf.studio",  phone: "+1 (415) 555-0198", location: "San Francisco", joined: "Feb 2026", pronouns: "he/him",    bio: "Production assistant. First in, last out." },
];

export const CATEGORIES: CategoryDef[] = [
  { id: "camera",    label: "Cameras" },
  { id: "lens",      label: "Lenses" },
  { id: "audio",     label: "Audio" },
  { id: "lighting",  label: "Lighting" },
  { id: "grip",      label: "Grip & Support" },
  { id: "storage",   label: "Cards & Storage" },
  { id: "accessory", label: "Accessories" },
  { id: "other",     label: "Other" },
];

export const LOCATIONS: string[] = [
  "Studio A · Shelf 1",
  "Studio A · Shelf 2",
  "Studio A · Cage",
  "Studio B · Cabinet",
  "Run Bag 01",
  "Run Bag 02",
  "Pelican 1610",
  "Backroom · Rack 3",
];

export const ITEMS: Item[] = [
  { id: "FLF-001", code: "FLF-001", name: "Sony FX3",                     category: "camera",    status: "checked-out", assignee: "u2", location: "Run Bag 01",       since: "May 14", note: "Body only, w/ XLR top handle", serial: "SN-44218" },
  { id: "FLF-002", code: "FLF-002", name: "Sony FX6",                     category: "camera",    status: "available",                  location: "Studio A · Cage",                                                serial: "SN-71190" },
  { id: "FLF-003", code: "FLF-003", name: "Sony a7S III",                 category: "camera",    status: "checked-out", assignee: "u6", location: "Run Bag 02",       since: "May 12",                             serial: "SN-30821" },
  { id: "FLF-004", code: "FLF-004", name: "BMPCC 6K Pro",                 category: "camera",    status: "available",                  location: "Studio A · Cage",                                                serial: "SN-66012" },
  { id: "FLF-005", code: "FLF-005", name: "DJI Ronin 4D",                 category: "camera",    status: "maintenance",                location: "Backroom · Rack 3",               note: "Gimbal recalibration", serial: "SN-90443" },
  { id: "FLF-010", code: "FLF-010", name: "Sony 24-70mm f/2.8 GM II",    category: "lens",      status: "checked-out", assignee: "u2", location: "Run Bag 01",       since: "May 14" },
  { id: "FLF-011", code: "FLF-011", name: "Sony 70-200mm f/2.8 GM",      category: "lens",      status: "available",                  location: "Studio A · Shelf 1" },
  { id: "FLF-012", code: "FLF-012", name: "Sigma 35mm f/1.4 Art",        category: "lens",      status: "available",                  location: "Studio A · Shelf 1" },
  { id: "FLF-013", code: "FLF-013", name: "Sigma 85mm f/1.4 DG DN",      category: "lens",      status: "checked-out", assignee: "u9", location: "Pelican 1610",     since: "May 10" },
  { id: "FLF-014", code: "FLF-014", name: "Tamron 28-75mm f/2.8",        category: "lens",      status: "available",                  location: "Studio A · Shelf 1" },
  { id: "FLF-015", code: "FLF-015", name: "Laowa 12mm f/2.8",            category: "lens",      status: "available",                  location: "Studio A · Shelf 1" },
  { id: "FLF-016", code: "FLF-016", name: "Canon RF 50mm f/1.2",         category: "lens",      status: "available",                  location: "Studio A · Shelf 1" },
  { id: "FLF-017", code: "FLF-017", name: "DZOFilm Vespid 35mm T2.1",   category: "lens",      status: "missing",                    location: "Studio A · Shelf 2",              note: "Not returned from May 02 shoot" },
  { id: "FLF-020", code: "FLF-020", name: "Sennheiser MKH-416",          category: "audio",     status: "checked-out", assignee: "u4", location: "Run Bag 01",       since: "May 14" },
  { id: "FLF-021", code: "FLF-021", name: "Rode NTG5",                   category: "audio",     status: "available",                  location: "Studio B · Cabinet" },
  { id: "FLF-022", code: "FLF-022", name: "DJI Mic 2 (Kit)",             category: "audio",     status: "checked-out", assignee: "u4", location: "Run Bag 02",       since: "May 12" },
  { id: "FLF-023", code: "FLF-023", name: "Zoom F6 Recorder",            category: "audio",     status: "available",                  location: "Studio B · Cabinet" },
  { id: "FLF-024", code: "FLF-024", name: "Sony UWP-D21 Lav Kit",        category: "audio",     status: "available",                  location: "Studio B · Cabinet" },
  { id: "FLF-025", code: "FLF-025", name: "Rycote Softie Windshield",    category: "audio",     status: "available",                  location: "Studio B · Cabinet" },
  { id: "FLF-030", code: "FLF-030", name: "Aputure 600d Pro",            category: "lighting",  status: "checked-out", assignee: "u7", location: "Studio A · Cage",  since: "May 13" },
  { id: "FLF-031", code: "FLF-031", name: "Aputure 300x",                category: "lighting",  status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-032", code: "FLF-032", name: "Aputure MC Pro (4-pack)",     category: "lighting",  status: "checked-out", assignee: "u7", location: "Run Bag 02",       since: "May 13" },
  { id: "FLF-033", code: "FLF-033", name: "Nanlite PavoTube II 30X",     category: "lighting",  status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-034", code: "FLF-034", name: "Aputure Light Dome III",      category: "lighting",  status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-035", code: "FLF-035", name: "Astera Titan Tube (×4)",      category: "lighting",  status: "maintenance",                location: "Backroom · Rack 3",               note: "Battery cell replacement" },
  { id: "FLF-040", code: "FLF-040", name: "Sachtler Flowtech 75",        category: "grip",      status: "checked-out", assignee: "u6", location: "Run Bag 02",       since: "May 12" },
  { id: "FLF-041", code: "FLF-041", name: "Manfrotto 504X Tripod",       category: "grip",      status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-042", code: "FLF-042", name: "DJI RS 4 Pro Gimbal",         category: "grip",      status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-043", code: "FLF-043", name: "Tilta Float Arm",             category: "grip",      status: "checked-out", assignee: "u2", location: "Run Bag 01",       since: "May 14" },
  { id: "FLF-044", code: "FLF-044", name: "C-Stand 40\" (×6)",           category: "grip",      status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-045", code: "FLF-045", name: "Slider 1m",                   category: "grip",      status: "available",                  location: "Studio A · Cage" },
  { id: "FLF-050", code: "FLF-050", name: "CFexpress Type A 160GB (×4)", category: "storage",   status: "checked-out", assignee: "u2", location: "Run Bag 01",       since: "May 14" },
  { id: "FLF-051", code: "FLF-051", name: "CFexpress Type A 80GB (×6)",  category: "storage",   status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-052", code: "FLF-052", name: "SanDisk SSD 2TB (×3)",        category: "storage",   status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-053", code: "FLF-053", name: "Atomos Ninja V",              category: "storage",   status: "checked-out", assignee: "u6", location: "Run Bag 02",       since: "May 12" },
  { id: "FLF-060", code: "FLF-060", name: "SmallHD Cine 7 Monitor",      category: "accessory", status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-061", code: "FLF-061", name: "Tilta Nucleus-M FF",          category: "accessory", status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-062", code: "FLF-062", name: "V-mount Battery 150Wh (×8)",  category: "accessory", status: "checked-out", assignee: "u7", location: "Run Bag 02",       since: "May 13" },
  { id: "FLF-063", code: "FLF-063", name: "NP-FZ100 Battery (×10)",      category: "accessory", status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-064", code: "FLF-064", name: "Matte Box, 4×5.65",           category: "accessory", status: "available",                  location: "Studio A · Shelf 2" },
  { id: "FLF-065", code: "FLF-065", name: "ND Filter Set (4-stop)",       category: "accessory", status: "available",                  location: "Studio A · Shelf 2" },
];

export const userById = (id: string) => TEAM.find((u) => u.id === id);
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);

export const STATUS_LABEL: Record<string, string> = {
  "available":   "Available",
  "checked-out": "Checked out",
  "maintenance": "Maintenance",
  "missing":     "Missing",
};
