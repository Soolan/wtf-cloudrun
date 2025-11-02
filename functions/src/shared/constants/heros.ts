import {Hero} from '../interfaces';

export const AI_HEROES: Hero[] = [
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
    heading: "Wise Language Model",
    keyword: "Wise",
    description: "When LLM falls short, WLM steps up. Our Wise Language Model designed to " +
      "transform your business with a perfect blend of wisdom, accuracy, logical reasoning, and " +
      "scalability. It’s not just large; it’s wise!",
    image: "images/hero-empower.jpg",
    cta: {
      icon: "owl",
      label: "What is WLM?",
      link: "https://news.wtf.pub/"
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
