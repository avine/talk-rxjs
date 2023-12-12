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
