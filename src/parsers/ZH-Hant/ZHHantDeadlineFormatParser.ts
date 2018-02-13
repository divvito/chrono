import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MINUTE, MONTH, SECOND, YEAR} from "../../constants";
import {NUMBER, zhStringToNumber} from "../../utils/ZH-Hant";

export default class ZHHantDeadlineFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp(
        '(\\d+|[' + Object.keys(NUMBER).join('') + ']+|半|幾)(?:\\s*)' +
        '(?:個)?' +
        '(秒(?:鐘)?|分鐘|小時|鐘|日|天|星期|禮拜|月|年)' +
        '(?:(?:之|過)?後|(?:之)?內)', 'i'
    );

    private NUMBER_GROUP: number = 1;
    private UNIT_GROUP: number = 2;


    private TAG: string = 'ZHDeadlineFormatParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index;
        const result: ParsedResult = new ParsedResult({
            text: match[0],
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const matchedNumber: string = match[this.NUMBER_GROUP];
        let number: number = parseInt(matchedNumber, 10);

        if (isNaN(number)) {
            number = zhStringToNumber(matchedNumber);
            if (isNaN(number)) {
                if (matchedNumber === '幾') {
                    number = 3;
                } else if (matchedNumber === '半') {
                    number = 0.5;
                } else {
                    return null;
                }
            }
        }

        const date: Moment = moment(ref);
        const unitAbbr: string = match[this.UNIT_GROUP][0];
        let dateMode: boolean = false;

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
            result.start.assign(YEAR, date.year());
            result.start.assign(MONTH, date.month() + 1);
            result.start.assign(DAY, date.date());
        } else {
            result.start.imply(YEAR, date.year());
            result.start.imply(MONTH, date.month() + 1);
            result.start.imply(DAY, date.date());
            result.start.assign(HOUR, date.hour());
            result.start.assign(MINUTE, date.minute());
            result.start.assign(SECOND, date.second());
        }

        return result;
    }
}