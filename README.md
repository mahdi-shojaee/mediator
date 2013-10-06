mediator
========

Another implementation of mediator pattern in JavaScript. This implementation uses the deferred objects of the jQuery library in its publish method.

There are some cases that a publisher wants to know when all the subscribers of a specific channel complete their asynchronous tasks, without any knowledge of its subscribers.
The publish method of this library returns a promise of all the returned promises of subscribers that do a asynchronous task and want to inform the publisher about this task's completion. The returned promise of the publish method resolves on completion of all the subscribers promises (resolve and reject). In other hand if a subscriber return a promise that rejects later, the publish method of the publisher do not ignore the remaining promises. 

This approach is not like the jQueries $.when() that ignores the remaining promises immediately if any of the promises rejects.


How to use?
-----------


###mediator.subscribe

```javascript
mediator.subscribe(channel, callback[, context]);
```

**channel**  
*Type*: String  
Any string as the mediator channel name.

**callback**  
*Type*: Function  
Callback function that invokes on a publish with the specified channel.
All the parameters that passed to publish method will be arguments of this callback function.

**context** *(Optional)*  
*Type*: any JavaScript valid type  
The context of the callback function.


###mediator.publish

```javascript
mediator.publish(channel[, arg1[, arg2[, ...]]]);
```

**channel**  
*Type*: String  
Any string as the mediator channel name.

**arg1,...argN** *(Optional)*  
*Type*: any JavaScript valid type  
The arguments that will be passing to the registered subscribers.

**returns**  
A promise of all the returned promises of subscribers.

Example
-------

```javascript
// In a sub module:
mediator.subscribe('app:refresh', function () {
	return $.ajax({...});
});

// In another sub module:
mediator.subscribe('app:refresh', function () {
	return $.ajax({...});
});

// And another sub module:
mediator.subscribe('app:refresh', function () {
	...
	// Do not return any promise.
});

// In the main module:
mediator.publish('app:refresh', ...).then(function () {
	// All the promises returned from some of subscribers, resolved.
}, function () {
	// One of the promises returned from some of subscribers, rejected.
});
```
