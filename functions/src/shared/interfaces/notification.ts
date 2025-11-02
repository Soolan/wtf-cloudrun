export interface EmailNotification {
  to: string;
  cc?: string[];
  bcc?: string[];
  from?: string;
  message: {
    subject: string;
    html: string;
    text?: string;
  };
}

export interface InAppNotification {
  title: string;
  content: string;
  isViewed: boolean;
  product: string;
  timestamp: number;
}
