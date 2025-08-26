'use strict';

const core = require('./dist');

const finalExport = Object.assign(core.default || core, core);

module.exports = finalExport;
