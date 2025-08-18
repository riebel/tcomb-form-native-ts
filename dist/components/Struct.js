"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Struct_native_1 = __importDefault(require("./Struct.native"));
const Struct = (props) => {
    // Default to the native implementation
    return (0, jsx_runtime_1.jsx)(Struct_native_1.default, Object.assign({}, props));
};
exports.default = Struct;
