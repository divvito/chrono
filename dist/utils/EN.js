"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEEKDAY_OFFSET = {
    'sunday': 0,
    'sun': 0,
    'monday': 1,
    'mon': 1,
    'tuesday': 2,
    'tue': 2,
    'wednesday': 3,
    'wed': 3,
    'thursday': 4,
    'thur': 4,
    'thurs': 4,
    'thu': 4,
    'friday': 5,
    'fri': 5,
    'saturday': 6,
    'sat': 6
};
exports.MONTH_OFFSET = {
    'january': 1,
    'jan': 1,
    'jan.': 1,
    'february': 2,
    'feb': 2,
    'feb.': 2,
    'march': 3,
    'mar': 3,
    'mar.': 3,
    'april': 4,
    'apr': 4,
    'apr.': 4,
    'may': 5,
    'june': 6,
    'jun': 6,
    'jun.': 6,
    'july': 7,
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
    'october': 10,
    'oct': 10,
    'oct.': 10,
    'november': 11,
    'nov': 11,
    'nov.': 11,
    'december': 12,
    'dec': 12,
    'dec.': 12
};
exports.INTEGER_WORDS = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'eleven': 11,
    'twelve': 12
};
exports.INTEGER_WORDS_PATTERN = '(?:'
    + Object.keys(exports.INTEGER_WORDS).join('|')
    + ')';
exports.ORDINAL_WORDS = {
    'first': 1,
    'second': 2,
    'third': 3,
    'fourth': 4,
    'fifth': 5,
    'sixth': 6,
    'seventh': 7,
    'eighth': 8,
    'ninth': 9,
    'tenth': 10,
    'eleventh': 11,
    'twelfth': 12,
    'thirteenth': 13,
    'fourteenth': 14,
    'fifteenth': 15,
    'sixteenth': 16,
    'seventeenth': 17,
    'eighteenth': 18,
    'nineteenth': 19,
    'twentieth': 20,
    'twenty first': 21,
    'twenty second': 22,
    'twenty third': 23,
    'twenty fourth': 24,
    'twenty fifth': 25,
    'twenty sixth': 26,
    'twenty seventh': 27,
    'twenty eighth': 28,
    'twenty ninth': 29,
    'thirtieth': 30,
    'thirty first': 31
};
exports.ORDINAL_WORDS_PATTERN = '(?:'
    + Object.keys(exports.ORDINAL_WORDS).join('|').replace(/ /g, '[ -]')
    + ')';
const TIME_UNIT = '(' + exports.INTEGER_WORDS_PATTERN + '|[0-9]+|an?(?:\\s*few)?|half(?:\\s*an?)?)\\s*' +
    '(sec(?:onds?)?|min(?:ute)?s?|hours?|weeks?|days?|months?|years?)\\s*';
const TIME_UNIT_STRICT = '([0-9]+|an?)\\s*' +
    '(seconds?|minutes?|hours?|days?)\\s*';
const PATTERN_TIME_UNIT = new RegExp(TIME_UNIT, 'i');
exports.TIME_UNIT_PATTERN = '(?:' + TIME_UNIT + ')+';
exports.TIME_UNIT_STRICT_PATTERN = '(?:' + TIME_UNIT_STRICT + ')+';
exports.extractDateTimeUnitFragments = (timeunitText) => {
    const fragments = {};
    let remainingText = timeunitText;
    let match = PATTERN_TIME_UNIT.exec(remainingText);
    while (match) {
        collectDateTimeFragment(match, fragments);
        remainingText = remainingText.substring(match[0].length);
        match = PATTERN_TIME_UNIT.exec(remainingText);
    }
    return fragments;
};
function collectDateTimeFragment(match, fragments) {
    const matchedNumber = match[1].toLowerCase();
    const matchedUnit = match[2].toLowerCase();
    let num = 0;
    if (exports.INTEGER_WORDS.hasOwnProperty(matchedNumber)) {
        num = exports.INTEGER_WORDS[matchedNumber];
    }
    else if (matchedNumber === 'a' || matchedNumber === 'an') {
        num = 1;
    }
    else if (matchedNumber.match(/few/)) {
        num = 3;
    }
    else if (matchedNumber.match(/half/)) {
        num = 0.5;
    }
    else {
        num = parseInt(matchedNumber, 10);
    }
    if (matchedUnit.match(/hour/)) {
        fragments['hour'] = num;
    }
    else if (matchedUnit.match(/min/)) {
        fragments['minute'] = num;
    }
    else if (matchedUnit.match(/sec/)) {
        fragments['second'] = num;
    }
    else if (matchedUnit.match(/week/)) {
        fragments['week'] = num;
    }
    else if (matchedUnit.match(/day/)) {
        fragments['d'] = num;
    }
    else if (matchedUnit.match(/month/)) {
        fragments['month'] = num;
    }
    else if (matchedUnit.match(/year/)) {
        fragments['year'] = num;
    }
    return fragments;
}
const HALF_REGEX = /half/;
const FEW_REGEX = /few/;
exports.matchInteger = (text) => {
    let num = 0;
    if (text) {
        if (exports.INTEGER_WORDS.hasOwnProperty(text)) {
            num = exports.INTEGER_WORDS[text];
        }
        else if (text === 'a' || text === 'an') {
            num = 1;
        }
        else if (text.match(FEW_REGEX)) {
            num = 3;
        }
        else if (text.match(HALF_REGEX)) {
            num = 0.5;
        }
        else {
            num = parseInt(text, 10);
        }
    }
    return num;
};
const unitPatterns = {
    'hour': /hour/,
    'minute': /min/,
    'second': /second/,
    'week': /week/,
    'day': /day/,
    'month': /month/,
    'year': /year/
};
exports.matchUnit = (text) => Object.keys(unitPatterns).find((unit) => unitPatterns[unit].test(text));
const BE_REGEX = /BE/i;
const BC_REGEX = /BC/i;
const AD_REGEX = /AD/i;
exports.yearCalculation = (year, maybeYearBe) => {
    if (year) {
        if (BE_REGEX.test(maybeYearBe || year)) {
            // Buddhist Era
            return parseInt(maybeYearBe ? year : year.replace(BE_REGEX, ''), 10) - 543;
        }
        else if (BC_REGEX.test(maybeYearBe || year)) {
            // Before Christ
            return -parseInt(maybeYearBe ? year : year.replace(BC_REGEX, ''), 10);
        }
        else if (AD_REGEX.test(maybeYearBe || year)) {
            return parseInt(maybeYearBe ? year : year.replace(AD_REGEX, ''), 10);
        }
        else {
            let result = parseInt(year, 10);
            if (result < 100) {
                result += 2000;
            }
            return result;
        }
    }
    return null;
};
