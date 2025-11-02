export interface FormField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'textarea' | 'checkbox' | 'custom-html' | 'date' | 'dropdown' | 'email' | 'file' | 'hidden' | 'password' | 'radio-group';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
  htmlContent?: string;
}
