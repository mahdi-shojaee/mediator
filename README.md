mediator
========

Another implementation of mediator pattern in JavaScript that the `publish` method returns a promise object that informs the publisher when all the subscribers completed their asynchronous or synchronous tasks.

There are some cases that a publisher wants to know when all the subscribers of a specific channel complete their asynchronous tasks while the publisher does not any knowledge about its subscribers. The `publish` method of this library returns a promise of all the returned promises of subscribers that do an asynchronous task and want to inform the publisher about completion of the task. The returned promise of the `publish` method resolves or rejects on completion of all the subscribers promises (resolve or reject). In other hand if a subscriber returns a promise that rejects later, the `publish` method of the publisher do not ignore the remaining promises. 

This approach is not like the jQuery.when() that ignores the remaining promises immediately if any of the promises rejects.

###Dependencies

This implementation depends on jQuery for it's deferred objects.


How to use?
-----------


###mediator.subscribe

Add a subscriber callback for the channel that will be called with the specified context (if any).
If context is not specified, mediator itself will be use.

```javascript
mediator.subscribe(channel, callback[, context]);
```

**channel**  
*Type*: String  
Any string as the mediator channel name.

**callback**  
*Type*: Function  
Callback function that invokes on a `publish` with the specified channel.
All the parameters that passed to `publish` method will be arguments of this callback function.

**context** *(Optional)*  
*Type*: any JavaScript valid type  
The context of the callback function.


###mediator.unsubscribe

Remove all subscribers of a channel with the specified callback.
If callback is not specified, all the subscribers of the channel will be remove.

```javascript
mediator.unsubscribe(channel[, callback])
```

**chanel**  
*Type*: String  
Any string as the mediator channel name.

**callback** *(Optional)*  
*Type*: Function  
A reference of the callback that passed to the `subscribe` method.


###mediator.publish

Dispatch data over the specified channel and returns a promise of all the promises returned from subscribers callbacks. If a promise fails, the result promise will not be reject and continue waiting for other promises. The result promise will be resolve if the return of all the subscribers resolves, and rejects otherwise.

```javascript
mediator.publish(channel[, arg1[, arg2[, ...[, argN]]]]);
```

**channel**  
*Type*: String  
Any string as the mediator channel name.

**argN** *(Optional)*  
*Type*: any JavaScript valid type  
The arguments that will be passing to the registered subscribers.

**returns**  
A promise of all the returned promises of subscribers.

Example
-------

```javascript
// In module A
mediator.subscribe('app:refresh', function () {
	return $.ajax({...});
});

// In module B
mediator.subscribe('app:refresh', function () {
	return $.ajax({...});
});

// In module C
mediator.subscribe('app:refresh', function () {
	// Do not return any promise.
});

// In module D
mediator.publish('app:refresh', ...).then(function () {
	// Now two ajax calls in modules A and B completed successfully.
}, function () {
	// Ajax calls in modules A and B completed but One of them or both failed.
});
```
