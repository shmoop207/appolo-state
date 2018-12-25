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
        if (this.options.stateCount <= 0) {
            this.options.stateCount = 1;
        }
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
        let $self = this;
        let index = -1;
        const iterator = {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                index++;
                return index == $self._states.length
                    ? { value: undefined, done: true }
                    : { value: $self.stateAt(index), done: false };
            }
        };
        return iterator;
    }
    stateAt(index) {
        index = this._checkStateIndex(index);
        if (!this._states[index]) {
            return null;
        }
        return JSON.parse(JSON.stringify(this._states[index]));
    }
    _checkStateIndex(index) {
        return index <= 0 ? 0 : (index > this._states.length - 1 ? this._states.length - 1 : index);
    }
    setState(value) {
        let state = this.currentState;
        let newState = state ? deepmerge(state, value) : value;
        if (this._stateIndex != this._states.length - 1) {
            let oldIndex = this._stateIndex;
            this._states = this._states.slice(0, oldIndex + 1);
        }
        this._states.push(newState);
        this._stateIndex = this._states.length - 1;
        if (this._states.length > this.options.stateCount) {
            this._states.shift();
        }
        this.fireEvent("stateChanged", this.currentState);
    }
    get statesCount() {
        return this._states.length - 1;
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