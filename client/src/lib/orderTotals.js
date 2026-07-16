export const VAT_RATE = 0.05;
export const DELIVERY_FEE = 80;
export const DEFAULT_FOOD_PRICE = 250;

export function itemUnitPrice(item) {
  const value = Number(item?.price);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_FOOD_PRICE;
}

export function calcSubtotal(items = []) {
  return items.reduce((sum, item) => sum + itemUnitPrice(item) * (item.quantity || 0), 0);
}

export function calcOrderTotals(items = [], deliveryType = "pickup") {
  const subtotal = calcSubtotal(items);
  if (deliveryType === "delivery") {
    const vat = Math.round(subtotal * VAT_RATE);
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + vat + deliveryFee;
    return { subtotal, vat, deliveryFee, total };
  }
  return { subtotal, vat: 0, deliveryFee: 0, total: subtotal };
}
