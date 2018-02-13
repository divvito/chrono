import Refiner from '../refiner';
import {COMPONENT_NAME, ParsedComponents, ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {Moment} from "moment";

export abstract class MergeDateRangeRefiner extends Refiner {
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

            if (!prevResult.end && !currResult.end && this.isAbleToMerge(text, prevResult, currResult)) {
                prevResult = this.mergeResult(text, prevResult, currResult);
                currResult = null;
                i += 1;
            }

            mergedResult.push(prevResult);
        }

        if (currResult != null) {
            mergedResult.push(currResult);
        }


        return mergedResult;
    }

    private isAbleToMerge(text: string, result1: ParsedResult, result2: ParsedResult): boolean {
        return !!text.substring(result1.index + result1.text.length, result2.index).match(this.PATTERN);
    };

    // noinspection JSMethodCanBeStatic
    private isWeekdayResult(result: ParsedResult): boolean {
        return result.start.isCertain(WEEKDAY) && !result.start.isCertain(DAY);
    }

    private mergeResult(text: string, fromResult: ParsedResult, toResult: ParsedResult) {
        if (!this.isWeekdayResult(fromResult) && !this.isWeekdayResult(toResult)) {
            this.mergeValues(toResult.start, fromResult.start);
            this.mergeValues(fromResult.start, toResult.start);
        }

        if (fromResult.start.date().getTime() > toResult.start.date().getTime()) {

            const fromMoment: Moment = fromResult.start.moment();
            const toMoment: Moment = toResult.start.moment();

            if (this.isWeekdayResult(fromResult) && fromMoment.clone().add(-7, 'days').isBefore(toMoment)) {
                fromMoment.add(-7, 'days');
                fromResult.start.imply(DAY, fromMoment.date());
                fromResult.start.imply(MONTH, fromMoment.month() + 1);
                fromResult.start.imply(YEAR, fromMoment.year());
            } else if (this.isWeekdayResult(toResult) && toMoment.clone().add(7, 'days').isAfter(fromMoment)) {
                toMoment.add(7, 'days');
                toResult.start.imply(DAY, toMoment.date());
                toResult.start.imply(MONTH, toMoment.month() + 1);
                toResult.start.imply(YEAR, toMoment.year());
            } else {
                [toResult, fromResult] = [fromResult, toResult];
            }
        }

        fromResult.end = toResult.start;

        Object.keys(toResult.tags).forEach((tag) => fromResult.tags[tag] = true);

        const startIndex: number = Math.min(fromResult.index, toResult.index);
        const endIndex: number = Math.max(
            fromResult.index + fromResult.text.length,
            toResult.index + toResult.text.length);

        fromResult.index = startIndex;
        fromResult.text = text.substring(startIndex, endIndex);
        fromResult.tags[this.TAG] = true;
        return fromResult;
    }

    private mergeValues(from: ParsedComponents, to: ParsedComponents) {
        (Object.keys(from.knownValues) as COMPONENT_NAME[]).forEach((key: COMPONENT_NAME) => {
            if (!to.isCertain(key)) {
                to.assign(key, from.get(key));
            }
        });
    }
}

export default class ENMergeDateRangeRefiner extends MergeDateRangeRefiner {
    TAG = 'ENMergeDateRangeRefiner';
    PATTERN = /^\s*(to|-|ー)\s*$/i;
}