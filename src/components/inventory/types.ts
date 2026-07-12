export type Status = "available" | "checked-out" | "maintenance" | "missing";
export type Category = "camera" | "lens" | "audio" | "lighting" | "grip" | "storage" | "accessory" | "other";
export type ActionType = "checkout" | "checkin" | "maintenance" | "missing" | "added" | "deleted";
export type ViewTab = "inventory" | "activity" | "team";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  hue: number;
  photo: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
  pronouns: string;
  bio: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category: Category;
  status: Status;
  assignee?: string;
  location: string;
  since?: string;
  note?: string;
  serial?: string;
}

export interface ActivityEntry {
  id: string;
  ts: string;
  type: ActionType;
  user: string;
  userName?: string;
  item: string;
  itemCode?: string;
  itemName?: string;
  note?: string;
}

export interface CategoryDef {
  id: Category;
  label: string;
}

export interface PendingAction {
  action: "checkout" | "checkin" | "maintenance" | "missing" | "delete";
  item: Item;
}

export interface StatusConfirmPayload {
  assignee: string;
  due: string;
  note: string;
}
