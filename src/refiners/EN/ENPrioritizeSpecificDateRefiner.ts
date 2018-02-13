import Refiner from '../refiner';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, YEAR} from "../../constants";

export default class ENPrioritizeSpecificDateRefiner extends Refiner {
    private TAG: string = 'ENPrioritizeSpecificDateRefiner';
    private PATTERN: RegExp = new RegExp("^\\s*(at|after|before|on|,|-|\\(|\\))?\\s*$");

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

            if (this.isMoreSpecific(prevResult, currResult) && this.isAbleToMerge(text, prevResult, currResult)) {

                prevResult = this.mergeResult(text, prevResult, currResult);
                currResult = null;
                i += 1;

            } else if (this.isMoreSpecific(currResult, prevResult) && this.isAbleToMerge(text, prevResult, currResult)) {

                prevResult = this.mergeResult(text, currResult, prevResult);
                currResult = null;
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

    // noinspection JSMethodCanBeStatic
    private isMoreSpecific(prevResult: ParsedResult, currResult: ParsedResult): boolean {
        if (prevResult.start.isCertain(YEAR)) {
            if (!currResult.start.isCertain(YEAR)) {
                return true
            } else {
                if (prevResult.start.isCertain(MONTH)) {
                    if (!currResult.start.isCertain(MONTH)) {
                        return true
                    } else {
                        if (prevResult.start.isCertain(DAY) && !currResult.start.isCertain(DAY)) {
                            return true
                        }
                    }
                }
            }
        }

        return false
    }

    private isAbleToMerge(text: string, prevResult: ParsedResult, currResult: ParsedResult): boolean {
        const textBetween: string = text.substring(prevResult.index + prevResult.text.length, currResult.index);

        // Only accepts merge if one of them comes from casual relative date
        const includesRelativeResult: boolean = (prevResult.tags['ENRelativeDateFormatParser'] || currResult.tags['ENRelativeDateFormatParser']);

        // We assume they refer to the same date if all date fields are implied
        let referToSameDate: boolean = !prevResult.start.isCertain(DAY) && !prevResult.start.isCertain(MONTH) && !prevResult.start.isCertain(YEAR);

        // If both years are certain, that determines if they refer to the same date
        // but with one more specific than the other
        if (prevResult.start.isCertain(YEAR) && currResult.start.isCertain(YEAR))
            referToSameDate = (prevResult.start.get(YEAR) === currResult.start.get(YEAR));

        // We now test with the next level (month) if they refer to the same date
        if (prevResult.start.isCertain(MONTH) && currResult.start.isCertain(MONTH))
            referToSameDate = (prevResult.start.get(MONTH) === currResult.start.get(MONTH)) && referToSameDate;

        return includesRelativeResult && !!textBetween.match(this.PATTERN) && referToSameDate;
    }

    private mergeResult(text: string, specificResult: ParsedResult, nonSpecificResult: ParsedResult) {
        const startIndex: number = Math.min(specificResult.index, nonSpecificResult.index);
        const endIndex: number = Math.max(
            specificResult.index + specificResult.text.length,
            nonSpecificResult.index + nonSpecificResult.text.length);

        specificResult.index = startIndex;
        specificResult.text = text.substring(startIndex, endIndex);

        Object.keys(nonSpecificResult.tags).forEach((tag) => specificResult.tags[tag] = true);
        specificResult.tags[this.TAG] = true;

        return specificResult;
    }
}