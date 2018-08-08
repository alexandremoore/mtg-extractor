import { MtgSimpleSet } from './SimpleSet';
import { MtgCard } from './Card';

export interface MtgSet extends MtgSimpleSet {
    cards?: MtgCard[];
}