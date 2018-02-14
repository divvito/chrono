"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENMergeDateTimeRefiner_1 = require("../EN/ENMergeDateTimeRefiner");
class FRMergeDateTimeRefiner extends ENMergeDateTimeRefiner_1.MergeDateTimeRefiner {
    constructor() {
        super(...arguments);
        this.TAG = 'FRMergeDateTimeRefiner';
        this.PATTERN = new RegExp("^\\s*(T|à|a|vers|de|,|-)?\\s*$");
    }
}
exports.default = FRMergeDateTimeRefiner;
