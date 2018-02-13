import {NameMap} from "../constants";

// noinspection NonAsciiCharacters
export const NUMBER: NameMap = {
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
export const WEEKDAY_OFFSET: NameMap = {
    '天': 0,
    '日': 0,
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
};

export const zhStringToNumber = (text: string): number => {
    const len: number = text.length;
    let number: number = 0;
    let i: number = 0;
    for (;i < len;i++) {
        let char: string = text[i];
        if (char === '十') {
            number = number === 0 ? NUMBER[char] : (number * NUMBER[char]);
        } else {
            number += NUMBER[char];
        }
    }
    return number;
};

export const zhStringToYear = (text: string): number => {
    const len: number = text.length;
    let string: string = '';
    let i: number = 0;
    for (; i < len; i++) {
        string = string + NUMBER[text[i]];
    }

    return parseInt(string, 10);
};
