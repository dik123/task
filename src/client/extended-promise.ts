export default class ExtendedPromise {
    promise: Promise<void>;
    resolve: Function;
    reject: Function;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}