// Payout methods a rider can choose and the details each one needs.
// The server validates the same fields (routes/cashouts.js).
const mobileWalletFields = (placeholder, pattern, title) => [
  {
    name: "accountNumber",
    label: "Account number",
    placeholder,
    inputMode: "numeric",
    pattern,
    title,
  },
  {
    name: "accountType",
    label: "Account type",
    options: [
      { value: "personal", label: "Personal" },
      { value: "agent", label: "Agent" },
    ],
  },
];

const mobileNumber = "01[3-9][0-9]{8}";
const mobileTitle = "Enter an 11-digit mobile number, e.g. 01712345678";

export const CASHOUT_METHODS = {
  bkash: {
    label: "bKash",
    fields: mobileWalletFields("01XXXXXXXXX", mobileNumber, mobileTitle),
  },
  nagad: {
    label: "Nagad",
    fields: mobileWalletFields("01XXXXXXXXX", mobileNumber, mobileTitle),
  },
  rocket: {
    label: "Rocket",
    fields: mobileWalletFields(
      "01XXXXXXXXX or with last digit",
      "01[3-9][0-9]{8,9}",
      "Enter your 11 or 12-digit Rocket number",
    ),
  },
  card: {
    label: "Card",
    fields: [
      { name: "cardHolderName", label: "Card holder name", placeholder: "Name on card" },
      {
        name: "cardNumber",
        label: "Card number",
        placeholder: "1234 5678 9012 3456",
        inputMode: "numeric",
        pattern: "[0-9 \\-]{13,23}",
        title: "Enter the 13 to 19 digit card number",
      },
      { name: "bankName", label: "Issuing bank", placeholder: "e.g. City Bank" },
    ],
  },
  bank: {
    label: "Bank account",
    fields: [
      { name: "accountHolder", label: "Account holder name", placeholder: "Name on account" },
      { name: "bankName", label: "Bank name", placeholder: "e.g. Dutch-Bangla Bank" },
      { name: "branchName", label: "Branch name", placeholder: "e.g. Gulshan" },
      {
        name: "accountNumber",
        label: "Account number",
        placeholder: "Account number",
        inputMode: "numeric",
        pattern: "[0-9]{6,20}",
        title: "Enter 6 to 20 digits",
      },
    ],
  },
};
