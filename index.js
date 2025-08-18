'use strict';
const core = require('./dist');
const tv = require('tcomb-validation');

// Legacy-compatible default export: t with tcomb-validation primitives and form API
const t = Object.assign({}, tv);

// Attach form API
t.form = Object.assign(
  { Form: core.Form },
  {
    // Expose field/component classes expected by legacy consumers
    Textbox: core.Textbox,
    Checkbox: core.Checkbox,
    Select: core.Select,
    DatePicker: core.DatePicker,
    List: core.List,
    Struct: core.Struct,
  },
);

// Merge named exports into the legacy object so both styles work
module.exports = Object.assign(t, core);
