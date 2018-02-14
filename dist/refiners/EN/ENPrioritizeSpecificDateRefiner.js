"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("../refiner");
const constants_1 = require("../../constants");
class ENPrioritizeSpecificDateRefiner extends refiner_1.default {
    constructor() {
        super(...arguments);
        this.TAG = 'ENPrioritizeSpecificDateRefiner';
        this.PATTERN = new RegExp("^\\s*(at|after|before|on|,|-|\\(|\\))?\\s*$");
    }
    refine(text, results, opt) {
        if (results.length < 2) {
            return results;
        }
        const mergedResult = [];
        let currResult = null;
        let prevResult = null;
        for (let i = 1; i < results.length; i++) {
            currResult = results[i];
            prevResult = results[i - 1];
            if (this.isMoreSpecific(prevResult, currResult) && this.isAbleToMerge(text, prevResult, currResult)) {
                prevResult = this.mergeResult(text, prevResult, currResult);
                currResult = null;
                i += 1;
            }
            else if (this.isMoreSpecific(currResult, prevResult) && this.isAbleToMerge(text, prevResult, currResult)) {
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
    isMoreSpecific(prevResult, currResult) {
        if (prevResult.start.isCertain(constants_1.YEAR)) {
            if (!currResult.start.isCertain(constants_1.YEAR)) {
                return true;
            }
            else {
                if (prevResult.start.isCertain(constants_1.MONTH)) {
                    if (!currResult.start.isCertain(constants_1.MONTH)) {
                        return true;
                    }
                    else {
                        if (prevResult.start.isCertain(constants_1.DAY) && !currResult.start.isCertain(constants_1.DAY)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    isAbleToMerge(text, prevResult, currResult) {
        const textBetween = text.substring(prevResult.index + prevResult.text.length, currResult.index);
        // Only accepts merge if one of them comes from casual relative date
        const includesRelativeResult = (prevResult.tags['ENRelativeDateFormatParser'] || currResult.tags['ENRelativeDateFormatParser']);
        // We assume they refer to the same date if all date fields are implied
        let referToSameDate = !prevResult.start.isCertain(constants_1.DAY) && !prevResult.start.isCertain(constants_1.MONTH) && !prevResult.start.isCertain(constants_1.YEAR);
        // If both years are certain, that determines if they refer to the same date
        // but with one more specific than the other
        if (prevResult.start.isCertain(constants_1.YEAR) && currResult.start.isCertain(constants_1.YEAR))
            referToSameDate = (prevResult.start.get(constants_1.YEAR) === currResult.start.get(constants_1.YEAR));
        // We now test with the next level (month) if they refer to the same date
        if (prevResult.start.isCertain(constants_1.MONTH) && currResult.start.isCertain(constants_1.MONTH))
            referToSameDate = (prevResult.start.get(constants_1.MONTH) === currResult.start.get(constants_1.MONTH)) && referToSameDate;
        return includesRelativeResult && !!textBetween.match(this.PATTERN) && referToSameDate;
    }
    mergeResult(text, specificResult, nonSpecificResult) {
        const startIndex = Math.min(specificResult.index, nonSpecificResult.index);
        const endIndex = Math.max(specificResult.index + specificResult.text.length, nonSpecificResult.index + nonSpecificResult.text.length);
        specificResult.index = startIndex;
        specificResult.text = text.substring(startIndex, endIndex);
        Object.keys(nonSpecificResult.tags).forEach((tag) => specificResult.tags[tag] = true);
        specificResult.tags[this.TAG] = true;
        return specificResult;
    }
}
exports.default = ENPrioritizeSpecificDateRefiner;
