"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocals = void 0;
const Textbox_native_1 = __importDefault(require("./Textbox.native"));
var Textbox_native_2 = require("./Textbox.native");
Object.defineProperty(exports, "getLocals", { enumerable: true, get: function () { return Textbox_native_2.getLocals; } });
class Textbox extends Textbox_native_1.default {
}
Textbox.ReactComponent = Textbox_native_1.default.ReactComponent;
exports.default = Textbox;
