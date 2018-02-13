import {MergeDateTimeRefiner} from "../EN/ENMergeDateTimeRefiner";

export default class JPMergeDateTimeRefiner extends MergeDateTimeRefiner {
    TAG: string = 'JPMergeDateTimeRefiner';
    PATTERN: RegExp = /^\s*(から|ー)\s*$/i;
}