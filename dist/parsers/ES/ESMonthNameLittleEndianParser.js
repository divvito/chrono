"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const ES_1 = require("../../utils/ES");
const constants_1 = require("../../constants");
const general_1 = require("../../utils/general");
class ESMonthNameLittleEndianParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:(Domingo|Lunes|Martes|Miércoles|Miercoles|Jueves|Viernes|Sábado|Sabado|Dom|Lun|Mar|Mie|Jue|Vie|Sab)\\s*,?\\s*)?' +
            '([0-9]{1,2})(?:º|ª|°)?' +
            '(?:\\s*(?:desde|de|\\-|\\–|al?|hasta|\\s)\\s*([0-9]{1,2})(?:º|ª|°)?)?\\s*(?:de)?\\s*' +
            '(Ene(?:ro|\\.)?|Feb(?:rero|\\.)?|Mar(?:zo|\\.)?|Abr(?:il|\\.)?|May(?:o|\\.)?|Jun(?:io|\\.)?|Jul(?:io|\\.)?|Ago(?:sto|\\.)?|Sep(?:tiembre|\\.)?|Set(?:iembre|\\.)?|Oct(?:ubre|\\.)?|Nov(?:iembre|\\.)?|Dic(?:iembre|\\.)?)' +
            '(?:\\s*(?:del?)?(\\s*[0-9]{1,4}(?![^\\s]\\d))(\\s*[ad]\\.?\\s*c\\.?|a\\.?\\s*d\\.?)?)?' +
            '(?=\\W|$)', 'i');
        this.WEEKDAY_GROUP = 2;
        this.DATE_GROUP = 3;
        this.DATE_TO_GROUP = 4;
        this.MONTH_NAME_GROUP = 5;
        this.YEAR_GROUP = 6;
        this.YEAR_BE_GROUP = 7;
        this.TAG = 'ESMonthNameLittleEndianParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const month = ES_1.MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];
        if (!(month || month === 0)) {
            return null;
        }
        const day = parseInt(match[this.DATE_GROUP], 10);
        if (!day) {
            return null;
        }
        result.start.assign(constants_1.DAY, day);
        result.start.assign(constants_1.MONTH, month);
        let year = ES_1.yearCalculation(match[this.YEAR_GROUP], match[this.YEAR_BE_GROUP]);
        if (year) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        // Weekday component
        if (match[this.WEEKDAY_GROUP]) {
            const weekday = ES_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
            if (weekday || weekday === 0) {
                result.start.assign(constants_1.WEEKDAY, weekday);
            }
        }
        // Text can be 'range' value. Such as '12 - 13 January 2012'
        if (match[this.DATE_TO_GROUP]) {
            const endDate = parseInt(match[this.DATE_TO_GROUP], 10);
            if (endDate) {
                result.end = result.start.clone();
                result.end.assign(constants_1.DAY, endDate);
            }
        }
        return result;
    }
}
exports.default = ESMonthNameLittleEndianParser;
