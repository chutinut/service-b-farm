function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toSnakeCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

export function convertKeysToCamelCase<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeysToCamelCase(item)) as T;
  }

  if (isPlainObject(value)) {
    const converted = Object.entries(value).reduce<Record<string, unknown>>(
      (acc, [key, currentValue]) => {
        acc[toCamelCase(key)] = convertKeysToCamelCase(currentValue);
        return acc;
      },
      {},
    );

    return converted as T;
  }

  return value;
}

export function convertKeysToSnakeCase<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeysToSnakeCase(item)) as T;
  }

  if (isPlainObject(value)) {
    const converted = Object.entries(value).reduce<Record<string, unknown>>(
      (acc, [key, currentValue]) => {
        acc[toSnakeCase(key)] = convertKeysToSnakeCase(currentValue);
        return acc;
      },
      {},
    );

    return converted as T;
  }

  return value;
}
