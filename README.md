# Poll Retry

Very simple abstraction to keep polling.

## Installation
```bash
npm install poll-retry
```

## Usage

Different capabilities supported are shown in this section. You can also refer to the [unit tests](./test/Poller.tests.js) for usage references.

### Start Polling
All you need is function to execute on every poll. Just pass `pollFn` field with the polling function.

```javascript
let counter = 0;
const pollFn = () => {
    counter++;
    // Print counter on every poll
    console.log('Counter increased: ', counter);
};

const poller = new Poller({ pollFn });

poller.start();
```

Above code is very simple example that simply keeps executing `pollFn` indefinitely.


### Stop Polling

To stop polling at any point of time, simply use `poller.stop()`. 

```javascript
let counter = 0;
const pollFn = () => {
    counter++;
    // Print counter on every poll
    console.log('Counter increased: ', counter);
};

const poller = new Poller({ pollFn });

poller.start();

setTimeout(() => {
    // Stop polling after 10 seconds
    poller.stop();
}, 10000)
```

### Passing Parameters to polling function
When initializing the `Poller`, any parameters intended for `pollFn` can be passed in the field `pollFnParameters` wrapped in an object.

All the properties of the wrapper object will be shallow copied to `pollFn` as a first parameter. See example below:

```javascript
const params = {
    counter: 0
};

const pollFn = (params) => {
    params.counter++;
    // Print counter on every poll
    console.log('Counter increased: ', params.counter);
};

const poller = new Poller({
                pollFn,
                pollFnParameters: params
            });

poller.start();
``` 

### Subscribe to polling status
`poller` will generate the `poll` event on every time poll happens. You can subscribe to it by simply `poller.on('poll', ...)`.

While the polling is going on status would indicate `in_progress` and after polling has finished would indicate `stopped` status.

```javascript
poller.on('poll', (params, status) => {
    console.log('Parameters: ', params);
    console.log('Polling Status: ', status);
});
```

If you only want to get event when the polling ends. Then you can simply just subscribe to `end` event.

```javascript
poller.on('end', (params, status) => {
    console.log('Parameters: ', params);
    console.log('Polling Status: ', status); // This will always be 'stopped'
});
```

### Stop polling on a condition

You can pass a `conditionFn` property during initialization with a condition function which returns a boolean value. The polling will stop after this function returns `true`.
```javascript
const params = {
    counter: 0
};

const pollFn = (params) => {
    params.counter++;
    // Print counter on every poll
    console.log('Counter increased: ', params.counter);
};

const poller = new Poller({
                pollFn,
                pollFnParameters: params,
                conditionFn: (params) => {
                    if (params.counter >= 5) {
                        console.log('Condition satisfied.');
                        return true;
                    }
                    return false;
                }
            });

poller.start();

// Notice that no need to execute poller.stop() manually when conditionFn used

poller.on('end', (params, status) => {
    console.log('Counter: ', params.counter); // Counter shows value as 6 in the end
    console.log('Polling Status: ', status); 
});
```

### API

#### new Poller({ pollFn, [pollFnParameters, [conditionFn], [options]] })

Creates a new `Poller` instance.
* `pollFn`: Main polling function that needs to get called for every poll. Required.
* `pollFnParameters`: A JavaScript object that wraps any data required for `pollFn`. This object is shallow copied as 1st parameter to `pollFn`, `conditionFn` and events (`poll` and `end`)
* `conditionFn`: A function with any condition logic to break the polling. Polling stops after this function returns `true`.
* `options`: Additional options.
    * `retryCount`: Number of time polling should be performed. If `conditionFn` returns `true` before retry count reaches, polling stops.
    * `delay`: Amount of time in milliseconds to wait between the consecutive polls. Defaults to `1000` i.e. 1 second.
    * `initialDelay`: Amount of time in milliseconds to wait before starting first poll. Defaults to `0` i.e. no wait.

#### poller.start()
Start the polling according to initialized parameters in the poller instance.

#### poller.stop()
Stop the polling.

#### poller.on(eventName, eventFunction)
Subscribe to events. Supported events are `poll` and `end`.

```javascript
// Initialization with all fields and options
const poller = new Poller({
                pollFn: (params) => {
                    params.counter++;
                },
                pollFnParameters: { counter: 0 },
                options: {
                    retryCount: 10,
                    delay: 250,
                    initialDelay: 1000
                },
                conditionFn: (params) => {
                    if (params.counter >= 5) {
                        console.log('condition met on counter value: ', params.counter);
                        return true;
                    }
                    return false;
                }
            });

// Start the polling
poller.start();

poller.on('poll', (params, status) => { 
    console.log('Polling status: ', status);
    if (status === 'in_progress' && params.counter === 6) {
        // Force stop for the edge cases
        poller.stop();
    }
});


poller.on('end', (params) => { 
    console.log('Polling ended. Params: ', params);
});
```
