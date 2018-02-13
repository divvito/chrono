import * as moment from "moment";
import {Moment} from "moment";
import {DAY, HOUR, MINUTE, MONTH, SECOND, UnitOfTime, WEEK, WEEKDAY, YEAR} from "../constants";
import {ParsedComponents, ParsedResult} from "../result";

export const getAppropriateYear = (current: ParsedComponents, ref: Date): void => {
    const day: number = current.get(DAY, -1);
    const month: number = current.get(MONTH, -1);
    if (day !== -1 && month !== -1) {
        //Find the most appropriated year
        const refMoment: Moment = moment(ref);
        const refMomentClone: Moment = refMoment.clone();
        refMoment.month(month - 1);
        refMoment.date(day);

        const nextYear: Moment = refMoment.clone().add(1, 'y');
        const lastYear: Moment = refMoment.clone().add(-1, 'y');
        const diff: number = Math.abs(refMoment.diff(refMomentClone));
        if (Math.abs(nextYear.diff(refMomentClone)) < diff) {
            current.imply(YEAR, nextYear.year());
        } else if (Math.abs(lastYear.diff(refMomentClone)) < diff) {
            current.imply(YEAR, lastYear.year());
        } else {
            current.imply(YEAR, refMoment.year());
        }
    }
};

enum DeadlineMode {
    TIME,
    DATE,
    NONE,
}

export const deadlineCalculations = (num: number, unit: UnitOfTime, result: ParsedResult, momentRef: Moment): boolean => {
    let mode: DeadlineMode = DeadlineMode.NONE;
    switch (unit) {
        case HOUR:
            momentRef.add(num, 'hour');
            mode = DeadlineMode.TIME;
            break;
        case MINUTE:
            momentRef.add(num, 'minute');
            mode = DeadlineMode.TIME;
            break;
        case SECOND:
            momentRef.add(num, 'second');
            mode = DeadlineMode.TIME;
            break;
        case DAY:
            momentRef.add(num, 'd');
            mode = DeadlineMode.DATE;
            break;
        case MONTH:
            momentRef.add(num, 'month');
            mode = DeadlineMode.DATE;
            break;
        case YEAR:
            momentRef.add(num, 'year');
            mode = DeadlineMode.DATE;
            break;
        case WEEK:
            momentRef.add(num * 7, 'd');
            mode = DeadlineMode.DATE;
            break;
    }

    if (mode !== DeadlineMode.NONE) {
        switch (mode) {
            case DeadlineMode.DATE:
                result.start.assign(YEAR, momentRef.year());
                result.start.assign(MONTH, momentRef.month() + 1);
                result.start.assign(DAY, momentRef.date());
                break;
            case DeadlineMode.TIME:
                result.start.imply(YEAR, momentRef.year());
                result.start.imply(MONTH, momentRef.month() + 1);
                result.start.imply(DAY, momentRef.date());
                result.start.assign(HOUR, momentRef.hour());
                result.start.assign(MINUTE, momentRef.minute());
                result.start.assign(SECOND, momentRef.second());
                break;
        }

        return true;
    }

    return false;
};

export const checkMonthDaysValid = (day: number, month: number, year: number): boolean => {
    return day <= moment().date(1).month(month).year(year).daysInMonth();
};

export enum Modifier {
    LAST,
    THIS,
    NEXT,
    UNKNOWN
}

export const updateParsedComponent = (result: ParsedResult, ref: Date, offset: number, modifier: Modifier) => {
    const startMoment: Moment = moment(ref);
    const refOffset: number = startMoment.day();
    let startMomentFixed: boolean = false;

    if (modifier === Modifier.LAST) {
        startMoment.day(offset - 7);
        startMomentFixed = true;
    } else if (modifier === Modifier.NEXT) {
        startMoment.day(offset + 7);
        startMomentFixed = true;
    }  else if (modifier == Modifier.THIS) {
        startMoment.day(offset);
    } else {
        const calcOffset = offset - refOffset;
        const absOffset = Math.abs(calcOffset);
        if (Math.abs(calcOffset - 7) < absOffset) {
            startMoment.day(offset - 7);
        } else if (Math.abs(calcOffset + 7) < absOffset) {
            startMoment.day(offset + 7);
        } else {
            startMoment.day(offset);
        }
    }

    result.start.assign(WEEKDAY, offset);

    if (startMomentFixed) {
        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
    } else {
        result.start.imply(DAY, startMoment.date());
        result.start.imply(MONTH, startMoment.month() + 1);
        result.start.imply(YEAR, startMoment.year());
    }
};