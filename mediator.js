(function (window, undefined) {
	var mediator = {},
		cache = {};

	var _isArray = function(obj) {
    	return toString.call(obj) == '[object Array]';
  	};

	// Returns a promise of all the promises returned from subscribers callbacks.
	// If a promise fails, the result promise will not be reject and continue waiting
	// for other promises.
	// The result promise will be resolve if the return promises of all the
	// subscribers resolves, and reject otherwise.
	mediator.publish = function (channel) {
		var that = this,
		deferred = $.Deferred(),
		promises = 0,
		finishedPromises = 0,
		faileds = 0,
		subscribers = cache[channel],
		args = Array.prototype.slice.call(arguments, 1);

		if (subscribers) {
			var checkFinished = function () {
				++finishedPromises;
				
				// Continue on failure
				if (finishedPromises === promises) {
					faileds ? deferred.reject() : deferred.resolve();
				}

				// Break on failure
				// if (faileds) {
				// 	deferred.reject();
				// } else if (finishedPromises === promises) {
				// 	deferred.resolve();
				// }
			};

			for (var i = 0, len = subscribers.length; i < len; i++) {
				var subscriber = subscribers[i],
					result = subscriber.callback.apply(subscriber.context || that, args.concat(channel));

				if (result === false) {
					break;
				}

				if (result && typeof result.then === 'function') {
					++promises;

					result.then(checkFinished, function () {
						++faileds;
						checkFinished();
					});
				}
			}
		}

		if (!promises) {
			deferred.resolve();
		}

		return deferred.promise();
	};

	mediator.subscribe = function (channels, callback, context) {
		channels = _isArray(channels) ? channels : (channels.split(/\s+/) || []);

		for (var i = 0, len = channels.length; i < len; i++) {
			var channel = channels[i];

			if (!cache[channel]) {
				cache[channel] = [];
			}

			cache[channel].push({ callback: callback, context: context });
		}
	};

	mediator.unsubscribe = function (channels, callback) {
		channels = _isArray(channels) ? channels : (channels.split(/\s+/) || []);

		for (var i = 0, len = channels.length; i < len; i++) {
			var channel = channels[i];

			if (!callback) {
				delete cache[channel];
				return;
			}

			var subscribers = cache[channel];

			if (!subscribers) {
				throw 'Channel "' + channel + '" was not subscribed previously!';
			}

			var newSubscribers = [];

			for (var i = 0, len = subscribers.length; i < len; i++) {
				if (subscribers[i].callback !== callback) {
					newSubscribers.push(subscribers[i]);
				}
			}

			if (newSubscribers.length > 0) {
				cache[channel] = newSubscribers;
			} else {
				delete cache[channel];
			}
		}
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = mediator;
	} else {
		window.mediator = mediator;

		if (typeof define === "function" && define.amd) {
			define("mediator", [], function () { return mediator; });
		}
	}
})(window);
