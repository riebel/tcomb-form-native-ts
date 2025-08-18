"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const List_native_1 = __importDefault(require("./List.native"));
class List {
    constructor(props) {
        this.props = props;
    }
    getItemType() {
        var _a, _b;
        const t = this.props.type;
        return (((_a = t === null || t === void 0 ? void 0 : t.meta) === null || _a === void 0 ? void 0 : _a.type) || ((_b = t === null || t === void 0 ? void 0 : t.meta) === null || _b === void 0 ? void 0 : _b.of));
    }
    // Builds a lightweight description of items for tests to introspect
    getItems() {
        const values = Array.isArray(this.props.value) ? this.props.value : [];
        const inner = this.getItemType();
        return values.map((item, index) => {
            // If inner type is a union with dispatch, select the concrete type for this item
            const concreteType = typeof (inner === null || inner === void 0 ? void 0 : inner.dispatch) === 'function' ? inner.dispatch(item) : inner;
            const input = {
                // Mimic a React element-like shape that tests access via `.input.props.type`
                props: { type: concreteType },
            };
            return {
                key: String(index),
                input,
                item,
                index,
            };
        });
    }
    getTemplate() {
        var _a;
        const { ctx } = this.props;
        return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.templates) === null || _a === void 0 ? void 0 : _a.list;
    }
}
exports.List = List;
List.ReactComponent = (_a = class extends react_1.default.Component {
        render() {
            return (0, jsx_runtime_1.jsx)(List_native_1.default, Object.assign({}, this.props));
        }
    },
    _a.displayName = 'List',
    _a);
exports.default = List;
