"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const constants_1 = require("../constants");
exports.getAppropriateYear = (current, ref) => {
    const day = current.get(constants_1.DAY, -1);
    const month = current.get(constants_1.MONTH, -1);
    if (day !== -1 && month !== -1) {
        //Find the most appropriated year
        const refMoment = moment(ref);
        const refMomentClone = refMoment.clone();
        refMoment.month(month - 1);
        refMoment.date(day);
        const nextYear = refMoment.clone().add(1, 'y');
        const lastYear = refMoment.clone().add(-1, 'y');
        const diff = Math.abs(refMoment.diff(refMomentClone));
        if (Math.abs(nextYear.diff(refMomentClone)) < diff) {
            current.imply(constants_1.YEAR, nextYear.year());
        }
        else if (Math.abs(lastYear.diff(refMomentClone)) < diff) {
            current.imply(constants_1.YEAR, lastYear.year());
        }
        else {
            current.imply(constants_1.YEAR, refMoment.year());
        }
    }
};
var DeadlineMode;
(function (DeadlineMode) {
    DeadlineMode[DeadlineMode["TIME"] = 0] = "TIME";
    DeadlineMode[DeadlineMode["DATE"] = 1] = "DATE";
    DeadlineMode[DeadlineMode["NONE"] = 2] = "NONE";
})(DeadlineMode || (DeadlineMode = {}));
exports.deadlineCalculations = (num, unit, result, momentRef) => {
    let mode = DeadlineMode.NONE;
    switch (unit) {
        case constants_1.HOUR:
            momentRef.add(num, 'hour');
            mode = DeadlineMode.TIME;
            break;
        case constants_1.MINUTE:
            momentRef.add(num, 'minute');
            mode = DeadlineMode.TIME;
            break;
        case constants_1.SECOND:
            momentRef.add(num, 'second');
            mode = DeadlineMode.TIME;
            break;
        case constants_1.DAY:
            momentRef.add(num, 'd');
            mode = DeadlineMode.DATE;
            break;
        case constants_1.MONTH:
            momentRef.add(num, 'month');
            mode = DeadlineMode.DATE;
            break;
        case constants_1.YEAR:
            momentRef.add(num, 'year');
            mode = DeadlineMode.DATE;
            break;
        case constants_1.WEEK:
            momentRef.add(num * 7, 'd');
            mode = DeadlineMode.DATE;
            break;
    }
    if (mode !== DeadlineMode.NONE) {
        switch (mode) {
            case DeadlineMode.DATE:
                result.start.assign(constants_1.YEAR, momentRef.year());
                result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                result.start.assign(constants_1.DAY, momentRef.date());
                break;
            case DeadlineMode.TIME:
                result.start.imply(constants_1.YEAR, momentRef.year());
                result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                result.start.imply(constants_1.DAY, momentRef.date());
                result.start.assign(constants_1.HOUR, momentRef.hour());
                result.start.assign(constants_1.MINUTE, momentRef.minute());
                result.start.assign(constants_1.SECOND, momentRef.second());
                break;
        }
        return true;
    }
    return false;
};
exports.checkMonthDaysValid = (day, month, year) => {
    return day <= moment().date(1).month(month).year(year).daysInMonth();
};
var Modifier;
(function (Modifier) {
    Modifier[Modifier["LAST"] = 0] = "LAST";
    Modifier[Modifier["THIS"] = 1] = "THIS";
    Modifier[Modifier["NEXT"] = 2] = "NEXT";
    Modifier[Modifier["UNKNOWN"] = 3] = "UNKNOWN";
})(Modifier = exports.Modifier || (exports.Modifier = {}));
exports.updateParsedComponent = (result, ref, offset, modifier) => {
    const startMoment = moment(ref);
    const refOffset = startMoment.day();
    let startMomentFixed = false;
    if (modifier === Modifier.LAST) {
        startMoment.day(offset - 7);
        startMomentFixed = true;
    }
    else if (modifier === Modifier.NEXT) {
        startMoment.day(offset + 7);
        startMomentFixed = true;
    }
    else if (modifier == Modifier.THIS) {
        startMoment.day(offset);
    }
    else {
        const calcOffset = offset - refOffset;
        const absOffset = Math.abs(calcOffset);
        if (Math.abs(calcOffset - 7) < absOffset) {
            startMoment.day(offset - 7);
        }
        else if (Math.abs(calcOffset + 7) < absOffset) {
            startMoment.day(offset + 7);
        }
        else {
            startMoment.day(offset);
        }
    }
    result.start.assign(constants_1.WEEKDAY, offset);
    if (startMomentFixed) {
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
    }
    else {
        result.start.imply(constants_1.DAY, startMoment.date());
        result.start.imply(constants_1.MONTH, startMoment.month() + 1);
        result.start.imply(constants_1.YEAR, startMoment.year());
    }
};
