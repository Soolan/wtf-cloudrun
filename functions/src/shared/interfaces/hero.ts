export interface Hero {
  heading: string;
  keyword: string;
  description: string;
  image: string;
  cta: {
    icon: string;
    label: string;
    link: string;
  };
  analytics: {
    event: string;
    payload: any;
  }
}
