"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("../refiner");
const constants_1 = require("../../constants");
class MergeDateRangeRefiner extends refiner_1.default {
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
    isAbleToMerge(text, result1, result2) {
        return !!text.substring(result1.index + result1.text.length, result2.index).match(this.PATTERN);
    }
    ;
    // noinspection JSMethodCanBeStatic
    isWeekdayResult(result) {
        return result.start.isCertain(constants_1.WEEKDAY) && !result.start.isCertain(constants_1.DAY);
    }
    mergeResult(text, fromResult, toResult) {
        if (!this.isWeekdayResult(fromResult) && !this.isWeekdayResult(toResult)) {
            this.mergeValues(toResult.start, fromResult.start);
            this.mergeValues(fromResult.start, toResult.start);
        }
        if (fromResult.start.date().getTime() > toResult.start.date().getTime()) {
            const fromMoment = fromResult.start.moment();
            const toMoment = toResult.start.moment();
            if (this.isWeekdayResult(fromResult) && fromMoment.clone().add(-7, 'days').isBefore(toMoment)) {
                fromMoment.add(-7, 'days');
                fromResult.start.imply(constants_1.DAY, fromMoment.date());
                fromResult.start.imply(constants_1.MONTH, fromMoment.month() + 1);
                fromResult.start.imply(constants_1.YEAR, fromMoment.year());
            }
            else if (this.isWeekdayResult(toResult) && toMoment.clone().add(7, 'days').isAfter(fromMoment)) {
                toMoment.add(7, 'days');
                toResult.start.imply(constants_1.DAY, toMoment.date());
                toResult.start.imply(constants_1.MONTH, toMoment.month() + 1);
                toResult.start.imply(constants_1.YEAR, toMoment.year());
            }
            else {
                [toResult, fromResult] = [fromResult, toResult];
            }
        }
        fromResult.end = toResult.start;
        Object.keys(toResult.tags).forEach((tag) => fromResult.tags[tag] = true);
        const startIndex = Math.min(fromResult.index, toResult.index);
        const endIndex = Math.max(fromResult.index + fromResult.text.length, toResult.index + toResult.text.length);
        fromResult.index = startIndex;
        fromResult.text = text.substring(startIndex, endIndex);
        fromResult.tags[this.TAG] = true;
        return fromResult;
    }
    mergeValues(from, to) {
        Object.keys(from.knownValues).forEach((key) => {
            if (!to.isCertain(key)) {
                to.assign(key, from.get(key));
            }
        });
    }
}
exports.MergeDateRangeRefiner = MergeDateRangeRefiner;
class ENMergeDateRangeRefiner extends MergeDateRangeRefiner {
    constructor() {
        super(...arguments);
        this.TAG = 'ENMergeDateRangeRefiner';
        this.PATTERN = /^\s*(to|-|ー)\s*$/i;
    }
}
exports.default = ENMergeDateRangeRefiner;
