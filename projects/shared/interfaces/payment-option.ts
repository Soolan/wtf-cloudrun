import {Timestamps} from '@shared/interfaces/timestamps';
import {CardBrand, CardType, PaymentMethodType} from '@shared/enums';

export interface PaymentOption {
  paymentMethodId: string;  // Unique ID/token provided by the payment gateway to charge or reuse this card.
                            // i.e.: Stripe's `pm_123`, Adyen's `recurringDetailReference`, etc.
  type: PaymentMethodType;
  card?: CardDetails;
  bank?: BankDetails;
  // wallet?: WalletDetails;
  timestamps: Timestamps;
  billingAddress?: BillingAddress;
  isDefault?: boolean; // optional: default card indicator
}

export interface CardDetails {
  cardholderName: string;
  cardType: CardType;
  brand: CardBrand;
  last4: string; // last 4 digits only
  expiryMonth: number; // 1-12
  expiryYear: number; // 4-digit year
  networkTokenized?: boolean; // optional: if the card was tokenized via network. It is useful if you're
                              // using tokenized cards from Apple Pay, Google Pay, Visa Token Service, etc.
  cardFingerprint?: string; // optional: hashed identifier for de-duplication. It is useful to identify
                            // cards uniquely without exposing sensitive info (e.g., Stripe/Adyen cards)
  issuerCountry?: string; // ISO 3166-1 alpha-2, e.g., 'US', 'ID'
}

export interface BankDetails {
  accountLabel?: string;
  accountHolderName: string;
  accountNumberLast4: string;
  bankName: string;
  bankCode?: string;    // Bank code (may vary by country — can be SWIFT, routing number, BSB, etc.)
  country: string;      // ISO 3166-1 alpha-2 code, e.g., 'US', 'ID', 'GB'
  currency: string;     // Currency code (ISO 4217), e.g., 'USD', 'IDR'
  bankTokenId?: string; // Optional identifier/token from your payment gateway
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}
