## RxJS

- Refers to a paradigm called ReactiveX (http://reactivex.io/)
  - an API for asynchronous programming with observable streams
  - implemented in all major programming languages: RxJava, Rx.NET, ...

- Angular uses the JavaScript implementation: *RxJS*

- Observables:
  - represent a stream of data that can be subscribed to
  - allowing multiple values to be emitted over time

<p style="text-align: center">
  <img src="./public/favicon.ico" alt="ReactiveX" height="150" />
</p>

Notes :



## RxJS

- Observables are used everywhere in the Angular framework: *HTTP*, *Router*, ...

- *State management* of an Angular application can be achieved using observables

- Understanding observables is crucial to master the Angular framework

- To understand RxJS, you need to learn the following concepts:
  - `Observable`
  - `Observer`
  - `Subscription`
  - `Operators`
  - `Subjects`

Notes :

The following slides only show code examples.
Everything is summarized in the slide "RxJS - Summary so far"...



## RxJS - Observable & Observer

```ts [1|3-7|9-12|14]
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



## RxJS - Observable & Observer

```ts
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



## RxJS - Observable & Observer

```ts
import { Observable, Observer } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
  subscriber.next(3);                             // <-- Value NOT emitted
});

const next = (data: number) => console.log(data); // <-- Function as observer

data$.subscribe(next);                            // <-- same as `data$.subscribe({ next });`

// output: 1, 2
```

- Once the observable completes (or is in error), further calls to `next` are ignored

- You can use a function as observer to simply listen to "next" events



## RxJS - Subscription 1/3

- Example of an observable that completes itself properly (without memory leak)

```ts
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



## RxJS - Subscription 2/3

- Example of an observable that never completes and have a *memory leak*!

```ts
import { Observable, Subscription } from 'rxjs';

const data$ = new Observable<number>((subscriber) => {
  let data = 0;

  setInterval(() => {
    subscriber.next(++data);            // <-- Emit next value every second ad infinitum
    console.log('tick');
  }, 1000);

  // ...
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



## RxJS - Subscription 3/3

- Example of an observable that never completes but cleans up itself properly

```ts
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



## RxJS - Observable source

- Observable can be created using `of` function:

```ts
import { of } from 'rxjs';

const source$ = of('hello', 123);

source$.subscribe(console.log); // output: hello, 123
```

- Observable can be created from existing value (like Array or Promise) using `from` function:

```ts
import { from } from 'rxjs';

const fromArray$ = from(['hello', 123]);

fromArray$.subscribe(console.log); // output: hello, 123

const fromPromise$ = from(new Promise((resolve) => resolve('Done!')));

fromPromise$.subscribe(console.log); // output: Done!
```

Notes :



## RxJS - Observable source

- Observable can be created using `fromEvent` function:

```ts
import { fromEvent } from 'rxjs';

const fromDocumentClick$ = fromEvent(document, 'click');

fromDocumentClick$.subscribe((event: Event) => console.log(event));
```

- Observable that emits an error event can be created using `throwError` function:

```ts
import { throwError } from 'rxjs';

const error$ = throwError(() => new Error('Oops!'));

error$.subscribe({
  error: (err: Error) => console.error(err.message) // output: Oops!
});
```

Notes :



## RxJS - Operators | synchronous

```ts
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



## RxJS - Operators | asynchronous

```ts
import { Observable, concatMap } from 'rxjs'; // <-- "concatMap": asynchronous transformation

const todoId$ = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

const fetchTodoFactory$ = (id: number) => new Observable<Todo>((subscriber) => {
  fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
    .then((response) => response.json())
    .then((todo: Todo) => {
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



## RxJS - Operators | more...

- `concatMap`<br />
  Projects each source value to an Observable which is merged in the output Observable, in a serialized fashion waiting for each one to complete before merging the next.

- `mergeMap`<br />
  Projects each source value to an Observable which is merged in the output Observable.

- `switchMap`<br />
  Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.

- `combineLatest`<br />
  Combines multiple Observables to create an Observable whose values are calculated from the latest values of each of its input Observables.

- `debouceTime`<br />
  Emits a notification from the source Observable only after a particular time span has passed without another source emission.

Notes :



## RxJS - Operators | catchError

- The `catchError` operator should:
  - return another observable
  - throw again to be handled by another `catchError` or the observer's `error` handler

```ts
import { interval, tap, catchError, of } from 'rxjs';

const source$ = interval(1000).pipe(
  tap((value) => {
    if (value > 3) throw new Error('Oops!');
  }),
  catchError(() => of('Fallback'))
);

source$.subscribe({
  next: console.log,
  error: console.error,
  complete: () => console.log('Done!')
});

// Output => 0, 1, 2, 3, Fallback, Done!
```

Notes :



## RxJS - Summary so far

- By convention, a variable representing an observable ends with the symbol `$`

- The `Observable` implementation is a function that use the `Subscriber` methods to emit the stream events
  - `.next()`, `.complete()` and `.error()`

- The `.subscribe()` method activates the observable to emit its data stream
  - It accepts an object (`Partial<Observer>`) or a function as `Observer` to listen to the stream events
  - It returns a `Subscription` allowing the consumer to `.unsubscribe()` from the activated observable

- Unsubscription is necessary to avoid memory leaks when the consumer is no longer interested in the data
  - Unless the observable is already in "complete" (or "error" state)

- The `Operators` allow to transform the emitted values and make the observables very powerful

Notes :



## RxJS - Subject

- A `Subject` implements both `Observable` and `Observer` interfaces

```ts
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
const observable$ = subject$.asObservable(/* ... */);

// ...hiding the Observer interface
observable$.next(/* ... */); // ❌ Property 'next' does not exist on type 'Observable'
```

Notes :



## RxJS - Subject

- Unlike the observable:
  - a subject implementation lives outside its instantiation (calling `next`, `error`, `complete`)
  - a subject can emit stream events even before any subscription ("*hot*" observable)
  - a subject is "*multicast*" (all subscribers share the same stream events)

```ts
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



## RxJS - Observable compared to Subject

- Unlike the subject:
  - an observable implementation lives inside its instantiation (calling `next`, `error`, `complete`)
  - an observable emits stream events only when subscribing ("*cold*" observable)
  - an observable is "*unicast*" (each subscriber receive a new data stream)

```ts
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



## RxJS - Subject as Observer

- As an observer, a `Subject` can subscribe to an `Observable`!

```ts
import { Observable, Subject } from 'rxjs';

const observable$ = new Observable<string>((subscriber) => {
  subscriber.next('A');
  subscriber.next('B');
  subscriber.complete();
});

const subject$ = new Subject<string>();
subject$.subscribe(console.log);          // output: A, B

// Doing this...
observable$.subscribe(subject$);          // <-- `subject$` acting as `Observer`

// ...is equivalent to
observable$.subscribe({
  next: (observable: string) => subject$.next(observable),
  complete: () => subject$.complete(),
  error: (err: unknown) => subject$.error(err),
});
```

Notes :



## RxJS - Subject | BehaviorSubject

A variant of Subject that requires an initial value and emits its current value whenever it is subscribed to.

```ts
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



## RxJS - Subject | ReplaySubject

A variant of Subject that "replays" old values to new subscribers by emitting them when they first subscribe.

```ts
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



## RxJS - Angular state management 1/4

- Expose application data through service facade and observables

```ts
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private _todos$ = new BehaviorSubject<Todo[] | undefined>(undefined);
  todos$ = this._todos$.asObservable();
  get todosSnapshot() { return this._todos$.value; }

  constructor(private httpClient: HttpClient) {}

  fetch(): Observable<void> {
    return this.httpClient.get<Todo[]>('https://jsonplaceholder.typicode.com/todos').pipe(
      tap((todos) => {
        this._todos$.next(todos);   // <-- Using `tap` operator for "side-effects"
      }),
      map(() => undefined),         // <-- Force the consumer to use the `todos$` property
    );
  }
}
```

Notes :



## RxJS - Angular state management 2/4

- Same example but using a `ReplaySubject` instead of a `BehaviorSubject`

```ts
import { ReplaySubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoService {
  todosSnapshot?: Todo[];
  private _todos$ = new ReplaySubject<Todo[]>(1); // <-- `undefined` no longer required
  todos$ = this._todos$.asObservable();

  constructor(private httpClient: HttpClient) {}

  fetch(): Observable<void> {
    return this.httpClient.get<Todo[]>('https://jsonplaceholder.typicode.com/todos').pipe(
      tap((todos) => {
        this.todosSnapshot = todos;
        this._todos$.next(this.todosSnapshot);
      }),
      map(() => undefined),
    );
  }
}
```

Notes :

- The advantage of `ReplaySubject` (over `BehaviorSubject`) is that you don't need to deal with the value `undefined`.

- This is because `ReplaySubject` does not have an initial value.



## RxJS - Angular state management 3/4

- Determine the appropriate place to trigger data fetching

- Don't forget to handle errors!

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<h1>My todo list</h1>
             <app-todo-list />
             <p *ngIf="showError">Sorry, a problem occured!</p>`
})
export class AppComponent implements OnInit {
  showError = false;

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.todoService.fetch().subscribe({ error: () => (this.showError = true) });
  }
}
```

Notes :



## RxJS - Angular state management 4/4

- Consume the service facade in your components

```ts
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-todo-list',
  template: `
    <p *ngFor="let todo of todos">
      {{ todo.title }} is completed: {{ todo.completed ? 'yes' : 'no' }}.
    </p>
  `
})
export class TodoListComponent implements OnDestroy {
  protected todos: Todo[] = [];

