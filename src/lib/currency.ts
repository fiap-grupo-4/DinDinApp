const CENTS_PER_UNIT = 100;

function assertFiniteNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${fieldName} deve ser um número finito.`);
  }
}

function assertSafeInteger(value: number, fieldName: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${fieldName} deve ser um número inteiro seguro.`);
  }
}

export function toCents(value: number): number {
  assertFiniteNumber(value, "value");

  const valueInCents = Math.round(
    (value + Math.sign(value) * Number.EPSILON) * CENTS_PER_UNIT,
  );

  assertSafeInteger(valueInCents, "valueInCents");
  return valueInCents;
}

export function fromCents(valueInCents: number): number {
  assertSafeInteger(valueInCents, "valueInCents");
  return valueInCents / CENTS_PER_UNIT;
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(valueInCents: number): string {
  return brlFormatter.format(fromCents(valueInCents));
}

export function parseCurrencyInput(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export function maskCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  const cents = digits ? Number(digits) : 0;

  return fromCents(cents).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
