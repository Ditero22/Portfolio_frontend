export interface GearItem {
  name: string;
  detail: string;
  note: string;
}

export interface GearSection {
  title: string;
  eyebrow: string;
  items: GearItem[];
}