  private subscription = this.todoService.todo$.subscribe((todos) => (this.todos = todos));

  constructor(private todoService: TodoService) {}

  ngDestroy() { this.subscription.unsubscribe(); }
}
```

Notes :



## Angular - Async pipe

- Use the `async` pipe to consume the facade directly in your components template

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-todo-list',
  template: `
    <p *ngFor="let todo of todos$ | async">
      {{ todo.title }} is completed: {{ todo.completed ? 'yes' : 'no' }}.
    </p>
  `
})
export class TodoListComponent {
  protected todos$ = this.todoService.todos$;

  constructor(private todoService: TodoService) {}
}
```

Notes :

Explain that with this method, the `todos$` are "reactive".

Todos displayed in the component can be refreshed...



## Angular - Async pipe

- Use the "`as`" syntax to create a local template variable and reduce the number of subscriptions in your components template

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-todo-list',
  template: `
    <ng-container *ngIf="todos$ | async as todos">    
      <h2>There's is {{ todo.length }} item(s) in your todo list.</h2>

      <p *ngFor="let todo of todos">
        {{ todo.title }} is completed: {{ todo.completed ? 'yes' : 'no' }}.
      </p>
    </ng-container>
  `
})
export class TodoListComponent {
  protected todos$ = this.todoService.todos$;

  constructor(private todoService: TodoService) {}
}
```

Notes :



## Angular - Async pipe

- The `async` pipe provides many advantages:
  - It automatically subscribes to the `Observable`
  - It automatically triggers change detection when new data is emitted from the `Observable`
  - It automatically unsubscribes from the `Observable` when the component is about to get destroyed

Notes :
