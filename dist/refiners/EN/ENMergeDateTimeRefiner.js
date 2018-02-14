"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("../refiner");
const constants_1 = require("../../constants");
class MergeDateTimeRefiner extends refiner_1.default {
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
            if (MergeDateTimeRefiner.isDateOnly(prevResult) && MergeDateTimeRefiner.isTimeOnly(currResult)
                && this.isAbleToMerge(text, prevResult, currResult)) {
                prevResult = this.mergeResult(text, prevResult, currResult);
                currResult = results[i + 1] || null;
                i += 1;
            }
            else if (MergeDateTimeRefiner.isDateOnly(currResult) && MergeDateTimeRefiner.isTimeOnly(prevResult)
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
    isAbleToMerge(text, result1, result2) {
        return !!text.substring(result1.index + result1.text.length, result2.index).match(this.PATTERN);
    }
    ;
    mergeResult(text, dateResult, timeResult) {
        const beginDate = dateResult.start;
        const beginTime = timeResult.start;
        const beginDateTime = MergeDateTimeRefiner.mergeDateTimeValues(beginDate, beginTime);
        if (dateResult.end || timeResult.end) {
            const endDate = dateResult.end ? dateResult.end : dateResult.start;
            const endTime = timeResult.end ? timeResult.end : timeResult.start;
            const endDateTime = MergeDateTimeRefiner.mergeDateTimeValues(endDate, endTime);
            if (!dateResult.end && endDateTime.date().getTime() < beginDateTime.date().getTime()) {
                // Ex. 9pm - 1am
                if (endDateTime.isCertain(constants_1.DAY)) {
                    endDateTime.assign(constants_1.DAY, endDateTime.get(constants_1.DAY) + 1);
                }
                else {
                    endDateTime.imply(constants_1.DAY, endDateTime.get(constants_1.DAY) + 1);
                }
            }
            dateResult.end = endDateTime;
        }
        dateResult.start = beginDateTime;
        const startIndex = Math.min(dateResult.index, timeResult.index);
        const endIndex = Math.max(dateResult.index + dateResult.text.length, timeResult.index + timeResult.text.length);
        dateResult.index = startIndex;
        dateResult.text = text.substring(startIndex, endIndex);
        Object.keys(timeResult.tags).forEach((tag) => dateResult.tags[tag] = true);
        dateResult.tags[this.TAG] = true;
        return dateResult;
    }
    static isDateOnly(result) {
        return !result.start.isCertain(constants_1.HOUR);
    }
    static isTimeOnly(result) {
        return !result.start.isCertain(constants_1.MONTH) && !result.start.isCertain(constants_1.WEEKDAY);
    }
    static mergeDateTimeValues(dateComponent, timeComponent) {
        const dateTimeComponent = dateComponent.clone();
        if (timeComponent.isCertain(constants_1.HOUR)) {
            dateTimeComponent.assign(constants_1.HOUR, timeComponent.get(constants_1.HOUR));
            dateTimeComponent.assign(constants_1.MINUTE, timeComponent.get(constants_1.MINUTE));
            if (timeComponent.isCertain(constants_1.SECOND)) {
                dateTimeComponent.assign(constants_1.SECOND, timeComponent.get(constants_1.SECOND));
                if (timeComponent.isCertain(constants_1.MILLISECOND)) {
                    dateTimeComponent.assign(constants_1.MILLISECOND, timeComponent.get(constants_1.MILLISECOND));
                }
                else {
                    dateTimeComponent.imply(constants_1.MILLISECOND, timeComponent.get(constants_1.MILLISECOND));
                }
            }
            else {
                dateTimeComponent.imply(constants_1.SECOND, timeComponent.get(constants_1.SECOND));
                dateTimeComponent.imply(constants_1.MILLISECOND, timeComponent.get(constants_1.MILLISECOND));
            }
        }
        else {
            dateTimeComponent.imply(constants_1.HOUR, timeComponent.get(constants_1.HOUR));
            dateTimeComponent.imply(constants_1.MINUTE, timeComponent.get(constants_1.MINUTE));
            dateTimeComponent.imply(constants_1.SECOND, timeComponent.get(constants_1.SECOND));
            dateTimeComponent.imply(constants_1.MILLISECOND, timeComponent.get(constants_1.MILLISECOND));
        }
        if (timeComponent.isCertain(constants_1.MERIDIEM)) {
            dateTimeComponent.assign(constants_1.MERIDIEM, timeComponent.get(constants_1.MERIDIEM));
        }
        else if (timeComponent.get(constants_1.MERIDIEM, -1) !== -1 &&
            dateTimeComponent.get(constants_1.MERIDIEM, -1) === -1) {
            dateTimeComponent.imply(constants_1.MERIDIEM, timeComponent.get(constants_1.MERIDIEM));
        }
        if (dateTimeComponent.get(constants_1.MERIDIEM) === 1 && dateTimeComponent.get(constants_1.HOUR) < 12) {
            if (timeComponent.isCertain(constants_1.HOUR)) {
                dateTimeComponent.assign(constants_1.HOUR, dateTimeComponent.get(constants_1.HOUR) + 12);
            }
            else {
                dateTimeComponent.imply(constants_1.HOUR, dateTimeComponent.get(constants_1.HOUR) + 12);
            }
        }
        return dateTimeComponent;
    }
}
exports.MergeDateTimeRefiner = MergeDateTimeRefiner;
class ENMergeDateTimeRefiner extends MergeDateTimeRefiner {
    constructor() {
        super(...arguments);
        this.TAG = 'ENMergeDateTimeRefiner';
        this.PATTERN = new RegExp("^\\s*(T|at|after|before|on|of|,|-)?\\s*$");
    }
}
exports.default = ENMergeDateTimeRefiner;
