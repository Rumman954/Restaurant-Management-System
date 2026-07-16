export function formatPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
