import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {WEEKDAY_OFFSET} from '../../utils/DE';
import * as moment from "moment";
import {Moment} from "moment";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";


export default class DEWeekdayParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:(?:\\,|\\(|\\（)\\s*)?' +
        '(?:a[mn]\\s*?)?' +
        '(?:(diese[mn]|letzte[mn]|n(?:ä|ae)chste[mn])\\s*)?' +
        '(' + Object.keys(WEEKDAY_OFFSET).join('|') + ')' +
        '(?:\\s*(?:\\,|\\)|\\）))?' +
        '(?:\\s*(diese|letzte|n(?:ä|ae)chste)\\s*woche)?' +
        '(?=\\W|$)', 'i');

    private PREFIX_GROUP: number = 2;
    private WEEKDAY_GROUP: number = 3;
    private POSTFIX_GROUP: number = 4;

    private OTHER_PATTERNS: RegExp[] = [
        /letzte/,
        /n(?:ä|ae)chste/,
        /diese/
    ];

    private TAG: string = 'DEWeekdayParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const matchedText: string = match[0].substr(match[1].length, match[0].length - match[1].length);
        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref,
        });

        const offset: number | undefined = WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
        if (offset === undefined) return null;

        const startMoment: Moment = moment(ref);
        const prefix: string = match[this.PREFIX_GROUP];
        const postfix: string = match[this.POSTFIX_GROUP];

        const refOffset: number = startMoment.day();
        const norm: string = (prefix || postfix || '').toLowerCase();
        if (this.OTHER_PATTERNS[0].test(norm)) {
            startMoment.day(offset - 7);
        } else if (this.OTHER_PATTERNS[1].test(norm)) {
            startMoment.day(offset + 7);
        } else if (this.OTHER_PATTERNS[2].test(norm)) {
            if (opt.forwardDate && refOffset > offset) {
                startMoment.day(offset + 7);
            } else {
                startMoment.day(offset);
            }
        } else {
            const calcOffset = offset - refOffset;
            const absOffset = Math.abs(calcOffset);
            if (opt.forwardDate && refOffset > offset) {
                startMoment.day(offset + 7);
            } else if (!opt.forwardDate && Math.abs(calcOffset - 7) < absOffset) {
                startMoment.day(offset - 7);
            } else if (!opt.forwardDate && Math.abs(calcOffset + 7) < absOffset) {
                startMoment.day(offset + 7);
            } else {
                startMoment.day(offset);
            }
        }

        result.tags[this.TAG] = true;
        result.start.assign(WEEKDAY, offset);
        result.start.imply(DAY, startMoment.date());
        result.start.imply(MONTH, startMoment.month() + 1);
        result.start.imply(YEAR, startMoment.year());
        return result;
    }
}