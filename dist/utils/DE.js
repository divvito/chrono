"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEEKDAY_OFFSET = {
    'sonntag': 0,
    'so': 0,
    'montag': 1,
    'mo': 1,
    'dienstag': 2,
    'di': 2,
    'mittwoch': 3,
    'mi': 3,
    'donnerstag': 4,
    'do': 4,
    'freitag': 5,
    'fr': 5,
    'samstag': 6,
    'sa': 6
};
// noinspection NonAsciiCharacters, JSNonASCIINames
exports.MONTH_OFFSET = {
    'januar': 1,
    'jan': 1,
    'jan.': 1,
    'februar': 2,
    'feb': 2,
    'feb.': 2,
    'märz': 3,
    'maerz': 3,
    'mär': 3,
    'mär.': 3,
    'mrz': 3,
    'mrz.': 3,
    'april': 4,
    'apr': 4,
    'apr.': 4,
    'mai': 5,
    'juni': 6,
    'jun': 6,
    'jun.': 6,
    'juli': 7,
    'jul': 7,
    'jul.': 7,
    'august': 8,
    'aug': 8,
    'aug.': 8,
    'september': 9,
    'sep': 9,
    'sep.': 9,
    'sept': 9,
    'sept.': 9,
    'oktober': 10,
    'okt': 10,
    'okt.': 10,
    'november': 11,
    'nov': 11,
    'nov.': 11,
    'dezember': 12,
    'dez': 12,
    'dez.': 12
};
exports.INTEGER_WORDS_PATTERN = '(?:eins|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwoelf)';
// noinspection NonAsciiCharacters, JSNonASCIINames
exports.INTEGER_WORDS = {
    'eins': 1,
    'zwei': 2,
    'drei': 3,
    'vier': 4,
    'fünf': 5,
    'fuenf': 5,
    'sechs': 6,
    'sieben': 7,
    'acht': 8,
    'neun': 9,
    'zehn': 10,
    'elf': 11,
    'zwölf': 12,
    'zwoelf': 12
};
const V_REGEX = /v/i;
exports.yearCalculation = (year, yearBe) => {
    if (year) {
        let result = parseInt(year, 10);
        if (yearBe) {
            if (V_REGEX.test(yearBe)) {
                // v.Chr.
                result = -result;
            }
            return result;
        }
        else {
            if (result < 100) {
                result = result + 2000;
            }
            return result;
        }
    }
    return null;
};
const HALF_REGEX = /halben/;
exports.matchInteger = (text) => {
    let num = 0;
    if (exports.INTEGER_WORDS.hasOwnProperty(text)) {
        num = exports.INTEGER_WORDS[text];
    }
    else if (text === 'einer' || text === 'einem') {
        num = 1;
    }
    else if (text === 'einigen') {
        num = 3;
    }
    else if (HALF_REGEX.test(text)) {
        num = 0.5;
    }
    else {
        num = parseInt(text, 10);
    }
    return num;
};
const unitPatterns = {
    'hour': /stunde/,
    'minute': /min/,
    'second': /sekunde/,
    'week': /woche/,
    'day': /tag/,
    'month': /monat/,
    'year': /jahr/
};
exports.matchUnit = (text) => Object.keys(unitPatterns).find((unit) => unitPatterns[unit].test(text));
