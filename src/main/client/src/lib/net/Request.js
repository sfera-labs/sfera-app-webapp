/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */
Sfera.Net = Sfera.Net || {};
/**
 * Request class
 * @constructor
 */
Sfera.Net.Request = function (options) {
	options = options || {};

	/*
	// The number of milliseconds to delay before attempting to reconnect.
	reconnectInterval: 1000,
	// The maximum number of milliseconds to delay a reconnection attempt.
	maxReconnectInterval: 30000,
	// The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
	reconnectDecay: 1.5,

	// The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
	timeoutInterval: 2000,

	// The maximum number of reconnection attempts to make. Unlimited if null.
	maxReconnectAttempts: null
	*/

	var req = null; // request

	var status; // -1: aborted, 0: ready, 1:loading, 2:loaded

	var reqTimeout = null; // trigger timeout
	this.url = "";

	this.method = options.method || "GET";
	this.formData = null; // in case of POST

	// custom event handlers
	this.onLoaded = null; // needed
	this.onStop = null; // when request is stopped. called with true if loading, false if reqTimeout
	this.onRetry = null; // before retrying on error
	this.onError = null; // any error not captured by custom error handlers
	this.onRequest = null; // when sending request

	// custom error handlers
	this.onConnectionError = null; // connection error
	this.onUnauthorized = null; //

	this.maxWaitingTime = 0; // 0 nothing, msec to wait for an answer, else abort
	var waitTimeout = null; // abort after maxWaitingTime

	this.retryOnErrorDelay = 0; // retry delay msec (on any error), 0 does not retry
	this.maxRetries = 0; // max n of retries. after that, stops and fires onError event(s). if maxRetries is 0, custom onError event is never fired
	this.retries = 0; // current retry attempt

	var self = this; // variable scope

	// errors
	this.ERROR_GENERAL = 0;
	this.ERROR_CONNECTION = 1;
	this.ERROR_MAXWAITTIME = 2;
	this.ERROR_UNAUTHORIZED = 401;
	this.ERROR_FORBIDDEN = 403;
	this.ERROR_NOT_FOUND = 404;

	this.init = function () {
		status = 0; // ready
		// init req
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
			req.onreadystatechange = onReadyStateChange;

			// progress
			if (req.upload) {
				req.upload.addEventListener('progress', onProgress);
			}
		}
		// branch for IE/Windows ActiveX version
		else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
			if (req) {
				req.onreadystatechange = onReadyStateChange;
			}
		}
	}

	this.addData = function(name, value) {
		if (!this.formData)
			this.formData = new FormData();

		this.formData.append(name, value);
	}

	// open url. url optional (no url:repeat). ms optional (ms:delay request)
	this.open = function (url, ms) {
		if (status == 1) // loading?
			self.stop();
		status = 0; // ready
		if (url) { // no url? repeat last one stored
			self.url = url;
			self.retries = 0; // reset retries
		}
		if (reqTimeout) {
			clearTimeout(reqTimeout);
			reqTimeout = null;
		}
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		if (ms) {
			reqTimeout = setTimeout(self.open, ms);
			return;
		}
		if (!req) self.init();

		status = 1; // loading
		if (self.onRequest)
			self.onRequest();
		try {
			req.open(self.method, self.url, true);
		} catch (err) {
			// If document is not fully active, throw an "InvalidStateError" exception and terminate the overall set of steps.
			// URL relative to base. If the algorithm returns an error, throw a "SyntaxError" exception and terminate these steps.
			onError(self.ERROR_GENERAL);
			return;
		}

		if (self.method == "GET") {
			//req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.send();
		} else {
			var boundary=Math.random().toString().substr(2);
			//req.setRequestHeader("content-type", "multipart/form-data; charset=utf-8;");
			req.send(self.formData);
		}

		// wait timeout
		if (self.maxWaitingTime) {
			waitTimeout = setTimeout(onWaitTimeout, self.maxWaitingTime);
		}
	}

	this.stop = function () {
		// on stop handler if loading, or about to load
		if (status == 1 || reqTimeout) {
			if (this.onStop)
				this.onStop(status == 1);
		}
		if (status == 1) { // loading
			status = -1; // stopped
			req.abort(); // will fire onReadyStateChange, status != 1, returns
			this.init(); // reinitialize req every time we abort
		}
		if (reqTimeout) {
			clearTimeout(reqTimeout);
			reqTimeout = null;
		}
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		status = 0; // ready
	}

	// repeat. ms delay before repeating
	this.repeat = function (ms) {
		this.open(null, ms);
	}

	function onWaitTimeout() {
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		status = -1; // aborted
		req.abort(); // will fire onReadyStateChange, status != 1, returns
		onError(self.ERROR_MAXWAITTIME);
		self.init(); // reinitialize req every time we abort
	}

	function onReadyStateChange() {
		// check readyState
		if (req.readyState == null) return; // does it ever happen?
		switch (req.readyState) {
		case 0: // unsent
		case 1: // open called, send not called
			//self.open(); // retry?
			return;
		case 2: // headers received, still receiving
		case 3: // loading
			return; // not ready
		case 4: // done, completed or error
			// continue
		}

		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}

		// loading? (if aborted it's -1)
		if (status != 1) return;
		status = 2;

		// not "OK"
		if (req.status != 200) {
			onError(req.status);
			return;
		}

		// clear form data
		self.formData = null;

		// get response text
		var res = "";
		try {
			res = req.responseText;
		} catch (err) {
			// If responseType is not the empty string or "text", throw an "InvalidStateError" exception.
			onError(self.ERROR_GENERAL);
			return;
		}

		if (self.onLoaded)
			self.onLoaded.call(self, req.status);
	}

	// called when uploading
	function onProgress(e) {
		if (self.onProgress)
			self.onProgress(e);
	}

	// on error. called for every error (but not on stop > abort)
	function onError(errCode) {
		// specific errors, if there's a custom handler it won't repeat automatically
		switch (errCode) {
		case self.ERROR_UNAUTHORIZED:
			if (self.onUnauthorized) {
				self.onUnauthorized();
				return;
			}
			break;
		}
		if (errCode >= 400 && self.onConnectionError) {
			self.onConnectionError();
			return;
		}
		// repeat?
		if (self.retryOnErrorDelay) {
			if (!self.maxRetries || self.retries < self.maxRetries) {
				self.retries++;
				if (self.onRetry) // before repeating, so we can change the retryOnErrorDelay
					self.onRetry();
				if (self.retryOnErrorDelay) {// could be changed by onRetry
					self.repeat(self.retryOnErrorDelay);
					return;
				}
			}
		}

		// clear form data
		self.formData = null;

		// no custom handlers, no (more) retries. generic error callback
		if (self.onError)
			self.onError(errCode);
	}

	// json getter
	this.getResponseJSON = function () {
		var res = this.getResponseText();
		if (res)
			return JSON.parse(res);
		else
			return null;
	}

	// text getter
	this.getResponseText = function () {
		var res = "";
		try {
			res = req.responseText;
			return res;
		} catch (err) { // If responseType is not the empty string or "text", throw an "InvalidStateError" exception.
			return null;
		}
	}

	// xml getter
	this.getResponseXML = function () {
		var res = "";
		try {
			res = req.responseXML;
			return res;
		} catch (err) { // If responseType is not the empty string or "document", throw an "InvalidStateError" exception.
			return null;
		}
	}

	// is loading?
	this.isReady = function () {
		return status != 1;
	}
};
