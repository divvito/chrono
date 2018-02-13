import {Config} from "../options";
import {ParseOptions} from "../chrono";
import {ParsedResult} from "../result";

export default abstract class Parser {
    strictMode: boolean;

    constructor(config: Config = {}) {
        this.strictMode = !!config.strict;
    }

    isStrictMode(): boolean {
        return this.strictMode;
    }

    abstract pattern(): RegExp;

    abstract extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;

    execute(text: string, ref: Date, opt: ParseOptions): ParsedResult[] {

        const results: ParsedResult[] = [];
        const regex: RegExp = this.pattern();

        let remainingText: string = text;
        let match: RegExpExecArray | null = regex.exec(remainingText);


        while (match) {
            // Calculate match index on the full text;
            match.index += text.length - remainingText.length;

            let result: ParsedResult | null = this.extract(text, ref, match, opt);
            if (result) {
                // If success, start from the end of the result
                remainingText = text.substring(result.index + result.text.length);

                if (!this.isStrictMode() || result.hasPossibleDates()) {
                    results.push(result);
                }
            } else {
                // If fail, move on by 1 - This should rarely, if ever happen (we matched but couldn't create a result from it)
                remainingText = text.substring(match.index + 1);
            }

            match = regex.exec(remainingText);
        }

        return results;
    }
}

export {default as ENISOFormatParser} from './EN/ENISOFormatParser';
export {default as ENDeadlineFormatParser} from './EN/ENDeadlineFormatParser';
export {default as ENRelativeDateFormatParser} from './EN/ENRelativeDateFormatParser';
export {default as ENMonthNameLittleEndianParser} from './EN/ENMonthNameLittleEndianParser';
export {default as ENMonthNameMiddleEndianParser} from './EN/ENMonthNameMiddleEndianParser';
export {default as ENMonthNameParser} from './EN/ENMonthNameParser';
export {default as ENSlashDateFormatParser} from './EN/ENSlashDateFormatParser';
export {default as ENSlashDateFormatStartWithYearParser} from './EN/ENSlashDateFormatStartWithYearParser';
export {default as ENSlashMonthFormatParser} from './EN/ENSlashMonthFormatParser';
export {default as ENTimeAgoFormatParser} from './EN/ENTimeAgoFormatParser';
export {default as ENTimeExpressionParser} from './EN/ENTimeExpressionParser';
export {default as ENTimeLaterFormatParser} from './EN/ENTimeLaterFormatParser';
export {default as ENWeekdayParser} from './EN/ENWeekdayParser';
export {default as ENCasualDateParser} from './EN/ENCasualDateParser';
export {default as ENCasualTimeParser} from './EN/ENCasualTimeParser';

export {default as JPStandardParser} from './JP/JPStandardParser';
export {default as JPCasualDateParser} from './JP/JPCasualDateParser';

export {default as ESCasualDateParser} from './ES/ESCasualDateParser';
export {default as ESDeadlineFormatParser} from './ES/ESDeadlineFormatParser';
export {default as ESTimeAgoFormatParser} from './ES/ESTimeAgoFormatParser';
export {default as ESTimeExpressionParser} from './ES/ESTimeExpressionParser';
export {default as ESWeekdayParser} from './ES/ESWeekdayParser';
export {default as ESMonthNameLittleEndianParser} from './ES/ESMonthNameLittleEndianParser';
export {default as ESSlashDateFormatParser} from './ES/ESSlashDateFormatParser';

export {default as FRCasualDateParser} from './FR/FRCasualDateParser';
export {default as FRDeadlineFormatParser} from './FR/FRDeadlineFormatParser';
export {default as FRMonthNameLittleEndianParser} from './FR/FRMonthNameLittleEndianParser';
export {default as FRSlashDateFormatParser} from './FR/FRSlashDateFormatParser';
export {default as FRTimeAgoFormatParser} from './FR/FRTimeAgoFormatParser';
export {default as FRTimeExpressionParser} from './FR/FRTimeExpressionParser';
export {default as FRWeekdayParser} from './FR/FRWeekdayParser';
export {default as FRRelativeDateFormatParser} from './FR/FRRelativeDateFormatParser';

export {default as ZHHantDateParser} from './ZH-Hant/ZHHantDateParser';
export {default as ZHHantWeekdayParser} from './ZH-Hant/ZHHantWeekdayParser';
export {default as ZHHantTimeExpressionParser} from './ZH-Hant/ZHHantTimeExpressionParser';
export {default as ZHHantCasualDateParser} from './ZH-Hant/ZHHantCasualDateParser';
export {default as ZHHantDeadlineFormatParser} from './ZH-Hant/ZHHantDeadlineFormatParser';

export {default as DEDeadlineFormatParser} from './DE/DEDeadlineFormatParser';
export {default as DEMonthNameLittleEndianParser} from './DE/DEMonthNameLittleEndianParser';
export {default as DEMonthNameParser} from './DE/DEMonthNameParser';
export {default as DESlashDateFormatParser} from './DE/DESlashDateFormatParser';
export {default as DETimeAgoFormatParser} from './DE/DETimeAgoFormatParser';
export {default as DETimeExpressionParser} from './DE/DETimeExpressionParser';
export {default as DEWeekdayParser} from './DE/DEWeekdayParser';
export {default as DECasualDateParser} from './DE/DECasualDateParser';
