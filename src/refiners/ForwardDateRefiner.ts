/*
    Enforce 'forwardDate' option to on the results. When there are missing component,
    e.g. "March 12-13 (without year)" or "Thursday", the refiner will try to adjust the result
    into the future instead of the past.
*/
import Refiner from './refiner';
import {ParsedResult} from "../result";
import {ParseOptions} from "../chrono";
import {DAY, MONTH, WEEKDAY, YEAR} from "../constants";
import * as moment from "moment";
import {Moment} from "moment";

export default class ForwardDateRefiner extends Refiner {
    private TAG = 'ForwardDateRefiner';

    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
        if (!opt.forwardDate) {
            return results;
        }

        results.forEach((result: ParsedResult) => {
            const refMoment: Moment = moment(result.ref);


            // day and month are certain, but not year
            if (result.start.isCertain(DAY) && result.start.isCertain(MONTH) && !result.start.isCertain(YEAR) && refMoment.isAfter(result.start.moment())) {
                // Adjust year into the future
                for (let i = 0; i < 3 && refMoment.isAfter(result.start.moment()); i++) {
                    result.start.imply(YEAR, result.start.get(YEAR) + 1);

                    if (result.end && !result.end.isCertain(YEAR)) {
                        result.end.imply(YEAR, result.end.get(YEAR) + 1);
                    }
                }
                result.tags[this.TAG] = true;
            }

            // date is uncertain, but weekday is known
            if (!result.start.isCertain(DAY) && !result.start.isCertain(MONTH) && !result.start.isCertain(YEAR) && result.start.isCertain(WEEKDAY) && refMoment.isAfter(result.start.moment())) {
                // Adjust date to the coming week
                if (refMoment.day() > result.start.get(WEEKDAY)) {
                    refMoment.day(result.start.get(WEEKDAY) + 7);
                } else {
                    refMoment.day(result.start.get(WEEKDAY));
                }

                result.start.imply(DAY, refMoment.date());
                result.start.imply(MONTH, refMoment.month() + 1);
                result.start.imply(YEAR, refMoment.year());

                result.tags[this.TAG] = true;
            }
        });

        return results;
    }
}