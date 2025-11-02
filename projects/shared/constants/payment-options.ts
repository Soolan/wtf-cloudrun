import {PaymentOption, WtfQuery} from '@shared/interfaces';
import {CardBrand, CardType, PaymentMethodType} from '@shared/enums';
import {NOW} from '@shared/constants/timestamps';

export const PAYMENT_OPTIONS: WtfQuery = {
  path: 'payment_options',
  limit: 20,
  where: {field: 'timestamps.deleted_at', operator: '==', value: 0},
  orderBy: {field: 'timestamps.deleted_at', direction: 'desc'},
};

export const PAYMENT_MOCKS: PaymentOption[]  = [
  {
    paymentMethodId: 'pm_card_visa_123456',
    type: PaymentMethodType.Card,
    isDefault: true,
    timestamps: NOW,
    billingAddress: {
      line1: 'Jl. Sunset Road No. 88',
      city: 'Denpasar',
      postalCode: '80119',
      country: 'ID',
      phone: '+62-812-3456-7890',
    },
    card: {
      cardholderName: 'Jane Smith',
      cardType: CardType.Credit,
      brand: CardBrand.Visa,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      cardFingerprint: 'abc123xyz',
      issuerCountry: 'ID',
    },
  },
  {
    paymentMethodId: 'ba_tok_bca_789012',
    type: PaymentMethodType.BankAccount,
    isDefault: false,
    timestamps: NOW,
    bank: {
      accountLabel: 'Main BCA Account',
      accountHolderName: 'John Smith',
      accountNumberLast4: '9876',
      bankName: 'Bank Central Asia',
      bankCode: '014',
      country: 'ID',
      currency: 'IDR',
      bankTokenId: 'tok_bca_0987xyz',
    },
  }
];
