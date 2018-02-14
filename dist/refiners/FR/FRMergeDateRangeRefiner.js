"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENMergeDateRangeRefiner_1 = require("../EN/ENMergeDateRangeRefiner");
class FRMergeDateRangeRefiner extends ENMergeDateRangeRefiner_1.MergeDateRangeRefiner {
    constructor() {
        super(...arguments);
        this.PATTERN = /^\s*([àa\-])\s*$/i;
        this.TAG = 'FRMergeDateRangeRefiner';
    }
}
exports.default = FRMergeDateRangeRefiner;
