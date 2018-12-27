import "reflect-metadata";


export function action(name?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let methodName = "";

        if (descriptor.value) {
            methodName = "value";
        } else if (descriptor.set) {
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
        }
    }


}