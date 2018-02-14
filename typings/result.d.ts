import { Moment } from 'moment';
export declare type TIME_COMPONENT_NAME = 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem';
export declare type DATE_COMPONENT_NAME = 'day' | 'month' | 'year';
export declare type COMPONENT_NAME = TIME_COMPONENT_NAME | DATE_COMPONENT_NAME | 'weekday' | 'timezoneOffset';
export declare type ComponentCollection = {
    [k in COMPONENT_NAME]?: number;
};
export declare type ResultParts = {
    ref: Date;
    index: number;
    text: string;
    tags?: {
        [k: string]: true;
    };
    start?: ComponentCollection;
    end?: ComponentCollection;
};
export declare class ParsedResult {
    ref: Date;
    index: number;
    text: string;
    tags: {
        [k: string]: true;
    };
    start: ParsedComponents;
    end?: ParsedComponents;
    constructor(result: ResultParts);
    clone(): ParsedResult;
    hasPossibleDates(): boolean;
}
export declare class ParsedComponents {
    knownValues: ComponentCollection;
    impliedValues: ComponentCollection;
    constructor(components?: ComponentCollection, ref?: Date);
    clone(): ParsedComponents;
    get(component: COMPONENT_NAME, defaultReturn?: number): number;
    assign(component: COMPONENT_NAME, value: number): void;
    imply(component: COMPONENT_NAME, value: number): void;
    isCertain(component: COMPONENT_NAME): boolean;
    isPossibleDate(): boolean;
    date(): Date;
    moment(): Moment;
}
