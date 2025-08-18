export type TypeLikeMeta = {
    meta?: {
        kind?: string;
        optional?: boolean;
    };
};
export type AutoLabelCtx = {
    auto: string;
    label?: string;
} | undefined;
export type I18nCtx = {
    i18n?: {
        optional?: string;
    };
} | undefined;
export declare function isOptionalType(type?: TypeLikeMeta): boolean;
export declare function applyAutoLabel(label: string | undefined | null, ctx: AutoLabelCtx): string | undefined | null;
export declare function appendOptionalSuffix<T extends string | undefined | null>(label: T, type?: TypeLikeMeta, ctx?: {
    i18n?: {
        optional?: string;
    };
}): T;
export declare function resolveError(prevHasError: boolean, prevError: string | undefined, options: {
    error?: string | ((value: unknown) => string);
    hasError?: boolean;
} | undefined, value: unknown): {
    error: string | undefined;
    hasError: boolean;
};
