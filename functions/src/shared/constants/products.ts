import {Product} from '../enums';

export const PRODUCTS = [
  "Website", "Learn", "Dashboard", "Loor", "Wallet", "Faucet", "NFT", "DEX", "Cloud",
  "Workspace", "Library", "Zine", "News", "Console", "WhaleDrop", "DeFi"
];

export const PRODUCTS_SHORT = [
  "WEB", "LRN", "DSH", "LOR", "WAL", "FCT", "NFT", "DEX",
  "CLD", "WSP", "LIB", "ZIN", "NWS", "CON", "DRP", "DFI"
];

export const WTF_PRODUCTS_SELECT = [
  {name: PRODUCTS[Product.Website], value: Product.Website},
  {name: PRODUCTS[Product.Learn], value: Product.Learn},
  {name: PRODUCTS[Product.Dashboard], value: Product.Dashboard},
  {name: PRODUCTS[Product.Loor], value: Product.Loor},
  {name: PRODUCTS[Product.Wallet], value: Product.Wallet},
  {name: PRODUCTS[Product.Faucet], value: Product.Faucet},
  {name: PRODUCTS[Product.NFT], value: Product.NFT},
  {name: PRODUCTS[Product.DEX], value: Product.DEX},
  {name: PRODUCTS[Product.Cloud], value: Product.Cloud},
  {name: PRODUCTS[Product.Workspace], value: Product.Workspace},
  {name: PRODUCTS[Product.Library], value: Product.Library},
  {name: PRODUCTS[Product.Zine], value: Product.Zine},
  {name: PRODUCTS[Product.News], value: Product.News},
  {name: PRODUCTS[Product.Console], value: Product.Console},
  {name: PRODUCTS[Product.WhaleDrop], value: Product.WhaleDrop},
  {name: PRODUCTS[Product.DeFi], value: Product.DeFi},
];

export const PRODUCTS_ICONS = [
  'home', 'school', 'dashboard', 'casino', 'account_balance_wallet', 'paid',
  'wallpaper', 'currency_exchange', 'cloud', 'workspaces', 'local_library',
  'menu_book', 'campaign', 'space_dashboard', 'water_drop', 'price_change'
];
