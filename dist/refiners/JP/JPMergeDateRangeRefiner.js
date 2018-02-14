"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENMergeDateTimeRefiner_1 = require("../EN/ENMergeDateTimeRefiner");
class JPMergeDateTimeRefiner extends ENMergeDateTimeRefiner_1.MergeDateTimeRefiner {
    constructor() {
        super(...arguments);
        this.TAG = 'JPMergeDateTimeRefiner';
        this.PATTERN = /^\s*(から|ー)\s*$/i;
    }
}
exports.default = JPMergeDateTimeRefiner;
