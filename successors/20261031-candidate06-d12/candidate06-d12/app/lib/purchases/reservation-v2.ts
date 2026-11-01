export function ensure(value: unknown, message = "Invalid reservation purchase"): asserts value {
  if (!value) throw new Error(message);
}
