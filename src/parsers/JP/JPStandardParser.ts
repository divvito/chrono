import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, YEAR} from "../../constants";
import {toHankaku} from "../../utils/JP";
import {getAppropriateYear} from "../../utils/general";

export default class JPStandardParser extends Parser {
    private PATTERN: RegExp = /(?:(同|((昭和|平成)?([0-9０-９]{2,4})))年\s*)?([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;

    private YEAR_GROUP: number = 2;
    private ERA_GROUP: number = 3;
    private YEAR_NUMBER_GROUP: number = 4;
    private MONTH_GROUP: number = 5;
    private DAY_GROUP: number = 6;

    private OTHER_PATTERNS: RegExp[] = [
        /同年/
    ];

    private TAG: string = 'JPStandardParser';

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
        const startMoment: Moment = moment(ref);

        const month: number = parseInt(toHankaku(match[this.MONTH_GROUP]), 10);
        const day: number = parseInt(toHankaku(match[this.DAY_GROUP]), 10);

        startMoment.set('date', day);
        startMoment.set('month', month - 1);
        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);

        const matchedYear: string = match[this.YEAR_GROUP] || '';

        if (matchedYear.match(this.OTHER_PATTERNS[0])) {
            result.start.assign(YEAR, startMoment.year());
        } else if (matchedYear) {
            let year: number = parseInt(toHankaku(match[this.YEAR_NUMBER_GROUP]), 10);
            if (match[this.ERA_GROUP] === '平成') {
                year += 1988;
            } else if (match[this.ERA_GROUP] === '昭和') {
                year += 1925;
            }

            result.start.assign(YEAR, year);
        } else {
            getAppropriateYear(result.start, ref);
        }

        return result;
    }
}
