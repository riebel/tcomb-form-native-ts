// Shared field utilities to reduce duplication across field classes
import type { TypeLikeMeta, AutoLabelCtx, I18nCtx } from '../types/field.types';

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
  ctx?: I18nCtx,
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
  // Optional legacy type hook to derive error text
  type?: {
    getValidationErrorMessage?: (value: unknown, path?: unknown, context?: unknown) => string;
  },
  // Optional validation context placeholder
  validationCtx?: { path?: Array<string | number>; context?: unknown },
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
  // If we still have an error state but no explicit message, consult type.getValidationErrorMessage
  if (hasError && !error && type?.getValidationErrorMessage) {
    try {
      const path = validationCtx?.path ?? [];
      const ctx = validationCtx?.context ?? {};
      error = type.getValidationErrorMessage(value, path as unknown, ctx);
    } catch {
      // ignore
    }
  }
  return { error, hasError: Boolean(hasError) };
}
