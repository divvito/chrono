import Refiner from '../refiner';
import {ParsedComponents, ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, WEEKDAY} from "../../constants";

export abstract class MergeDateTimeRefiner extends Refiner {
    abstract TAG: string;
    abstract PATTERN: RegExp;

    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
        if (results.length < 2) {
            return results;
        }

        const mergedResult: ParsedResult[] = [];
        let currResult: ParsedResult | null = null;
        let prevResult: ParsedResult | null = null;

        for (let i = 1; i < results.length; i++) {

            currResult = results[i];
            prevResult = results[i - 1];

            if (MergeDateTimeRefiner.isDateOnly(prevResult) && MergeDateTimeRefiner.isTimeOnly(currResult)
                && this.isAbleToMerge(text, prevResult, currResult)) {

                prevResult = this.mergeResult(text, prevResult, currResult);
                currResult = results[i + 1] || null;
                i += 1;

            } else if (MergeDateTimeRefiner.isDateOnly(currResult) && MergeDateTimeRefiner.isTimeOnly(prevResult)
                && this.isAbleToMerge(text, prevResult, currResult)) {

                prevResult = this.mergeResult(text, currResult, prevResult);
                currResult = results[i + 1] || null;
                i += 1;
            }

            if (prevResult) {
                mergedResult.push(prevResult);
            }
        }

        if (currResult !== null) {
            mergedResult.push(currResult);
        }

        return mergedResult;
    }

    private isAbleToMerge(text: string, result1: ParsedResult, result2: ParsedResult): boolean {
        return !!text.substring(result1.index + result1.text.length, result2.index).match(this.PATTERN);
    };

    private mergeResult(text: string, dateResult: ParsedResult, timeResult: ParsedResult): ParsedResult {
        const beginDate: ParsedComponents = dateResult.start;
        const beginTime: ParsedComponents = timeResult.start;
        const beginDateTime: ParsedComponents = MergeDateTimeRefiner.mergeDateTimeValues(beginDate, beginTime);

        if (dateResult.end || timeResult.end) {
            const endDate: ParsedComponents = dateResult.end ? dateResult.end : dateResult.start;
            const endTime: ParsedComponents = timeResult.end ? timeResult.end : timeResult.start;
            const endDateTime: ParsedComponents = MergeDateTimeRefiner.mergeDateTimeValues(endDate, endTime);

            if (!dateResult.end && endDateTime.date().getTime() < beginDateTime.date().getTime()) {
                // Ex. 9pm - 1am
                if (endDateTime.isCertain(DAY)) {
                    endDateTime.assign(DAY, endDateTime.get(DAY) + 1);
                } else {
                    endDateTime.imply(DAY, endDateTime.get(DAY) + 1);
                }
            }

            dateResult.end = endDateTime;
        }

        dateResult.start = beginDateTime;

        const startIndex: number = Math.min(dateResult.index, timeResult.index);
        const endIndex: number = Math.max(
            dateResult.index + dateResult.text.length,
            timeResult.index + timeResult.text.length);

        dateResult.index = startIndex;
        dateResult.text = text.substring(startIndex, endIndex);

        Object.keys(timeResult.tags).forEach((tag) => dateResult.tags[tag] = true);
        dateResult.tags[this.TAG] = true;

        return dateResult;
    }

    static isDateOnly(result: ParsedResult): boolean {
        return !result.start.isCertain(HOUR);
    }

    static isTimeOnly(result: ParsedResult): boolean {
        return !result.start.isCertain(MONTH) && !result.start.isCertain(WEEKDAY);
    }

    static mergeDateTimeValues(dateComponent: ParsedComponents, timeComponent: ParsedComponents): ParsedComponents {
        const dateTimeComponent: ParsedComponents = dateComponent.clone();

        if (timeComponent.isCertain(HOUR)) {
            dateTimeComponent.assign(HOUR, timeComponent.get(HOUR));
            dateTimeComponent.assign(MINUTE, timeComponent.get(MINUTE));

            if (timeComponent.isCertain(SECOND)) {
                dateTimeComponent.assign(SECOND, timeComponent.get(SECOND));

                if (timeComponent.isCertain(MILLISECOND)) {
                    dateTimeComponent.assign(MILLISECOND, timeComponent.get(MILLISECOND));
                } else {
                    dateTimeComponent.imply(MILLISECOND, timeComponent.get(MILLISECOND));
                }
            } else {
                dateTimeComponent.imply(SECOND, timeComponent.get(SECOND));
                dateTimeComponent.imply(MILLISECOND, timeComponent.get(MILLISECOND));
            }

        } else {
            dateTimeComponent.imply(HOUR, timeComponent.get(HOUR));
            dateTimeComponent.imply(MINUTE, timeComponent.get(MINUTE));
            dateTimeComponent.imply(SECOND, timeComponent.get(SECOND));
            dateTimeComponent.imply(MILLISECOND, timeComponent.get(MILLISECOND));
        }

        if (timeComponent.isCertain(MERIDIEM)) {
            dateTimeComponent.assign(MERIDIEM, timeComponent.get(MERIDIEM));
        } else if (
            timeComponent.get(MERIDIEM, -1) !== -1 &&
            dateTimeComponent.get(MERIDIEM, -1) === -1
        ) {
            dateTimeComponent.imply(MERIDIEM, timeComponent.get(MERIDIEM));
        }

        if (dateTimeComponent.get(MERIDIEM) === 1 && dateTimeComponent.get(HOUR) < 12) {
            if (timeComponent.isCertain(HOUR)) {
                dateTimeComponent.assign(HOUR, dateTimeComponent.get(HOUR) + 12);
            } else {
                dateTimeComponent.imply(HOUR, dateTimeComponent.get(HOUR) + 12);
            }
        }

        return dateTimeComponent;
    }
}

export default class ENMergeDateTimeRefiner extends MergeDateTimeRefiner {
    TAG: string = 'ENMergeDateTimeRefiner';
    PATTERN: RegExp = new RegExp("^\\s*(T|at|after|before|on|of|,|-)?\\s*$");
}