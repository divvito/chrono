"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const JP_1 = require("../../utils/JP");
const general_1 = require("../../utils/general");
class JPStandardParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(?:(同|((昭和|平成)?([0-9０-９]{2,4})))年\s*)?([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;
        this.YEAR_GROUP = 2;
        this.ERA_GROUP = 3;
        this.YEAR_NUMBER_GROUP = 4;
        this.MONTH_GROUP = 5;
        this.DAY_GROUP = 6;
        this.OTHER_PATTERNS = [
            /同年/
        ];
        this.TAG = 'JPStandardParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index;
        const result = new result_1.ParsedResult({
            text: match[0],
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const startMoment = moment(ref);
        const month = parseInt(JP_1.toHankaku(match[this.MONTH_GROUP]), 10);
        const day = parseInt(JP_1.toHankaku(match[this.DAY_GROUP]), 10);
        startMoment.set('date', day);
        startMoment.set('month', month - 1);
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        const matchedYear = match[this.YEAR_GROUP] || '';
        if (matchedYear.match(this.OTHER_PATTERNS[0])) {
            result.start.assign(constants_1.YEAR, startMoment.year());
        }
        else if (matchedYear) {
            let year = parseInt(JP_1.toHankaku(match[this.YEAR_NUMBER_GROUP]), 10);
            if (match[this.ERA_GROUP] === '平成') {
                year += 1988;
            }
            else if (match[this.ERA_GROUP] === '昭和') {
                year += 1925;
            }
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        return result;
    }
}
exports.default = JPStandardParser;
