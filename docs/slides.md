## Why I was upset?

<span class="fragment">

```ts
let discover = new AwesomeLibrary<ManipulatingComplexData>().then((justUseMe) => {
  andDontAskQuestions(justUseMe);
});
```

</span>

<span class="fragment">

#### But how `AwesomeLibrary` actually works...?

</span>

<span class="fragment">*"`AwesomeLibrary` is based on the `Promise` API"* (official docs)</span>

<span class="fragment">

#### But what is a `Promise`...?

</span>

<span class="fragment">*"Think of `Promise` as a way to write asynchronous code in JavaScript using procedural coding style"*</span>

<span class="fragment">

#### Need some code...?

</span>

<span class="fragment">

```ts
const promise = new Promise(() => {
  // Things are happening here...
});
```

</span>


<div class="fragment" style="font-size: 1.5em">😠</div>

Notes :



## But things could have been different...

<div class="fragment">

```ts [1,7|2,6|3|4|5|10|11|1-11]
const promise = new Promise<number>((resolve, reject) => {
  setTimeout(() => {
    Math.random() > 0.5
      ? resolve('withSomeData')
      : reject('forAReason');
  }, 1000);
});

promise
  .then((data) => console.log(data))              // output: "withSomeData"
  .catch((err) => console.error(err));            // output: "forAReason"
```

</div>

<div class="fragment" style="margin-top: 2em; text-align: center; font-size: 1.5em">
  So, it wasn't that hard... 😎
</div>

Notes :



## Let's get it right from the start!

<div class="fragment">

```ts
const observable$ = new Observable(() => {
  // Things are happening here...
});
```

</div>

<div class="fragment" style="margin-top: 2em; text-align: center; font-size: 1.5em">

Let's find out what's behind this comment... 🤔

</div>

Notes :

When i learned Angular, i had this exact same feeling...



## RxJS

