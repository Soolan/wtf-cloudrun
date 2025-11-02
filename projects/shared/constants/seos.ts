import {SeoSocialShare} from '@shared/interfaces/seo-social-share';
import {SeoType} from '@shared/enums';

export const SEO_CONFIG: Record<SeoType, SeoSocialShare> = {
  [SeoType.BLOG]: {
    title: 'Blog - Write The Future',
    keywords: 'Write the future, WTF, AI, crypto news, crypto articles, NFT, metaverse, DAO, Blockchain, AI artwork, game',
    description: 'Latest blog posts from My Website.',
    image: '/assets/blog-image.jpg',
    imageAuxData: {
      width: 300,
      height: 300,
    },
    url: '/blog',
    author: 'Sohail Salehi Mava'
  },
  [SeoType.PAGE]: {
    title: 'About Us - Write The Future',
    keywords: 'Write the future, WTF, AI, crypto news, crypto articles, NFT, metaverse, DAO, Blockchain, AI artwork, game',
    description: 'Learn more about My Website.',
    image: '/assets/about-image.jpg',
    imageAuxData: {
      width: 300,
      height: 300,
    },
    url: '/about',
    author: 'Sohail Salehi Mava'
  },
  [SeoType.DEFAULT]: {
    title: 'Write The Future',
    keywords: 'Write the future, WTF, AI, crypto news, crypto articles, NFT, metaverse, DAO, Blockchain, AI artwork, game',
    description: 'Discover amazing content on My Website.',
    image: '/assets/default-image.jpg',
    imageAuxData: {
      width: 300,
      height: 300,
    },
    url: '/',
    author: 'Sohail Salehi Mava'
  },
};
