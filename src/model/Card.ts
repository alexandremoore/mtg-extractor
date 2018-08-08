export interface MtgCard {
    artist?: string;
    cmc?: number;
    id?: string;
    imageName?: string;
    layout?: string;
    loyalty?: number;
    manaCost?: string;
    multiverseid?: number;
    name?: string;
    number?: string;
    rarity?: string;
    subtypes?: string[];
    supertypes?: string[];
    text?: string;
    type?: string;
    types?: string[];
    imageUrl?: string;
    setCode?: string;
}