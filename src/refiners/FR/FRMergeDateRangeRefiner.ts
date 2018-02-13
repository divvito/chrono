import {MergeDateRangeRefiner} from '../EN/ENMergeDateRangeRefiner';

export default class FRMergeDateRangeRefiner extends MergeDateRangeRefiner {
    PATTERN: RegExp = /^\s*([àa\-])\s*$/i;
    TAG: string = 'FRMergeDateRangeRefiner';
}
