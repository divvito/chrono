"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ENMergeDateTimeRefiner_1 = require("../EN/ENMergeDateTimeRefiner");
class DEMergeDateTimeRefiner extends ENMergeDateTimeRefiner_1.MergeDateTimeRefiner {
    constructor() {
        super(...arguments);
        this.TAG = 'DEMergeDateTimeRefiner';
        this.PATTERN = new RegExp("^\\s*(T|um|am|,|-)?\\s*$");
    }
}
exports.default = DEMergeDateTimeRefiner;
