import {IOptions} from "./IOptions";
import {EventDispatcher} from "appolo-event-dispatcher";
import * as deepmerge from 'deepmerge'

export class Store<T extends { [index: string]: any }> extends EventDispatcher {


    private _states: T[] = [];
    private _stateIndex: number = -1;

    constructor(private initialState: T = {} as T, private options: IOptions = {stateCount: 1}) {
        super();

        if (this.options.stateCount <= 0) {
            this.options.stateCount = 1;
        }

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

        let $self = this;
        let index = -1;
        const iterator = {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                index++;
                return index == $self._states.length
                    ? {value: undefined, done: true}
                    : {value: $self.stateAt(index), done: false};
            }
        };

        return iterator
    }

    public stateAt(index: number): T {

        index = this._checkStateIndex(index);

        if (!this._states[index]) {
            return null;
        }

        return JSON.parse(JSON.stringify(this._states[index]));
    }

    private _checkStateIndex(index: number): number {
        return index <= 0 ? 0 : (index > this._states.length - 1 ? this._states.length - 1 : index)
    }

    public setState(value: Partial<T> | T) {
        let state = this.currentState;

        let newState = state ? deepmerge(state, value) : value;

        if (this._stateIndex != this._states.length - 1) {
            let oldIndex = this._stateIndex;
            this._states = this._states.slice(0, oldIndex + 1);
        }

        this._states.push(newState as T);

        this._stateIndex = this._states.length - 1;

        if (this._states.length > this.options.stateCount) {
            this._states.shift();
        }

        this.fireEvent("stateChanged", this.currentState);
    }

    public get statesCount(): number {
        return this._states.length - 1;
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