import { Args } from './Args';

export interface Action {
    name: string;
    args: Args;
}

export type ActionList = Array<Action>;
export type ImmutableActionList = ReadonlyArray<Action>;
