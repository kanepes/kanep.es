'use strict';
// Storage adapter boundary. Today: Notion. Later: any DB that implements the same three functions.
const STORE = (process.env.STORE || 'notion').toLowerCase();
const adapters = { notion: () => require('./notion'), mock: () => require('./mock') };
if (!adapters[STORE]) throw new Error(`Unknown STORE adapter: ${STORE}`);
module.exports = adapters[STORE]();
