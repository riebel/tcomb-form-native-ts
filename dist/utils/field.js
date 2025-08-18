"use strict";
// Shared field utilities to reduce duplication across field classes
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveError = exports.appendOptionalSuffix = exports.applyAutoLabel = exports.isOptionalType = void 0;
function isOptionalType(type) {
    var _a, _b;
    return Boolean(((_a = type === null || type === void 0 ? void 0 : type.meta) === null || _a === void 0 ? void 0 : _a.optional) || ((_b = type === null || type === void 0 ? void 0 : type.meta) === null || _b === void 0 ? void 0 : _b.kind) === 'maybe');
}
exports.isOptionalType = isOptionalType;
function applyAutoLabel(label, ctx) {
    if (!label && (ctx === null || ctx === void 0 ? void 0 : ctx.auto) === 'labels' && (ctx === null || ctx === void 0 ? void 0 : ctx.label)) {
        return ctx.label;
    }
    return label;
}
exports.applyAutoLabel = applyAutoLabel;
function appendOptionalSuffix(label, type, ctx) {
    var _a;
    if (label && isOptionalType(type) && ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.i18n) === null || _a === void 0 ? void 0 : _a.optional)) {
        return `${label}${ctx.i18n.optional}`;
    }
    return label;
}
exports.appendOptionalSuffix = appendOptionalSuffix;
function resolveError(prevHasError, prevError, options, value) {
    let error = prevError;
    let hasError = prevHasError;
    if (options === null || options === void 0 ? void 0 : options.error) {
        error = typeof options.error === 'function' ? options.error(value) : options.error;
        hasError = true;
    }
    if (typeof (options === null || options === void 0 ? void 0 : options.hasError) === 'boolean') {
        hasError = options.hasError;
    }
    return { error, hasError: Boolean(hasError) };
}
exports.resolveError = resolveError;