- Refers to a __paradigm__ called ReactiveX (http://reactivex.io/)
  - an API for asynchronous programming with observable streams
  - implemented in all major programming languages: RxJava, Rx.NET, ...

- Let's focus on the JavaScript implementation: *RxJS*

<br /><br />

<p style="text-align: center">
  <img src="./favicon.ico" alt="ReactiveX" height="200" />
</p>

Notes :



## In a nutshell

- Observables:
  - represent a stream of data that can be subscribed to
  - allowing multiple values to be emitted over time

Notes :



## Building blocks

- To understand RxJS, you need to learn the following concepts:
  - `Observable`
  - `Observer`
  - `Subscription`
  - `Operators`
  - `Subjects`

Notes :

The following slides only show code examples.
Everything is summarized in the slide "RxJS - Summary so far"...



## Observable & Observer 1/4

```ts [1|3,7,9,12|4,5,10|6,11|14|1-14|6,11]
import { Observable, Observer } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);                             // <-- Emit next value
  subscriber.next(2);                             // <-- Emit next value
  subscriber.complete();                          // <-- Mark as complete
});

const observer: Partial<Observer<number>> = {
  next: (data: number) => console.log(data),      // <-- Listen to "next" events
  complete: () => console.log('Done'),            // <-- Listen to "complete" event
};

data$.subscribe(observer);                        // output: 1, 2, Done
```

- Use the *subscriber* to shape the behavior of the observable

- Use the *observer* to specify which events you want to listen to

- Subscriber and observer methods match: `next`, `complete` (and also `error`)

Notes :

- By convention, a variable representing an observable ends with the symbol `$`

- The `.subscribe()` method activates the observable to emit its data stream



## Observable & Observer 2/4

```ts [6,11|14|1-14]
import { Observable, Observer } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);                             // <-- Emit next value
  subscriber.next(2);                             // <-- Emit next value
  subscriber.error('Oops!');                      // <-- Mark as in error
});

const observer: Partial<Observer<number>> = {
  next: (data: number) => console.log(data),      // <-- Listen to "next" events
  error: (err: unknown) => console.error(err),    // <-- Listen to "error" event
};

data$.subscribe(observer);                        // output: 1, 2, Oops!
```

- Example of `error` event instead of `complete` event

Notes :



## Observable & Observer 3/4

```ts [4-6|7|1-14|11]
import { Observable, Observer } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
  subscriber.next(3);                             // <-- Value NOT emitted
});

const observer: Partial<Observer<number>> = {
  next: (data: number) => console.log(data),      // <-- Object property as "next" observer
};

data$.subscribe(observer);                        // output: 1, 2
```

- Once the observable completes (or is in error), further calls to `next` are ignored

Notes :



## Observable & Observer 4/4

```ts [11|1-14]
import { Observable, Observer } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
  subscriber.next(3);                             // <-- Value NOT emitted
});


const next = (data: number) => console.log(data); // <-- Function as "next" observer


data$.subscribe(next);                            // output: 1, 2
```

- You can use a function as observer to simply listen to `next` events

Notes :



## Subscription 1/3 (not yet...)

- Example of an observable that completes itself properly (without memory leak)

```ts [1,3,14|4|6,13|7,17|9-12,18|1-19|6,10,13]
import { Observable } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  let data = 0;

  const interval = setInterval(() => {
    subscriber.next(++data);            // <-- Emit next value every second

    if (data === 3) {                   // <-- Until this value
      clearInterval(interval);          // <-- Cleanup interval to prevent memory leak
      subscriber.complete();            // <-- Then mark as complete
    }
  }, 1000);
});

data$.subscribe({
  next: (data: number) => console.log(data),
  complete: () => console.log('Done'),
}); // output: 1, 2, 3, Done
```

Notes :



## Subscription 2/3

- Example of an observable that never completes and have a *memory leak*! 😱

```ts [6,9|3,4,7,8,12|14,20|17,18|1-20|6,9,17,18]
import { Observable, Subscription } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  let data = 0;

  setInterval(() => {
    subscriber.next(++data);            // <-- Emit next value every second ad infinitum
    console.log('tick');
  }, 1000);


});

const subscription: Subscription = data$.subscribe((data: number) => {
  console.log(data);
  if (data === 3) {
    subscription.unsubscribe();         // <-- Unsubscribe from data$
                                        //     but the observable still ticking...
  }
}); // output: 1, tick, 2, tick, 3, tick, tick, tick, ...
```

Notes :



## Subscription 3/3

- Example of an observable that never completes but cleans up itself properly

```ts [6,9,11,17,18|1-20]
import { Observable, Subscription } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  let data = 0;

  const interval = setInterval(() => {
    subscriber.next(++data);            // <-- Emit next value every second ad infinitum
    console.log('tick');
  }, 1000);

  return () => clearInterval(interval); // <-- Return the resource cleanup function
});

const subscription: Subscription = data$.subscribe((data: number) => {
  console.log(data);
  if (data === 3) {
    subscription.unsubscribe();         // <-- Unsubscribe from data$ and execute
                                        //     the resource cleanup function
  }
}); // output: 1, tick, 2, tick, 3, tick
```

Notes :

- The `.subscribe()` method returns a `Subscription` allowing the consumer to `.unsubscribe()` from the activated observable

- Unsubscription is necessary to avoid memory leaks when the consumer is no longer interested in the data
  - Unless the observable is already in "complete" (or "error" state)



## Observable source 1/4

- Observable can be created using `of` function:

```ts
import { of } from 'rxjs';

const source$ = of('hello', 123);

source$.subscribe(console.log); // output: hello, 123
```

Notes :



## Observable source 2/4

- Observable can be created from existing value (like `Array` or `Promise`) using `from` function:

```ts [1|3,5|7,9|1-9]
import { from } from 'rxjs';

const fromArray$ = from(['hello', 123]);

fromArray$.subscribe(console.log); // output: hello, 123

const fromPromise$ = from(new Promise((resolve) => resolve('Done!')));

fromPromise$.subscribe(console.log); // output: Done!
```

Notes :



## Observable source 3/4

- Observable can be created using `fromEvent` function:

```ts [1|3,5|1-5]
import { fromEvent } from 'rxjs';

const fromDocumentClick$ = fromEvent(document, 'click');

fromDocumentClick$.subscribe((event: Event) => console.log(event));
```

Notes :



## Observable source 4/4

- Observable that emits an error event can be created using `throwError` function:

```ts [1|3|5-7|1-7]
import { throwError } from 'rxjs';

const error$ = throwError(() => new Error('Oops!'));

error$.subscribe({
  error: (err: Error) => console.error(err.message) // output: Oops!
});
```

Notes :



## Operators | synchronous 1/2

```ts [1-11|13|15|17|19-22|1-22]
import {
  Observable, filter, map // <-- "filter" and "map": synchronous transformations
} from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.next(4);
  subscriber.complete();
});

data$.pipe(/* no operator */).subscribe(console.log);               // output: 1, 2, 3, 4

data$.pipe(filter((data) => data % 2 === 0)).subscribe(console.log);// output: 2, 4

data$.pipe(map((data) => data * 10)).subscribe(console.log);        // output: 10, 20, 30, 40

data$.pipe(
  filter((data) => data % 2 === 0),
  map((data) => data * 10)
).subscribe(console.log);                                           // output: 20, 40
```

Notes :



## Operators | synchronous 2/2


```ts [1-11|13|16-19|15,20,21|1-21]
import {
  Observable, map, tap // <-- "map" and "tap": synchronous transformations
} from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.next(4);
  subscriber.complete();
});

let oddValuesCount = 0;                                             // <-- Defined out of the stream

data$.pipe(
  tap((data) => {
    if (data % 2 === 0) oddValuesCount += 1;                        // <-- Handle side effect
    return 'ignored value';                                         // <-- Return value is ignored
  }),
  map((data) => data * 10)
).subscribe(console.log);                                           // output: 10, 20, 30, 40
```

Notes :



## Operators | asynchronous 1/4

```ts [1-7|9,17|10-16|19,21,22|1-22]
import { Observable, concatMap } from 'rxjs'; // <-- "concatMap": asynchronous transformation

const todoId$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

const fetchTodoFactory$ = (id: number) => new Observable((subscriber) => {
  fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
    .then((response) => response.json())
    .then((todo) => {
      subscriber.next(todo);                  // <-- Emit "next" event
      subscriber.complete();                  // <-- Emit "complete" event
    })
    .catch((err) => subscriber.error(err));   // <-- Emit "error" event
});

todoId$.pipe(concatMap((id) => fetchTodoFactory$(id))).subscribe(console.log);

// output: { id: 1, title: 'delectus aut autem', completed: false }
// output: { id: 2, title: 'quis ut nam facilis et officia qui', completed: false }
```

Notes :

- `todoId$` emits the values `1` and `2` synchronously.

- `concatMap` waits until `Todo` with id `1` is completed before fetching `Todo` with id `2`.

- The same result can be achieved using: `from(fetch('...'))`

- Explain the difference when replacing `concatMap` with `mergeMap`



## Operators | asynchronous 2/4

```ts [1|3-5|7,20|8|9,19|10,11,18|12-17|1-20]
import { Observable, fromEvent, map, switchMap } from 'rxjs';

const input = document.createElement('input');
input.type = 'number';
document.body.appendChild(input);

fromEvent(input, 'input').pipe(
  map((event) => (event.target as HTMLInputElement).value),
  switchMap((id) => new Observable((subscriber) => {
    const controller = new AbortController();
    fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((todo) => {
        subscriber.next(todo);
        subscriber.complete();
      })
      .catch((err) => subscriber.error(err));
    return () => controller.abort();
  }))
).subscribe(console.log);
```

Notes :



## Operators | asynchronous 3/4

- `concatMap`<br />
  Projects each source value to an Observable which is merged in the output Observable, in a serialized fashion waiting for each one to complete before merging the next.

- `mergeMap`<br />
  Projects each source value to an Observable which is merged in the output Observable.

- `switchMap`<br />
  Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.

- *a lot more...*

Notes :



## Operators | asynchronous - catchError 4/4

- The `catchError` operator should:
  - return another observable
  - throw again to be handled by another `catchError` or the observer's `error` handler

```ts [3,8,11|5,7,11,13|12|1-16]
import { interval, tap, catchError, of } from 'rxjs';

const source$ = interval(1000).pipe(
  tap((value) => {
    if (value > 3) throw new Error('Oops!');
  }),
  catchError(() => of('Fallback'))            // <-- Trigger "next" event
);

source$.subscribe({
  next: console.log,
  error: console.error,                       // <-- Never called
  complete: () => console.log('Done!')
});

// Output => 0, 1, 2, 3, Fallback, Done!
```

Notes :



## Summary so far

<div class="fragment">

- By convention, a variable representing an observable ends with the symbol `$`

</div><br /><div class="fragment">

- The `Observable` implementation is a function that use the `Subscriber` methods to emit the stream events
  - `.next()`, `.complete()` and `.error()`

</div><br /><div class="fragment">

- The `.subscribe()` method activates the observable to emit its data stream
  - It accepts an object (`Partial<Observer>`) or a function as `Observer` to listen to the stream events
  - It returns a `Subscription` allowing the consumer to `.unsubscribe()` from the activated observable

</div><br /><div class="fragment">

- Unsubscription is necessary to avoid memory leaks when the consumer is no longer interested in the data
  - Unless the observable is already in "complete" (or "error" state)

</div><br /><div class="fragment">

- The `Operators` allow to transform the emitted values and make the observables very powerful 🚀

</div>

Notes :



## Subject 1/2

- A `Subject` implements both `Observable` and `Observer` interfaces

```ts [1,3|5-7|9-12|14-18|1-18]
import { Subject } from 'rxjs';

const subject$ = new Subject();

// Act as Observable
subject$.subscribe(/* ... */);
subject$.pipe(/* ... */);

// Act as Observer
subject$.next(/* ... */);
subject$.error(/* ... */);
subject$.complete(/* ... */);

// Can be converted into a simple Observable...
const observable$ = subject$.asObservable();

// ...hidding the Observer interface
observable$.next(/* ... */); // ❌ Property 'next' does not exist on type 'Observable'
```

Notes :



## Subject 2/2

- Unlike the observable:
  - a subject implementation lives outside its instantiation (calling `next`, `error`, `complete`)
  - a subject can emit stream events even before any subscription ("*hot*" observable)
  - a subject is "*multicast*" (all subscribers share the same stream events)

```ts [1|3|5|7|9|11-13|1-14]
const data$ = new Subject<string>();

data$.next('A');                          // <-- value is lost

data$.subscribe((data) => console.log(`#sub1(${data})`));

data$.next('B');                          // <-- value recieved by subscriber 1

data$.subscribe((data) => console.log(`#sub2(${data})`));

data$.next('C');                          // <-- value recieved by subscribers 1 and 2
data$.next('D');                          // <-- value recieved by subscribers 1 and 2
data$.complete();
// output: #sub1(B), #sub1(C), #sub2(C), #sub1(D), #sub2(D)
```

Notes :



## Observable compared to Subject

- Unlike the subject:
  - an observable implementation lives inside its instantiation (calling `next`, `error`, `complete`)
  - an observable emits stream events only when subscribing ("*cold*" observable)
  - an observable is "*unicast*" (each subscriber receive a new data stream)

```ts [1,3,8|4-7|10|11|1-13]
import { Observable } from 'rxjs';

const observable$ = new Observable<string>((subscriber) => {
  // This is where implementation takes place...
  subscriber.next('A');
  subscriber.next('B');
  subscriber.complete();
});

data$.subscribe((data) => console.log(`#sub1(${data})`));
data$.subscribe((data) => console.log(`#sub2(${data})`));

// output: #sub1(A), #sub1(B), #sub2(A), #sub2(B)
```

Notes :



## Subject as Observer

- As an observer, a `Subject` can subscribe to an `Observable`!

```ts [1-7|9-10|12-13|15-20]
import { Observable, Subject } from 'rxjs';

const observable$ = new Observable<string>((subscriber) => {
  subscriber.next('A');
  subscriber.next('B');
  subscriber.complete();
});

const subject$ = new Subject<string>();
subject$.subscribe(console.log);

// Doing this...
observable$.subscribe(subject$);                // output: A, B

// ...is equivalent to
observable$.subscribe({
  next: (observable: string) => subject$.next(observable),
  complete: () => subject$.complete(),
  error: (err: unknown) => subject$.error(err),
});                                             // output: A, B
```

Notes :



## Subject | BehaviorSubject

A variant of Subject that requires an initial value and emits its current value whenever it is subscribed to.

```ts [1|3|5|7|9|11-12|14|1-18]
import { BehaviorSubject } from 'rxjs';

const data$ = new BehaviorSubject<string>('A');           // <-- Initial value

data$.subscribe((data) => console.log(`#sub1(${data})`)); // <-- #sub1 receive 'A'

data$.next('B');                                          // <-- #sub1 receive 'B'

data$.subscribe((data) => console.log(`#sub2(${data})`)); // <-- #sub2 receive 'B'

data$.next('C');
data$.next('D');

console.log(`#snapshot(${data$.value})`); // <-- and you have access to the instant value!

data$.complete();

// output: #sub1(A), #sub1(B), #sub2(B), #sub1(C), #sub2(C), #sub1(D), #sub2(D), #snapshot(D)
```

Notes :



## Subject | ReplaySubject

A variant of Subject that "replays" old values to new subscribers by emitting them when they first subscribe.

```ts [1|3|5|7|9|11|13-15|1-17]
import { ReplaySubject } from 'rxjs';

const data$ = new ReplaySubject<string>(2);               // <-- Number of events to replay

data$.next('A');

data$.subscribe((data) => console.log(`#sub1=${data}`));  // <-- #sub1 receive 'A'

data$.next('B');                                          // <-- #sub1 receive 'B'

data$.subscribe((data) => console.log(`#sub2=${data}`));  // <-- #sub2 receive 'A' and 'B'

data$.next('C');
data$.next('D');
data$.complete();

// output: #sub1(A), #sub1(B), #sub2(A), #sub2(B), #sub1(C), #sub2(C), #sub1(D), #sub2(D)
```

Notes :



## State management 1/3

- Expose application data through service facade and observables

```ts [1,3,19|4-8|10-11,17-18|12-15|16|1-19]
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

export class TodoService {
  private _todos$ = new BehaviorSubject<Todo[] | undefined>(undefined);

  todos$ = this._todos$.asObservable();

  get todosSnapshot() { return this._todos$.value; }

  dispatch(): Observable<void> {
    return from(fetch<Todo[]>('https://jsonplaceholder.typicode.com/todos')).pipe(
      tap((todos) => {
        this._todos$.next(todos);               // <-- Using `tap` operator for "side-effects"

      }),
      map(() => undefined),                     // <-- Force the consumer to use the `todos$` property
    );
  }
}
```

Notes :



## State management 2/3

- Same example but using a `ReplaySubject` instead of a `BehaviorSubject`

```ts [1,3,19|4-8|10-11,17-18|12-15|16|1-19]
import { ReplaySubject, Observable, tap, map } from 'rxjs';

export class TodoService {
  todosSnapshot?: Todo[];
  
  private _todos$ = new ReplaySubject<Todo[]>(1); // <-- `undefined` no longer required
  
  todos$ = this._todos$.asObservable();

  dispatch(): Observable<void> {
    return from(fetch<Todo[]>('https://jsonplaceholder.typicode.com/todos')).pipe(
      tap((todos) => {
        this.todosSnapshot = todos;
        this._todos$.next(this.todosSnapshot);  // <-- Using `tap` operator for "side-effects"
      }),
      map(() => undefined),                     // <-- Force the consumer to use the `todos$` property
    );
  }
}
```

Notes :

- The advantage of `ReplaySubject` (over `BehaviorSubject`) is that you don't need to deal with the value `undefined`.

- This is because `ReplaySubject` does not have an initial value.



## State management 3/3

- Determine the appropriate place to trigger data fetching

- Don't forget to handle errors!

- Consume the data anywhere

```ts [1-6|8-9|11-12|1-12]
// app.component.ts
const todoService = new TodoService();

let showError = false;

todoService.dispatch().subscribe({ error: () => (showError = true) });

// todo-list.component.ts
todoService.todos$.subscribe((todos) => console.log(todos));

// todo-count.component.ts
todoService.todos$.pipe(map(({ length }) => length)).subscribe((length) => console.log(length));
```

Notes :



## Conclusion

<div class="fragment">

- Now you know the main concepts of RxJS:
  - `Observable`
  - `Observer`
  - `Subscription`
  - `Operators`
  - `Subjects`

</div><br /><div class="fragment">

- But your journey has just begun

</div><br /><div class="fragment">

- And there's so much more to learn:
  - `combineLatest`, `debounceTime`, `delay`, `pairwise`, `reduce`, `share`, `shareReplay`, `skip`, `skipUntil`, `skipWhile`, `startWith`, `take`, `takeUntil`, `toArray`, `withLatestFrom`, `zip`, ...

</div>

Notes : 


