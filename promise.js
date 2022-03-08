class StaticPromises {
  static #result; // static private variables (because static methods can only access static variables and we need those static variables should be private so that they cannot be exposed)
  static #errorInitiated;
  static #error;
  static #thenCollections;

  // initializes value and then if required you can override it in the same method, but keep the initializer on top
  #initializer() {
    StaticPromises.#result = null;
    StaticPromises.#errorInitiated = false;
    StaticPromises.#error = null;
  }

  // 'this' would refer to child class if the child class in instantiated therefore, use class name instead of 'this'
  static resolve(data) {
    StaticPromises.#result = data;
    StaticPromises.#errorInitiated = false;
    StaticPromises.#error = null;
    return { then: StaticPromises.then, catch: StaticPromises.catch };
  }

  static reject(data) {
    StaticPromises.#errorInitiated = true;
    StaticPromises.#error = data;
    return { then: StaticPromises.then, catch: StaticPromises.catch };
  }

  static then(callback) {
    if (StaticPromises.#errorInitiated === true)
      return { then: StaticPromises.then, catch: StaticPromises.catch };
    const nextResult = callback(StaticPromises.#result);
    StaticPromises.#result = nextResult;
    StaticPromises.#thenCollections.push(callback)
    //  return this; // exposing the current instance object's this
    return { then: StaticPromises.then, catch: StaticPromises.catch }; // exposing the current instance object's this
  }

  static catch(callback) {
    if (StaticPromises.#error !== null) {
      callback(StaticPromises.#error);
    }
  }

  static async all(arrayOfPromises = []) {
    const resultedArray = [];
    /**
     * async-await polyfill will be required as we might have to await until the resultedArray is
     * completely filled i.e. resultedArray.length === arrayOfPromises.length
     */
    for (const [index, item] of arrayOfPromises.entries()) {
      if (StaticPromises.#errorInitiated === true)
        return { then: StaticPromises.then, catch: StaticPromises.catch };
      if (item?.constructor !== Promise) resultedArray.push(item);
      else {
        try {
          item.then((value) => {
            resultedArray.slice(index, 0, value);
            if (resultedArray.length === arrayOfPromises) {
              StaticPromises.#result = resultedArray;
            }
          });
        } catch (err) {
          StaticPromises.#error = err;
          StaticPromises.#errorInitiated = true;
        }
      }
    }

    /** below will work, but it would not be a proper 'all' method where all the promises
     * are executed as soon as they are seen, here each promise ia awaited for it's
     * settlement and then the next one is processed
     *  */
    // for(const item of arrayOfPromises){
    //   if (StaticPromises.#errorInitiated === true) return;
    //   if (item?.constructor !== Promise) resultedArray.push(item);
    //   else {
    //     try {
    //       const promisedRedult = await item;
    //       resultedArray.push(promisedRedult);
    //     } catch (err) {
    //       StaticPromises.#error = err;
    //       StaticPromises.#errorInitiated = true;
    //     }
    //   }
    // }

    /** for each is not fit for async awaiting the whole outer function, you would have to
     * use something with blocks no callbacks
     */
    // arrayOfPromises.forEach(async (item, index, array) => {

    // });

    // StaticPromises.#result = resultedArray;
    return { then: StaticPromises.then, catch: StaticPromises.catch };
  }
}

// StaticPromises.reject(99)
//   .then((res) => console.log(res))
//   .catch((err) => console.log('Error: ', err));
StaticPromises.all([
  123,
  'abc',
  new Promise((res) => setTimeout(() => res('timeout'))),
])
  .then((res) => console.log('Then: ', res))
  .catch((err) => console.log('Error: ', err));

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
