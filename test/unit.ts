import chai = require("chai");
import {action, Store} from "../index"

let should = chai.should();

function delay(time) {
    return new Promise((resolve,) => {
        setTimeout(resolve, time)
    })
}

describe("State", () => {

    it("Should  get  state", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});

        store.state().item.should.be.eq(0);
    });

    it("Should  not change  state", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});

        store.state().item++;

        store.state().item.should.be.eq(0);
    });

    it("Should set state", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});

        store.setState({item: 1});

        store.state().item.should.be.eq(1);
    });

    it("Should fire event on state change", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});

        store.on("stateChanged", function (state) {
            state.item.should.be.eq(1);

            state.item++;

            store.state().item.should.be.eq(1);
        });

        store.setState({item: 1});


    });

    it("Should iterate", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});

        let count = 0;

        for (let state of  store.states()) {
            count += state.item;
        }

        count.should.be.eq(3);

        store.states().next().value.item.should.be.eq(0);


    });

    it("Should go to prev state", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});

        store.prevState.item.should.be.eq(2);


    });

    it("Should go to next state", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});

        store.goToPrevState();

        store.state().item.should.be.eq(2);

        store.prevState.item.should.be.eq(1);
        store.nextState.item.should.be.eq(3);

        store.goToNextState();

        store.state().item.should.be.eq(3);

        store.prevState.item.should.be.eq(2);
        store.nextState.item.should.be.eq(3);

    });

    it("Should go to  state by index and set State", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});

        store.goToState(2);

        store.state().item.should.be.eq(2);

        store.prevState.item.should.be.eq(1);
        store.nextState.item.should.be.eq(3);

    });

    it("Should go to  state by index", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});

        store.goToState(2);

        store.setState({item: 4});

        store.state().item.should.be.eq(4);

        store.prevState.item.should.be.eq(2);
        store.nextState.item.should.be.eq(4);

    });

    it("Should go to  state by bigger index ", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});
        store.setState({item: 4});

        store.goToState(1);

        store.setState({item: 5});

        store.setState({item: 6});

        store.state().item.should.be.eq(6);

        store.stateAt(2).item.should.be.eq(5);
        store.stateAt(1).item.should.be.eq(1);
        store.nextState.item.should.be.eq(6);
        store.prevState.item.should.be.eq(5);

    });


    it("Should go to reset ", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 10});


        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});
        store.setState({item: 4});

        store.goToState(1);

        store.reset();

        store.state().item.should.be.eq(0);

        store.stateAt(2).item.should.be.eq(0);
        store.nextState.item.should.be.eq(0);
        store.prevState.item.should.be.eq(0);

    });


    it("Should go to remove old states ", () => {

        let store = new Store<{ item: number }>({item: 0}, {maxStates: 5});

        store.setState({item: 1});
        store.setState({item: 2});
        store.setState({item: 3});
        store.setState({item: 4});
        store.setState({item: 5});
        store.setState({item: 6});


        store.state().item.should.be.eq(6);

        store.stateAt(0).item.should.be.eq(2);

    });

    it("Should fire action event by setter", () => {

        class TempStore extends Store<{ item: number }> {

            constructor() {
                super({item: 0})
            }

            @action()
            set item(value) {
                this.setState({item: value});
            }
        }

        let store = new TempStore();

        store.on("item", (state) => {
            state.item.should.be.eq(5);
        });

        store.item = 5;

    });

    it("Should fire action event by function", async () => {

        let valueSetter = 0;
        let valueFn = 0;

        class TempStore extends Store<{ item: number }> {

            constructor() {
                super({item: 0})
            }

            @action()
            set item(value) {
                this.setState({item: value});
            }

            @action()
            setItem(value) {
                this.setState({item: value});
            }
        }

        let store = new TempStore();

        store.on("item", (state) => {
            valueSetter = state.item;
        });

        store.on("setItem", (state) => {
            valueFn = state.item;
        });

        store.item = 5;
        store.setItem(6);

        await delay(1);

        valueSetter.should.be.eq(5);
        valueFn.should.be.eq(6);

        store.state().item.should.be.eq(6);

    });


    it("Should fire action event by async function", async () => {

        class TempStore extends Store<{ item: number }> {

            constructor() {
                super({item: 0})
            }


            @action("SomeName")
            async setItem(value) {

                await delay(0);

                this.setState({item: value});
            }
        }

        let store = new TempStore();

        store.setItem(6);

        let result = await store.once("SomeName");


        result.item.should.be.eq(6);

    });


});

