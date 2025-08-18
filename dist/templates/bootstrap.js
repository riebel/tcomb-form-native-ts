"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Textbox_1 = __importDefault(require("../fields/Textbox"));
const Checkbox_1 = __importDefault(require("../fields/Checkbox"));
const Select_1 = __importDefault(require("../fields/Select"));
const DatePicker_1 = __importDefault(require("../fields/DatePicker"));
const List_1 = __importDefault(require("../components/List"));
const Struct_1 = __importDefault(require("../components/Struct"));
// Bootstrap-like templates mapping to built-in components
const templates = {
    textbox: Textbox_1.default.ReactComponent,
    checkbox: Checkbox_1.default.ReactComponent,
    select: Select_1.default.ReactComponent,
    datePicker: DatePicker_1.default.ReactComponent,
    list: List_1.default.ReactComponent,
    struct: Struct_1.default,
};
exports.default = templates;
