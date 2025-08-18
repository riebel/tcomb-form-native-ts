// Shared field utilities to reduce duplication across field classes

export type TypeLikeMeta = {
  meta?: { kind?: string; optional?: boolean };
};

export type AutoLabelCtx = { auto: string; label?: string } | undefined;
export type I18nCtx = { i18n?: { optional?: string } } | undefined;

export function isOptionalType(type?: TypeLikeMeta): boolean {
  return Boolean(type?.meta?.optional || type?.meta?.kind === 'maybe');
}

export function applyAutoLabel(
  label: string | undefined | null,
  ctx: AutoLabelCtx,
): string | undefined | null {
  if (!label && ctx?.auto === 'labels' && ctx?.label) {
    return ctx.label;
  }
  return label;
}

export function appendOptionalSuffix<T extends string | undefined | null>(
  label: T,
  type?: TypeLikeMeta,
  ctx?: { i18n?: { optional?: string } },
): T {
  if (label && isOptionalType(type) && ctx?.i18n?.optional) {
    return `${label}${ctx.i18n.optional}` as unknown as T;
  }
  return label;
}

export function resolveError(
  prevHasError: boolean,
  prevError: string | undefined,
  options: { error?: string | ((value: unknown) => string); hasError?: boolean } | undefined,
  value: unknown,
): { error: string | undefined; hasError: boolean } {
  let error = prevError;
  let hasError = prevHasError;
  if (options?.error) {
    error = typeof options.error === 'function' ? options.error(value) : options.error;
    hasError = true;
  }
  if (typeof options?.hasError === 'boolean') {
    hasError = options.hasError;
  }
  return { error, hasError: Boolean(hasError) };
}
