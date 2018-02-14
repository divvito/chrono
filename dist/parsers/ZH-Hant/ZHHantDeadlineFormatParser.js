"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const ZH_Hant_1 = require("../../utils/ZH-Hant");
class ZHHantDeadlineFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\d+|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+|半|幾)(?:\\s*)' +
            '(?:個)?' +
            '(秒(?:鐘)?|分鐘|小時|鐘|日|天|星期|禮拜|月|年)' +
            '(?:(?:之|過)?後|(?:之)?內)', 'i');
        this.NUMBER_GROUP = 1;
        this.UNIT_GROUP = 2;
        this.TAG = 'ZHDeadlineFormatParser';
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
        const matchedNumber = match[this.NUMBER_GROUP];
        let number = parseInt(matchedNumber, 10);
        if (isNaN(number)) {
            number = ZH_Hant_1.zhStringToNumber(matchedNumber);
            if (isNaN(number)) {
                if (matchedNumber === '幾') {
                    number = 3;
                }
                else if (matchedNumber === '半') {
                    number = 0.5;
                }
                else {
                    return null;
                }
            }
        }
        const date = moment(ref);
        const unitAbbr = match[this.UNIT_GROUP][0];
        let dateMode = false;
        switch (unitAbbr) {
            case '日':
            case '天':
                date.add(number, 'd');
                dateMode = true;
                break;
            case '星':
            case '禮':
                date.add(number * 7, 'd');
                dateMode = true;
                break;
            case '月':
                date.add(number, 'month');
                dateMode = true;
                break;
            case '年':
                date.add(number, 'year');
                dateMode = true;
                break;
            case '秒':
                date.add(number, 'second');
                break;
            case '分':
                date.add(number, 'minute');
                break;
            case '小':
            case '鐘':
                date.add(number, 'hour');
                break;
            default:
                return null;
        }
        if (dateMode) {
            result.start.assign(constants_1.YEAR, date.year());
            result.start.assign(constants_1.MONTH, date.month() + 1);
            result.start.assign(constants_1.DAY, date.date());
        }
        else {
            result.start.imply(constants_1.YEAR, date.year());
            result.start.imply(constants_1.MONTH, date.month() + 1);
            result.start.imply(constants_1.DAY, date.date());
            result.start.assign(constants_1.HOUR, date.hour());
            result.start.assign(constants_1.MINUTE, date.minute());
            result.start.assign(constants_1.SECOND, date.second());
        }
        return result;
    }
}
exports.default = ZHHantDeadlineFormatParser;
