"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
const deepmerge = require("deepmerge");
class Store extends appolo_event_dispatcher_1.EventDispatcher {
    constructor(initialState = {}, options = { stateCount: 1 }) {
        super();
        this.initialState = initialState;
        this.options = options;
        this._states = [];
        this._stateIndex = -1;
        this.MaxStates = this.options.stateCount || 1;
        this._init();
    }
    _init() {
        this.setState(this.createInitialState());
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
                return index == $self.statesCount
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
        return index <= 0 ? 0 : (index > this._statesCountIndex ? this._statesCountIndex : index);
    }
    setState(value) {
        let state = this.currentState;
        let newState = state ? deepmerge(state, value) : value;
        if (this._stateIndex != this._statesCountIndex) {
            this._states = this._states.slice(0, this._stateIndex + 1);
        }
        this._states.push(newState);
        this._stateIndex = this._statesCountIndex;
        if (this.statesCount > this.MaxStates) {
            this._states.shift();
        }
        this.fireEvent("stateChanged", this.currentState);
    }
    get statesCount() {
        return this._states.length;
    }
    get _statesCountIndex() {
        return this.statesCount - 1;
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