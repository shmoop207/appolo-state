import {IOptions} from "./IOptions";
import {EventDispatcher} from "appolo-event-dispatcher";
import * as deepmerge from 'deepmerge'

export class Store<T extends { [index: string]: any }> extends EventDispatcher {


    private _states: T[] = [];
    private _stateIndex: number = -1;
    private readonly MaxStates: number;

    constructor(private initialState: T = {} as T, private options: IOptions = {maxStates: 1}) {
        super();

        this.MaxStates = this.options.maxStates || 1;

        this._init();
    }

    private _init() {
        this.setState(this.createInitialState());
    }

    protected createInitialState(): T {
        return this.initialState as T;
    }

    public get currentState(): T {
        return this.stateAt(this._stateIndex);
    }

    public get states(): IterableIterator<T> {

        let $self = this, index = -1;

        return {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                index++;
                return index == $self.statesCount
                    ? {value: undefined, done: true}
                    : {value: $self.stateAt(index), done: false};
            }
        };
    }

    public stateAt(index: number): T {

        index = this._checkStateIndex(index);

        let state = this._states[index];

        if (!state) {
            return null;
        }

        return this._clone(state);
    }

    private _checkStateIndex(index: number): number {
        return index <= 0 ? 0 : (index > this._statesCountIndex ? this._statesCountIndex : index)
    }

    public setState(value: Partial<T> | T, options: { arrayMerge?: "override" | "extend" } = {arrayMerge: "extend"}) {
        let state = this.currentState;

        let mergeOptions: any = {};

        if (options.arrayMerge == "override") {
            mergeOptions.arrayMerge = (destinationArray, sourceArray, options) => sourceArray
        }

        let newState = state ? deepmerge(state, value, mergeOptions) : value;

        if (this._stateIndex != this._statesCountIndex) {
            this._states = this._states.slice(0, this._stateIndex + 1);
        }

        this._states.push(newState as T);

        this._stateIndex = this._statesCountIndex;

        if (this.statesCount > this.MaxStates) {
            this._states.shift();
        }

        this.fireEvent("stateChanged", this.currentState);
    }

    public get statesCount(): number {
        return this._states.length;
    }

    private get _statesCountIndex(): number {
        return this.statesCount - 1;
    }

    private _clone(state: T): T {
        return JSON.parse(JSON.stringify(state));
    }

    public get prevState(): T {
        return this.stateAt(this._stateIndex - 1);
    }

    public goToPrevState() {
        this.goToState(this._stateIndex - 1);
    }

    public get nextState(): T {
        return this.stateAt(this._stateIndex + 1);
    }

    public goToNextState() {
        this.goToState(this._stateIndex + 1);
    }

    public goToState(index: number) {

        index = this._checkStateIndex(index);

        let oldIndex = this._stateIndex;

        this._stateIndex = index;

        if (oldIndex != this._stateIndex) {
            this.fireEvent("stateChanged", this.currentState);
        }
    }

    public reset() {
        this._states = [];
        this._init();

    }

}