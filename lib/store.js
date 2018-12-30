"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
const deepmerge = require("deepmerge");
class Store extends appolo_event_dispatcher_1.EventDispatcher {
    constructor(initialState = {}, options = { maxStates: 1 }) {
        super();
        this.initialState = initialState;
        this.options = options;
        this._states = [];
        this._stateIndex = -1;
        this.MaxStates = this.options.maxStates || 1;
        this._init();
    }
    _init() {
        if (Array.isArray(this.initialState)) {
            this._states = this.initialState;
        }
        else {
            this._states.push(this.initialState);
        }
        this._stateIndex = this.countIndex;
    }
    createInitialState() {
        return this.initialState;
    }
    get currentState() {
        return this.stateAt(this._stateIndex);
    }
    get states() {
        let $self = this, index = -1;
        return {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                index++;
                return index == $self.count
                    ? { value: undefined, done: true }
                    : { value: $self.stateAt(index), done: false };
            }
        };
    }
    stateAt(index) {
        index = this._checkStateIndex(index);
        let state = this._states[index];
        if (!state) {
            return null;
        }
        return this._clone(state);
    }
    _checkStateIndex(index) {
        return index <= 0 ? 0 : (index > this.countIndex ? this.countIndex : index);
    }
    setState(value, options = { arrayMerge: "extend" }) {
        let state = this.currentState;
        let mergeOptions = {};
        if (options.arrayMerge == "override") {
            mergeOptions.arrayMerge = (destinationArray, sourceArray, options) => sourceArray;
        }
        let newState = state ? deepmerge(state, value, mergeOptions) : value;
        if (this._stateIndex != this.countIndex) {
            this._states = this._states.slice(0, this._stateIndex + 1);
        }
        this._states.push(newState);
        this._stateIndex = this.countIndex;
        if (this.count > this.MaxStates) {
            this._states.shift();
        }
        this.fireEvent("stateChanged", this.currentState);
    }
    get count() {
        return this._states.length;
    }
    get currentIndex() {
        return this._stateIndex;
    }
    get countIndex() {
        return this.count - 1;
    }
    _clone(state) {
        return JSON.parse(JSON.stringify(state));
    }
    get prevState() {
        return this.stateAt(this._stateIndex - 1);
    }
    goToPrevState() {
        this.goToState(this._stateIndex - 1);
    }
    get nextState() {
        return this.stateAt(this._stateIndex + 1);
    }
    goToNextState() {
        this.goToState(this._stateIndex + 1);
    }
    goToState(index) {
        index = this._checkStateIndex(index);
        let oldIndex = this._stateIndex;
        this._stateIndex = index;
        if (oldIndex != this._stateIndex) {
            this.fireEvent("stateChanged", this.currentState);
        }
    }
    reset() {
        this._states = [];
        this._init();
    }
}
exports.Store = Store;
//# sourceMappingURL=store.js.map