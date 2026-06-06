"use client";

export const positiveNumber = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Phải lớn hơn 0";
  return undefined;
};

export const BOX_QUANTITY_MIN = 1;
export const BOX_QUANTITY_MAX = 100;

export function validateBoxQuantity(value: unknown) {
  if (value === null || value === undefined || String(value).trim() === "") return "Bắt buộc";
  const n = Number(String(value).trim());
  if (!Number.isFinite(n)) return "Phải là số hợp lệ";
  if (!Number.isInteger(n)) return "Phải là số nguyên";
  if (n <= 0) return "Phải lớn hơn 0";
  if (n > BOX_QUANTITY_MAX) return `Tối đa ${BOX_QUANTITY_MAX} thùng mỗi lần tạo`;
  return undefined;
}

export const positiveIntegerMax100 = validateBoxQuantity;

export function parseBoxQuantityStrict(value: unknown): number {
  const message = validateBoxQuantity(value);
  if (message) throw new Error(message);
  return Math.floor(Number(String(value).trim()));
}

export function parsePositiveNumber(value: unknown) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
