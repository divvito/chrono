import {MergeDateRangeRefiner} from '../EN/ENMergeDateRangeRefiner';

export default class DEMergeDateRangeRefiner extends MergeDateRangeRefiner {
    PATTERN: RegExp = /^\s*(bis(?:\s*(?:am|zum))?|\-)\s*$/i;
    TAG: string = 'DEMergeDateRangeRefiner';
}