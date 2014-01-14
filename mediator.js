/* jshint -W117 */
(function (window, undefined) {
	"use strict";

	var _isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	},

	fn = function ($) {
		var mediator = {},
			cache = {};

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
						if (faileds) {
							deferred.reject();
						} else {
							deferred.resolve();
						}
					}

					// Break on failure
					// if (faileds) {
					// 	deferred.reject();
					// } else if (finishedPromises === promises) {
					// 	deferred.resolve();
					// }
				},

				callbackFail = function () {
					++faileds;
					checkFinished();
				};

				for (var i = 0, len = subscribers.length; i < len; i++) {
					var subscriber = subscribers[i],
						result = subscriber.callback.apply(subscriber.context || that, args.concat(channel));

					if (result === false) {
						break;
					}

					if (result && typeof result.then === 'function') {
						++promises;
						result.then(checkFinished, callbackFail);
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
			var i, k, channelsLength, subscribersLength, channel, subscribers, newSubscribers;
			channels = _isArray(channels) ? channels : (channels.split(/\s+/) || []);

			for (i = 0, channelsLength = channels.length; i < channelsLength; i++) {
				channel = channels[i];

				if (!callback) {
					delete cache[channel];
					return;
				}

				subscribers = cache[channel];

				if (!subscribers) {
					throw 'Channel "' + channel + '" was not subscribed previously!';
				}

				newSubscribers = [];

				for (k = 0, subscribersLength = subscribers.length; k < subscribersLength; k++) {
					if (subscribers[k].callback !== callback) {
						newSubscribers.push(subscribers[k]);
					}
				}

				if (newSubscribers.length > 0) {
					cache[channel] = newSubscribers;
				} else {
					delete cache[channel];
				}
			}
		};

		return mediator;
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = function (jQuery) { return fn(jQuery); };
	} else {
		window.mediator = fn(window.jQuery);

		if (typeof define === "function" && define.amd && define.amd.jQuery) {
			define("mediator", ['jquery'], fn);
		}
	}
})(window);
