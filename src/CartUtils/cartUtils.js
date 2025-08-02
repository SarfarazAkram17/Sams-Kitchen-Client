const CART_KEY = "sam_kitchen_cart";

export function getCart() {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(foodId, quantity = 1) {
  const cart = getCart();
  const index = cart.findIndex(item => item.foodId === foodId);
  if (index >= 0) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ foodId, quantity });
  }
  saveCart(cart);
}

export function updateCartQuantity(foodId, quantity) {
  const cart = getCart();
  const index = cart.findIndex(item => item.foodId === foodId);
  if (index >= 0) {
    cart[index].quantity = quantity;
  }
  saveCart(cart);
}

export function removeFromCart(foodId) {
  const cart = getCart();
  const newCart = cart.filter(item => item.foodId !== foodId);
  saveCart(newCart);
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}