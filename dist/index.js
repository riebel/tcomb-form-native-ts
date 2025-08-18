"use strict";
// Main library entry point
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.stylesheet = exports.templates = exports.Form = void 0;
// Re-export all components
__exportStar(require("./components"), exports);
__exportStar(require("./fields"), exports);
// Export the main form component with convenience defaults
const Form_1 = __importDefault(require("./Form"));
exports.Form = Form_1.default;
const en_1 = __importDefault(require("./i18n/en"));
const bootstrap_1 = __importDefault(require("./stylesheets/bootstrap"));
const bootstrap_2 = __importDefault(require("./templates/bootstrap"));
exports.templates = bootstrap_2.default;
const FormEx = Form_1.default;
FormEx.i18n = en_1.default;
FormEx.stylesheet = bootstrap_1.default;
FormEx.templates = bootstrap_2.default;
Form_1.default.defaultProps = Object.assign(Object.assign({}, Form_1.default.defaultProps), { i18n: FormEx.i18n, stylesheet: FormEx.stylesheet, templates: FormEx.templates });
// Explicit exports for convenience
var bootstrap_3 = require("./stylesheets/bootstrap");
Object.defineProperty(exports, "stylesheet", { enumerable: true, get: function () { return __importDefault(bootstrap_3).default; } });
var en_2 = require("./i18n/en");
Object.defineProperty(exports, "i18n", { enumerable: true, get: function () { return __importDefault(en_2).default; } });
