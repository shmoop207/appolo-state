import {IOptions} from "./IOptions";
import {EventDispatcher} from "appolo-event-dispatcher";
import * as deepmerge from 'deepmerge'

export class Store<T extends { [index: string]: any }> extends EventDispatcher {


    private _states: T[] = [];
    private _stateIndex: number = -1;
    private readonly MaxStates: number;

    constructor(private initialState: T | T[] = {} as T, private options: IOptions = {maxStates: 1}) {
        super();

        this.MaxStates = this.options.maxStates || 1;

        this._init();
    }

    private _init() {
        if (Array.isArray(this.initialState)) {
            this._states = this.initialState;
        } else {
            this._states.push(this.initialState);
        }

        this._stateIndex = this.countIndex;
    }


    protected createInitialState(): T {
        return this.initialState as T;
    }

    public  state(): T {
        return this.stateAt(this._stateIndex);
    }

    public states(): IterableIterator<T> {

        let $self = this, index = -1;

        return {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                index++;
                return index == $self.count
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
        return index <= 0 ? 0 : (index > this.countIndex ? this.countIndex : index)
    }

    public setState(value: Partial<T> | T, options: { arrayMerge?: "override" | "extend" } = {arrayMerge: "extend"}) {
        let state = this.state;

        let mergeOptions: any = {};

        if (options.arrayMerge == "override") {
            mergeOptions.arrayMerge = (destinationArray, sourceArray, options) => sourceArray
        }

        let newState = state ? deepmerge(state, value, mergeOptions) : value;

        if (this._stateIndex != this.countIndex) {
            this._states = this._states.slice(0, this._stateIndex + 1);
        }

        this._states.push(newState as T);

        if (this.count > this.MaxStates) {
            this._states.shift();
        }

        this._stateIndex = this.countIndex;


        this.fireEvent("stateChanged", this.state());
    }

    public get count(): number {
        return this._states.length;
    }

    public get currentIndex(): number {
        return this._stateIndex;
    }

    private get countIndex(): number {
        return this.count - 1;
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
            this.fireEvent("stateChanged", this.state);
        }
    }

    public reset() {
        this._states = [];
        this._init();

    }

}