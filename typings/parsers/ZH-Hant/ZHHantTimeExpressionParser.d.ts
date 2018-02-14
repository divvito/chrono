import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class ZHHantTimeExpressionParser extends Parser {
    private PATTERN;
    private END_PATTERN;
    private DAY_GROUP_1;
    private ZH_AM_PM_HOUR_GROUP_1;
    private ZH_AM_PM_HOUR_GROUP_2;
    private DAY_GROUP_3;
    private ZH_AM_PM_HOUR_GROUP_3;
    private HOUR_GROUP;
    private MINUTE_GROUP;
    private SECOND_GROUP;
    private AM_PM_HOUR_GROUP;
    private TAG;
    private OTHER_PATTERNS;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
    private extractFirstChunk(result, match, refMoment, startMoment);
    private extractSecondChunk(text, result, refMoment, endMoment);
    private getTime(match);
    private getDay(match, current, refMoment, targetMoment);
    private getMeridiem(match, meridiem, hour);
}
