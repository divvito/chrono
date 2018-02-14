import Parser from './parsers/parser';
import Refiner from './refiners/refiner';
export declare type Options = {
    parsers?: Parser[];
    refiners?: Refiner[];
};
export declare type Config = {
    strict?: boolean;
    littleEndian?: boolean;
};
export declare type OptionsResolver = (config?: Config) => Options;
export declare type OptionsOrResolver = Options | OptionsResolver;
export interface OptionsResolverWithCasual extends OptionsResolver {
    casual?: OptionsResolver;
}
export declare const mergeOptions: (options: OptionsOrResolver[]) => Options;
export declare const commonPostProcessing: OptionsResolver;
export declare const strictOption: OptionsResolver;
export declare const casualOption: OptionsResolver;
declare const de: OptionsResolverWithCasual;
declare const en: OptionsResolverWithCasual;
declare const en_GB: OptionsResolverWithCasual;
declare const ja: OptionsResolverWithCasual;
declare const es: OptionsResolverWithCasual;
declare const fr: OptionsResolverWithCasual;
declare const zh: OptionsResolver;
export { de, en, fr, en_GB, ja, es, zh };
