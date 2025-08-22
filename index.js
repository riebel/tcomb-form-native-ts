'use strict';
const core = require('./dist');
const tv = require('tcomb-validation');

// Legacy-style default export (t) with tv primitives + form API
const t = Object.assign({}, tv);

// Attach form API
t.form = Object.assign(
  { Form: core.Form },
  {
    // Expose legacy field/component classes
    Textbox: core.Textbox,
    Checkbox: core.Checkbox,
    Select: core.Select,
    DatePicker: core.DatePicker,
    List: core.List,
    Struct: core.Struct,
  },
);

// Merge named exports so both styles work
module.exports = Object.assign(t, core);
