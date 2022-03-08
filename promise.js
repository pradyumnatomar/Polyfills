class PromisePolyfill  {
  #result;
  #error;
  #errorInitiated = false;
  constructor(caller) {
    // do binding at the top or after super() before using them
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);
    // this.#initialCaller = this.#initialCaller.bind(this);
    if (!caller)
      throw new Error("Can't execute resolve method if no caller is provided");
    this.#result = undefined;
    this.#error = undefined;
    this.#errorInitiated = false;
    caller(this.resolve, this.reject);
  }

  resolve(data) {
    this.#result = data;
  }

  reject(data) {
    this.#errorInitiated = true;
    this.#error = data;
  }

  then(callback) {
    if (this.#errorInitiated === true)
      return { then: this.then, catch: this.catch };
    const nextResult = callback(this.#result);
    this.#result = nextResult;
    //  return this; // exposing the current instance object's this
    return { then: this.then, catch: this.catch }; // exposing the current instance object's this
  }

  catch(callback) {
    if (this.#error !== null) {
      callback(this.#error);
    }
  }
}
