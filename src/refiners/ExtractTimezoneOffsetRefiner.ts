import Refiner from './refiner';
import {ParsedResult} from "../result";
import {ParseOptions} from "../chrono";
import {TIMEZONE_OFFSET} from "../constants";

export default class ExtractTimezoneOffsetRefiner extends Refiner {
    private TAG = 'ExtractTimezoneOffsetRefiner';
    private TIMEZONE_OFFSET_PATTERN: RegExp = new RegExp("^\\s*(GMT|UTC)?(\\+|\\-)(\\d{1,2}):?(\\d{2})", 'i');

    private TIMEZONE_OFFSET_SIGN_GROUP: number = 2;
    private TIMEZONE_OFFSET_HOUR_OFFSET_GROUP: number = 3;
    private TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP: number = 4;

    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
        results.forEach((result: ParsedResult) => {
            if (result.start.isCertain(TIMEZONE_OFFSET)) {
                return;
            }

            const match: RegExpExecArray | null = this.TIMEZONE_OFFSET_PATTERN.exec(text.substring(result.index + result.text.length));
            if (!match) {
                return;
            }

            const hourOffset: number = parseInt(match[this.TIMEZONE_OFFSET_HOUR_OFFSET_GROUP], 10);
            const minuteOffset: number = parseInt(match[this.TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP], 10);
            let timezoneOffset: number = hourOffset * 60 + minuteOffset;

            if (match[this.TIMEZONE_OFFSET_SIGN_GROUP] === '-') {
                timezoneOffset = -timezoneOffset;
            }

            if (result.end != null) {
                result.end.assign(TIMEZONE_OFFSET, timezoneOffset);
            }

            result.start.assign(TIMEZONE_OFFSET, timezoneOffset);

            result.text += match[0];

            result.tags[this.TAG] = true;
        });

        return results;
    }
}
