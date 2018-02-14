"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENMergeDateRangeRefiner_1 = require("../EN/ENMergeDateRangeRefiner");
class DEMergeDateRangeRefiner extends ENMergeDateRangeRefiner_1.MergeDateRangeRefiner {
    constructor() {
        super(...arguments);
        this.PATTERN = /^\s*(bis(?:\s*(?:am|zum))?|\-)\s*$/i;
        this.TAG = 'DEMergeDateRangeRefiner';
    }
}
exports.default = DEMergeDateRangeRefiner;
