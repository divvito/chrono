"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// noinspection NonAsciiCharacters
exports.NUMBER = {
    '零': 0,
    '一': 1,
    '二': 2,
    '兩': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9,
    '十': 10,
    '廿': 20,
    '卅': 30,
};
// noinspection NonAsciiCharacters
exports.WEEKDAY_OFFSET = {
    '天': 0,
    '日': 0,
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
};
exports.zhStringToNumber = (text) => {
    const len = text.length;
    let number = 0;
    let i = 0;
    for (; i < len; i++) {
        let char = text[i];
        if (char === '十') {
            number = number === 0 ? exports.NUMBER[char] : (number * exports.NUMBER[char]);
        }
        else {
            number += exports.NUMBER[char];
        }
    }
    return number;
};
exports.zhStringToYear = (text) => {
    const len = text.length;
    let string = '';
    let i = 0;
    for (; i < len; i++) {
        string = string + exports.NUMBER[text[i]];
    }
    return parseInt(string, 10);
};
