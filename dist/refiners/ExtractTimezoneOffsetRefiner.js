"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("./refiner");
const constants_1 = require("../constants");
class ExtractTimezoneOffsetRefiner extends refiner_1.default {
    constructor() {
        super(...arguments);
        this.TAG = 'ExtractTimezoneOffsetRefiner';
        this.TIMEZONE_OFFSET_PATTERN = new RegExp("^\\s*(GMT|UTC)?(\\+|\\-)(\\d{1,2}):?(\\d{2})", 'i');
        this.TIMEZONE_OFFSET_SIGN_GROUP = 2;
        this.TIMEZONE_OFFSET_HOUR_OFFSET_GROUP = 3;
        this.TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP = 4;
    }
    refine(text, results, opt) {
        results.forEach((result) => {
            if (result.start.isCertain(constants_1.TIMEZONE_OFFSET)) {
                return;
            }
            const match = this.TIMEZONE_OFFSET_PATTERN.exec(text.substring(result.index + result.text.length));
            if (!match) {
                return;
            }
            const hourOffset = parseInt(match[this.TIMEZONE_OFFSET_HOUR_OFFSET_GROUP], 10);
            const minuteOffset = parseInt(match[this.TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP], 10);
            let timezoneOffset = hourOffset * 60 + minuteOffset;
            if (match[this.TIMEZONE_OFFSET_SIGN_GROUP] === '-') {
                timezoneOffset = -timezoneOffset;
            }
            if (result.end != null) {
                result.end.assign(constants_1.TIMEZONE_OFFSET, timezoneOffset);
            }
            result.start.assign(constants_1.TIMEZONE_OFFSET, timezoneOffset);
            result.text += match[0];
            result.tags[this.TAG] = true;
        });
        return results;
    }
}
exports.default = ExtractTimezoneOffsetRefiner;
