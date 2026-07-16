export function formatPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  return formatAmount(value);
}

export function formatAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "৳0";
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
