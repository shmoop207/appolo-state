# Appolo State
[![Build Status](https://travis-ci.org/shmoop207/appolo-state.svg?branch=master)](https://travis-ci.org/shmoop207/appolo-state) [![Dependencies status](https://david-dm.org/shmoop207/appolo-state.svg)](https://david-dm.org/shmoop207/appolo-state) [![NPM version](https://badge.fury.io/js/appolo-state.svg)](https://badge.fury.io/js/appolo-state)  [![npm Downloads](https://img.shields.io/npm/dm/appolo-state.svg?style=flat)](https://www.npmjs.com/package/appolo-state)
[![Known Vulnerabilities](https://snyk.io/test/github/shmoop207/appolo-state/badge.svg)](https://snyk.io/test/github/shmoop207/appolo-state)

simple state manager for nodejs built with typescript

## Installation
```javascript
npm install appolo-sate --save
```
## Usage

### Store(initialState: T = {},options = {maxStates: 1})
`initialState` - any  object
`options`:
    - `maxStates` - max number of history states to hold default 1
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0}, {maxStates: 10});

```

#### `setState(value: Partial<T>,options={arrayMerge:"extend"})`
change the current to new state
event `stateChanged` if fired on state changed
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0});

store.setState({counter: 1});

```

#### `get currentState():T`
return copy of the current state
```javascript
import {Store} from "appolo-store"

    let store = new Store<{ counter: number }>({counter: 0});

    store.setState({counter: 1});

    let state = store.currentState


```
### `stateAt(index: number): T`
return state copy at given index
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0},{maxStates:10});

store.setState({counter: 1});
store.setState({counter: 2});

store.stateAt(1).counter; // 1


```
#### `get prevState():T`
return the previous state

#### `get nextState():T`
return the next state

#### `goToState(index: number)`
index -  the state index to change to

```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0},{maxStates:10});

store.setState({counter: 1});
store.setState({counter: 2});
store.goToState(1);

store.currentState.counter // 1

```

#### `goToPrevState()`
go to previous state

#### `goToNextState()`
go to next state

### Events
store extends [appolo-event-dispatcher](https://github.com/shmoop207/appolo-event-dispatcher)
every to time the state is changed the `stateChanged` if fired
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0});


store.on("stateChanged",(state)=>{
    console.log(state.counter) // 1
})

store.setState({counter: 1});

```

### Actions
you can use the action decorator to define custom action events
the store will fire event with the action name when the action is finished
```javascript
import {Store,action} from "appolo-store"

class MyStore extend Store<{ counter: number }>{
    super({counter: 0})

    @action()
    set myCounter(value){
        this.setState({counter:value})
    }

    @action()
    async updateMyCounter(value){
        await doSomeThingAsync()
        this.setState({counter:value})
    }
}

(async function (){

let store = new MyStore<>();


store.on("myCounter",(state)=>{
    console.log(state.counter) // 1
})

store.myCounter = 1;

store.updateMyCounter(2);

let state = await store.once("updateMyCounter")
console.log(state.counter) // 2


})()
```

### Iterator
you can loop over all the states from the beginning iterator
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0});

store.setState({counter: 1});
store.setState({counter: 2});

for (let state of  store.states) {
    console.log(state.counter) // 0 ,1 ,2
}

```


#### `reset`
```javascript
import {Store} from "appolo-store"

let store = new Store<{ counter: number }>({counter: 0});

store.setState({counter: 1});
store.setState({counter: 2});

store.reset()

store.currentState.counter // 0

```


## Tests
```javascript
 npm run test
```

## License
MIT