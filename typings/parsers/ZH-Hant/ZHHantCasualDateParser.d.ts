import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ZHHantCasualDateParser extends Parser {
    private PATTERN;
    private NOW_GROUP;
    private DAY_GROUP_1;
    private TIME_GROUP_1;
    private TIME_GROUP_2;
    private DAY_GROUP_3;
    private TIME_GROUP_3;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
