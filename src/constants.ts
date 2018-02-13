import {COMPONENT_NAME} from "./result";

export const HOUR: COMPONENT_NAME = 'hour';
export const MINUTE: COMPONENT_NAME = 'minute';
export const SECOND: COMPONENT_NAME = 'second';
export const MILLISECOND: COMPONENT_NAME = 'millisecond';
export const MERIDIEM: COMPONENT_NAME = 'meridiem';
export const DAY: COMPONENT_NAME = 'day';
export const MONTH: COMPONENT_NAME = 'month';
export const YEAR: COMPONENT_NAME = 'year';
export const WEEKDAY: COMPONENT_NAME = 'weekday';
export const TIMEZONE_OFFSET: COMPONENT_NAME = 'timezoneOffset';
export const WEEK: UnitOfTime = 'week';

export type NameMap = {
    [k :string]: number
}

export type UnitOfTime = 'hour'
| 'minute'
| 'second'
| 'millisecond'
| 'day'
| 'month'
| 'year'
| 'week'

export type UnitRegexMap = {
    [k in UnitOfTime]?: RegExp
}