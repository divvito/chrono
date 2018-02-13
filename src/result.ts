import * as moment from 'moment';
import {Moment} from 'moment';
import {HOUR, MINUTE, SECOND, MILLISECOND, DAY, MONTH, YEAR, TIMEZONE_OFFSET} from './constants';

export type TIME_COMPONENT_NAME = 'hour'
    | 'minute'
    | 'second'
    | 'millisecond'
    | 'meridiem';

export type DATE_COMPONENT_NAME = 'day'
    | 'month'
    | 'year'

export type COMPONENT_NAME =
    TIME_COMPONENT_NAME
    | DATE_COMPONENT_NAME
    | 'weekday'
    | 'timezoneOffset';

export type ComponentCollection = {[k in COMPONENT_NAME]?: number;}

export type ResultParts = {
    ref: Date;
    index: number;
    text: string;
    tags?: {
        [k: string]: true;
    };
    start?: ComponentCollection;
    end?: ComponentCollection;
}


export class ParsedResult {
    ref: Date;
    index: number;
    text: string;
    tags: {
        [k: string]: true
    };
    start: ParsedComponents;
    end?: ParsedComponents;

    constructor(result: ResultParts) {
        this.ref = result.ref;
        this.index = result.index;
        this.text = result.text;
        this.tags = result.tags || {};

        this.start = new ParsedComponents(result.start, result.ref);
        if (result.end) {
            this.end = new ParsedComponents(result.end, result.ref)
        }
    }

    clone(): ParsedResult {
        const result = new ParsedResult({
            ref: this.ref,
            index: this.index,
            text: this.text
        });
        result.tags = {...this.tags};
        result.start = this.start.clone();
        if (this.end) {
            result.end = this.end.clone();
        }
        return result;
    }

    hasPossibleDates(): boolean {
        return this.start.isPossibleDate() && (!this.end || this.end.isPossibleDate());
    }
}

export class ParsedComponents {
    knownValues: ComponentCollection = {};
    impliedValues: ComponentCollection = {};

    constructor(components?: ComponentCollection, ref?: Date) {
        if (components) {
            (Object.keys(components) as COMPONENT_NAME[]).forEach((key: COMPONENT_NAME) => this.knownValues[key] = components[key]);
        }

        if (ref) {
            const refMoment: Moment = moment(ref);
            this.imply(DAY, refMoment.date());
            this.imply(MONTH, refMoment.month() + 1);
            this.imply(YEAR, refMoment.year());
        }

        this.imply(HOUR, 12);
        this.imply(MINUTE, 0);
        this.imply(SECOND, 0);
        this.imply(MILLISECOND, 0);
    }

    clone() {
        const component: ParsedComponents = new ParsedComponents();
        component.knownValues = {...this.knownValues};
        component.impliedValues = {...this.impliedValues};
        return component;
    }

    get(component: COMPONENT_NAME, defaultReturn: number = 0): number {
        return this.isCertain(component) ? this.knownValues[component]! : (
            (component in this.impliedValues) ? this.impliedValues[component]! : defaultReturn
        );
    }

    assign(component: COMPONENT_NAME, value: number) {
        this.knownValues[component] = value;
        delete this.impliedValues[component];
    }

    imply(component: COMPONENT_NAME, value: number) {
        if (!this.isCertain(component)) {
            this.impliedValues[component] = value;
        }
    }

    isCertain(component: COMPONENT_NAME): boolean {
        return component in this.knownValues;
    }

    isPossibleDate() {
        const dateMoment: Moment = this.moment();
        if (this.isCertain(TIMEZONE_OFFSET)) {
            dateMoment.utcOffset(this.get(TIMEZONE_OFFSET))
        }

        return dateMoment.get('minute') === this.get(MINUTE)
            && dateMoment.get('hour') === this.get(HOUR)
            && dateMoment.get('year') === this.get(YEAR)
            && dateMoment.get('month') === this.get(MONTH) - 1
            && dateMoment.get('date') === this.get(DAY);
    };

    date(): Date {
        return this.moment().toDate();
    }

    moment(): Moment {
        const dateMoment: Moment = moment();

        dateMoment.set('year', this.get(YEAR));
        dateMoment.set('month', this.get(MONTH) - 1);
        dateMoment.set('date', this.get(DAY));
        dateMoment.set('hour', this.get(HOUR));
        dateMoment.set('minute', this.get(MINUTE));
        dateMoment.set('second', this.get(SECOND));
        dateMoment.set('millisecond', this.get(MILLISECOND));

        // Javascript Date Object return minus timezone offset
        const currentTimezoneOffset: number = dateMoment.utcOffset();
        const targetTimezoneOffset: number = this.get(TIMEZONE_OFFSET, currentTimezoneOffset);

        const adjustTimezoneOffset = targetTimezoneOffset - currentTimezoneOffset;

        dateMoment.add(-adjustTimezoneOffset, 'minutes');

        return dateMoment;
    }
}