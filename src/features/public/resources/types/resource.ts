export interface Resource {
  title: string;
  description: string;
  href: string;
  label: string;
}

export interface ResourceGroup {
  title: string;
  description: string;
  resources: Resource[];
}
