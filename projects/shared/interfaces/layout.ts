export interface Layout {
  heading?: string;
  subheading?: string;
  content?: string;
  actions?: Button[];
}

export interface Button {
  label: string;
  icon?: string;
}
