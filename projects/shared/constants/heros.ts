import {Hero} from '@shared/interfaces';

export const AI_HEROES: Hero[] = [
  {
    heading: "Summon A Business, Into Existence!",
    keyword: "Summon",
    description: "Imagine manifesting your dream business simply by speaking it into reality. " +
      "You're exactly where you need to be.",
    image: "images/hero-empower.jpg",
    cta: {
      icon: "owl",
      label: "Sign me up!",
      link: "login"
    },
    analytics: {
      event: 'click',
      payload: {hero: 'Empower'}
    }
  },
  {
    heading: "A Kanban App With Free Employees!",
    keyword: "Free Employees!",
    description: "What defines a great employee? They are productive, intelligent, and dependable. " +
      "They deliver tasks on time and within budget.",
    image: "images/hero-kanban.jpg",
    cta: {
      icon: "rocket-launch",
      label: "Start for free",
      link: "login"
    },
    analytics: {
      event: 'click',
      payload: {hero: 'Empower'}
    }
  },
  {
    heading: "The Knowledge That Grows With Business",
    keyword: "Knowledge",
    description: "Create dynamic knowledge bases for your teams, making expertise and " +
      "resources accessible anytime, anywhere.",
    image: "images/hero-knowledge.jpg",
    cta: {
      icon: "book-open",
      label: "Knowledge base",
      link: "https://news.wtf.pub/"
    },
    analytics: {
      event: 'click',
      payload: {hero: 'Knowledge'}
    }
  },
  {
    heading: "Flawless Task Delivery: On Time, On Budget",
    keyword: "On Time, On Budget",
    description: "Assign, track, and deliver tasks effectively with our intuitive Kanban UI " +
      "and robust API integrations.",
    image: "images/hero-productivity.jpg",
    cta: {
      icon: "delivery_truck_bolt",
      label: "Task delivery",
      link: "https://news.wtf.pub/"
    },
    analytics: {
      event: 'click',
      payload: {hero: 'On Time & On Budget'}
    }
  },
];
