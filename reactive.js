const trush = x => f => f(x)
const pipe  = (...fs) => x => fs.reduce((acc, f) => f(acc), x)
const tap   = f => x => {f(x); return x}
const not   = p => x => !p(x)

class Observable {
  constructor () {
    this.observers = []
  }
  subscribe (callback) {
    this.observers.push(callback)
  }
  emit (message) {
    this.observers.forEach(trush(message))
  }
  pipe(...observables) {
    return observables.reduce((acc, observable) => {
      acc.subscribe(observable.emit.bind(observable))
      return observable
    }, this)
  }
}

class IdentityObservable {
  constructor () {
    this.observable = new Observable()
  }
  subscribe(callback) {
    this.observable.subscribe(callback)
  }
  emit (message) {
    this.observable.emit(message)
  }
}

class Mapper extends IdentityObservable{
  constructor (f) {
    super()
    this.f = f
  }
  emit (message) {
    this.observable.emit(this.f(message))
  }
}

class Filter extends IdentityObservable{
  constructor (p) {
    super()
    this.p = p
  }
  emit (message) {
    if(this.p(message)) this.observable.emit(message)
  }
}

const Rx = {}
Rx.map    = f => new Mapper(f);
Rx.filter  = p => new Filter(p);
Rx.reject = p => new Filter(not(p));
// Rx.scan

const double = x => x * 2

const observable = new Observable()
setImmediate(() => {
  observable.emit(10);
  observable.emit(2);
  observable.emit(5);
  observable.emit(-0);
  observable.emit(-8);
  observable.emit(9);
})

const nonNegativeDoubler = observable.pipe(
  Rx.filter(x => x >= 0),
  Rx.map(Math.abs), // this will solve -0 problem
  Rx.map(double)
)

nonNegativeDoubler.subscribe(console.log)
observable.subscribe(message => console.log(message));
