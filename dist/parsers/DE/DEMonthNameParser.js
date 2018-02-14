"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const DE_1 = require("../../utils/DE");
const general_1 = require("../../utils/general");
class DEMonthNameParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(^|\\D\\s+|[^\\w\\s])' +
            '(Jan\\.?|Januar|Feb\\.?|Februar|Mär\\.?|M(?:ä|ae)rz|Mrz\\.?|Apr\\.?|April|Mai\\.?|Jun\\.?|Juni|Jul\\.?|Juli|Aug\\.?|August|Sep\\.?|Sept\\.?|September|Okt\\.?|Oktober|Nov\\.?|November|Dez\\.?|Dezember)' +
            '\\s*' +
            '(?:' +
            ',?\\s*(?:([0-9]{4})(\\s*[vn]\\.?\\s*C(?:hr)?\\.?)?|([0-9]{1,4})\\s*([vn]\\.?\\s*C(?:hr)?\\.?))' +
            ')?' +
            '(?=[^\\s\\w]|$)', 'i');
        this.MONTH_NAME_GROUP = 2;
        this.YEAR_GROUP = 3;
        this.YEAR_BE_GROUP = 4;
        this.YEAR_GROUP2 = 5;
        this.YEAR_BE_GROUP2 = 6;
        this.TAG = 'DEMonthNameParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index: match.index + match[1].length,
            ref: ref,
        });
        const month = DE_1.MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];
        result.start.imply(constants_1.DAY, 1);
        result.start.assign(constants_1.MONTH, month);
        let year = DE_1.yearCalculation(match[this.YEAR_GROUP] || match[this.YEAR_GROUP2], match[this.YEAR_BE_GROUP] || match[this.YEAR_BE_GROUP2]);
        if (year !== null) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = DEMonthNameParser;
