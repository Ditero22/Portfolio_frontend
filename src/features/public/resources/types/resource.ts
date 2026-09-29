export interface Resource {
  id?: string;
  title: string;
  description: string;
  href: string;
  label: string;
  bestFor?: string;
}

export interface ResourceGroup {
  title: string;
  description: string;
  resources: Resource[];
}
