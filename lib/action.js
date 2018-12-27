"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function action(name) {
    return function (target, propertyKey, descriptor) {
        let methodName = "";
        if (descriptor.value) {
            methodName = "value";
        }
        else if (descriptor.set) {
            methodName = "set";
        }
        if (!methodName) {
            return;
        }
        let method = descriptor[methodName];
        descriptor[methodName] = async function () {
            let result = method.apply(this, arguments);
            if (result instanceof Promise) {
                result = await result;
            }
            this.fireEvent(name || propertyKey, this.currentState);
            return result;
        };
    };
}
exports.action = action;
//# sourceMappingURL=action.js.map