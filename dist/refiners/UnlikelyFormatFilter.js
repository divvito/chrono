"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("./refiner");
class UnlikelyFormatFilter extends refiner_1.Filter {
    constructor() {
        super(...arguments);
        this.REGEX = /^\d*(\.\d*)?$/;
    }
    isValid(text, result, opt) {
        return !result.text.replace(' ', '').match(this.REGEX);
    }
}
exports.default = UnlikelyFormatFilter;
