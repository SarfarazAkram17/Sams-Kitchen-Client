// Every amount in the app is a whole taka: never saved or shown with decimals.
export const roundMoney = (value) => Math.round(Number(value) || 0);

// Unit price after the percentage discount, rounded to a whole taka.
export const getDiscountedPrice = (price, discount = 0) => {
  const base = Number(price) || 0;
  const percent = Number(discount) || 0;
  return roundMoney(percent > 0 ? base - (base * percent) / 100 : base);
};

export const foodPrice = (food) => getDiscountedPrice(food?.price, food?.discount);

export const formatAmount = (value) => roundMoney(value).toLocaleString("en-BD");

export const formatCurrency = (value) => `৳${formatAmount(value)}`;
