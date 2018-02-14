"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const constants_1 = require("./constants");
class ParsedResult {
    constructor(result) {
        this.ref = result.ref;
        this.index = result.index;
        this.text = result.text;
        this.tags = result.tags || {};
        this.start = new ParsedComponents(result.start, result.ref);
        if (result.end) {
            this.end = new ParsedComponents(result.end, result.ref);
        }
    }
    clone() {
        const result = new ParsedResult({
            ref: this.ref,
            index: this.index,
            text: this.text
        });
        result.tags = Object.assign({}, this.tags);
        result.start = this.start.clone();
        if (this.end) {
            result.end = this.end.clone();
        }
        return result;
    }
    hasPossibleDates() {
        return this.start.isPossibleDate() && (!this.end || this.end.isPossibleDate());
    }
}
exports.ParsedResult = ParsedResult;
class ParsedComponents {
    constructor(components, ref) {
        this.knownValues = {};
        this.impliedValues = {};
        if (components) {
            Object.keys(components).forEach((key) => this.knownValues[key] = components[key]);
        }
        if (ref) {
            const refMoment = moment(ref);
            this.imply(constants_1.DAY, refMoment.date());
            this.imply(constants_1.MONTH, refMoment.month() + 1);
            this.imply(constants_1.YEAR, refMoment.year());
        }
        this.imply(constants_1.HOUR, 12);
        this.imply(constants_1.MINUTE, 0);
        this.imply(constants_1.SECOND, 0);
        this.imply(constants_1.MILLISECOND, 0);
    }
    clone() {
        const component = new ParsedComponents();
        component.knownValues = Object.assign({}, this.knownValues);
        component.impliedValues = Object.assign({}, this.impliedValues);
        return component;
    }
    get(component, defaultReturn = 0) {
        return this.isCertain(component) ? this.knownValues[component] : ((component in this.impliedValues) ? this.impliedValues[component] : defaultReturn);
    }
    assign(component, value) {
        this.knownValues[component] = value;
        delete this.impliedValues[component];
    }
    imply(component, value) {
        if (!this.isCertain(component)) {
            this.impliedValues[component] = value;
        }
    }
    isCertain(component) {
        return component in this.knownValues;
    }
    isPossibleDate() {
        const dateMoment = this.moment();
        if (this.isCertain(constants_1.TIMEZONE_OFFSET)) {
            dateMoment.utcOffset(this.get(constants_1.TIMEZONE_OFFSET));
        }
        return dateMoment.get('minute') === this.get(constants_1.MINUTE)
            && dateMoment.get('hour') === this.get(constants_1.HOUR)
            && dateMoment.get('year') === this.get(constants_1.YEAR)
            && dateMoment.get('month') === this.get(constants_1.MONTH) - 1
            && dateMoment.get('date') === this.get(constants_1.DAY);
    }
    ;
    date() {
        return this.moment().toDate();
    }
    moment() {
        const dateMoment = moment();
        dateMoment.set('year', this.get(constants_1.YEAR));
        dateMoment.set('month', this.get(constants_1.MONTH) - 1);
        dateMoment.set('date', this.get(constants_1.DAY));
        dateMoment.set('hour', this.get(constants_1.HOUR));
        dateMoment.set('minute', this.get(constants_1.MINUTE));
        dateMoment.set('second', this.get(constants_1.SECOND));
        dateMoment.set('millisecond', this.get(constants_1.MILLISECOND));
        // Javascript Date Object return minus timezone offset
        const currentTimezoneOffset = dateMoment.utcOffset();
        const targetTimezoneOffset = this.get(constants_1.TIMEZONE_OFFSET, currentTimezoneOffset);
        const adjustTimezoneOffset = targetTimezoneOffset - currentTimezoneOffset;
        dateMoment.add(-adjustTimezoneOffset, 'minutes');
        return dateMoment;
    }
}
exports.ParsedComponents = ParsedComponents;
