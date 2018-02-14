"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    Enforce 'forwardDate' option to on the results. When there are missing component,
    e.g. "March 12-13 (without year)" or "Thursday", the refiner will try to adjust the result
    into the future instead of the past.
*/
const refiner_1 = require("./refiner");
const constants_1 = require("../constants");
const moment = require("moment");
class ForwardDateRefiner extends refiner_1.default {
    constructor() {
        super(...arguments);
        this.TAG = 'ForwardDateRefiner';
    }
    refine(text, results, opt) {
        if (!opt.forwardDate) {
            return results;
        }
        results.forEach((result) => {
            const refMoment = moment(result.ref);
            // day and month are certain, but not year
            if (result.start.isCertain(constants_1.DAY) && result.start.isCertain(constants_1.MONTH) && !result.start.isCertain(constants_1.YEAR) && refMoment.isAfter(result.start.moment())) {
                // Adjust year into the future
                for (let i = 0; i < 3 && refMoment.isAfter(result.start.moment()); i++) {
                    result.start.imply(constants_1.YEAR, result.start.get(constants_1.YEAR) + 1);
                    if (result.end && !result.end.isCertain(constants_1.YEAR)) {
                        result.end.imply(constants_1.YEAR, result.end.get(constants_1.YEAR) + 1);
                    }
                }
                result.tags[this.TAG] = true;
            }
            // date is uncertain, but weekday is known
            if (!result.start.isCertain(constants_1.DAY) && !result.start.isCertain(constants_1.MONTH) && !result.start.isCertain(constants_1.YEAR) && result.start.isCertain(constants_1.WEEKDAY) && refMoment.isAfter(result.start.moment())) {
                // Adjust date to the coming week
                if (refMoment.day() > result.start.get(constants_1.WEEKDAY)) {
                    refMoment.day(result.start.get(constants_1.WEEKDAY) + 7);
                }
                else {
                    refMoment.day(result.start.get(constants_1.WEEKDAY));
                }
                result.start.imply(constants_1.DAY, refMoment.date());
                result.start.imply(constants_1.MONTH, refMoment.month() + 1);
                result.start.imply(constants_1.YEAR, refMoment.year());
                result.tags[this.TAG] = true;
            }
        });
        return results;
    }
}
exports.default = ForwardDateRefiner;
