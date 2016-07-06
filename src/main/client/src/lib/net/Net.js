/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Sfera.Net handles browser URL related tasks such as checking host names, domain names and query string manipulation.
 *
 * @class Sfera.Net
 * @constructor
 */
Sfera.Net = new (function() {
    var req;

    var webSocket;
    var wsConnected = false;

    var httpConnected = false;

    var self = this;
    var httpBaseUrl = "/";
    var apiBaseUrl = "api/";

    var pingInterval;
    var responseTimeout;
    var connCheckTimeoutId;

    var cSync = ""; // currently synchronizing resource

    var self = this;

    var wsOptions = {
        // the number of milliseconds to delay before attempting to reconnect.
    	reconnectInterval: 50,
    	// the maximum number of milliseconds to delay a reconnection attempt.
    	maxReconnectInterval: 5000,
    	// the rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
    	reconnectDecay: 1.25,
    };
    var wsConnectTimeout;
    var wsTimeoutMs; // current timeout in ms

    var location = {};

    this.connectionId = null;
    this.stateTs = -1;
    this.subscribed = false; // change this

    // local timestamps, to check required updates
    this.localTs = {
        "dictionary": -1,
        "index": -1
    };

    this.remoteTs = {
        "dictionary": -1,
        "index": -1
    };

    // signals
    this.onOpen = new Sfera.Signal();
    this.onClose = new Sfera.Signal();
    this.onConnection = new Sfera.Signal();
    this.onMessage = new Sfera.Signal();
    this.onEvent = new Sfera.Signal();
    this.onReply = new Sfera.Signal();
    this.onConsole = new Sfera.Signal();
    this.onUpdateDictionary = new Sfera.Signal();
    this.onUpdateIndex = new Sfera.Signal();

    // getURL function
    this.getURL = function(name, options) {
        // options has priority
        if (!options)
            options = {};
        for (var i in location) {
            if (options[i] == null)
                options[i] = location[i];
        }
        options.connectionId = this.connectionId;
        options.stateTs = Sfera.client?Sfera.client.stateTs:null;

    	switch (name) {
    	case "dictionary":  return options.interface+(options.login?"/login":"")+"/dictionary.xml";
    	case "index" :      return options.interface+(options.login?"/login":"")+"/index.xml";

        case "connect" :    return apiBaseUrl+"connect";
    	case "subscribe" :  return apiBaseUrl+"subscribe?cid="+(options.connectionId?options.connectionId:"");
    	case "state" :      return apiBaseUrl+"state/"+options.connectionId+"?ts="+options.stateTs;
        case "command":     return apiBaseUrl+"command";
        case "event":       return apiBaseUrl+"event";

        case "websocket":   return (options.protocol == "https:" ? "wss:" : "ws:")+
                                    "//"+options.host+"/"+apiBaseUrl+"websocket";

        case "check":       return options.interface+"/login/index.xml";
        }
	};

    this.boot = function () {
        location = Sfera.Browser ? Sfera.Browser.getLocation() : {};
    };

    function onWsOpen(event) {
        // onopen gets called twice and the first time event.data is undefined. TODO:check
        //if (event.data === undefined)
        //    return;

        self.onOpen.dispatch(event.data);
        Sfera.Debug.log("ws open", event.data);
    }

    function onWsMessage(event) {
        if (event.data == "&") {
            Sfera.Debug.logNotice("ws ping");
            resetConnCheckTimeout();
            self.wsSend("&");
        } else {
            self.onMessage.dispatch(event.data);
            Sfera.Debug.log("ws msg", event.data);
            json = JSON.parse(event.data);

            // {"type":"event","events":{"remote.myvalue":"5","system.plugins":"reload","remote.":"undefined","system.state":"ready"}}
            switch (json.type) {
                case "reply":
                    self.onReply.dispatch(json);
                    break;
                case "connection":
                    if (!json.errors) {
                        // connection valid: reset timeout
                        clearTimeout(wsConnectTimeout);
                        wsTimeoutMs = null;

                        self.onConnection.dispatch(json);
                        self.connectionId = json.connectionId;
                        pingInterval = parseInt(json.pingInterval);
                        responseTimeout = parseInt(json.responseTimeout);
                        resetConnCheckTimeout();
                        wsConnected = true;
                    }
                    break;
                case "console":
                    self.onConsole.dispatch(json);
                    break;
                case "event":
                    self.onEvent.dispatch(json);
                    break;
            }
        }
    }

    function onWsError(event) {
        self.wsOpen (wsTimeoutMs); // reopen
    }

    function getWsCloseReason(code) {
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        switch (code) {
            case 1000:
                return  "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            case 1001:
                return  "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            case 1002:
                return  "An endpoint is terminating the connection due to a protocol error";
            case 1003:
                return  "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            case 1004:
                return  "Reserved. The specific meaning might be defined in the future.";
            case 1005:
                return  "No status code was actually present.";
            case 1006:
                return  "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            case 1007:
                return  "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
            case 1008:
                return  "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            case 1009:
                return  "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            case 1010:  // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                return  "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            case 1011:
                return  "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            case 1015:
                return  "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
        }
        return  "Unknown reason";
    }

    function onWsClose(event) {
        wsConnected = false;

        if (event.code != 1000) // normal closure
            Sfera.Debug.logError("ws closed", event.reason, event.code);
        else
            Sfera.Debug.log("ws closed", event.reason, event.code);

        //var reason = event.code + " - " + getWsCloseReason(event.code);

        self.onClose.dispatch(event.code,event.reason);

        if (event.reason == "Unauthorized" && Sfera.Login && !location.login) { //code 1008
            cSync = "check"; // check if login is available
            self.request(httpBaseUrl + self.getURL(cSync));
        } else {
            self.wsOpen (wsTimeoutMs); // reopen
        }
    }

    // public methods
    this.wsOpen  = function(wait) {
        if (wait) {
            clearTimeout(wsConnectTimeout);
            wsConnectTimeout = setTimeout(this.wsOpen.bind(this), wait);
            return;
        }

        var url = self.getURL("websocket");

        Sfera.Debug.log("ws opening on " + url);
        // ensure only one connection is open at a time
        if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
            Sfera.Debug.logError("websocket: is already opened");
            return;
        }
        // create a new instance of the websocket
        if (this.connectionId != null)
            url += "?cid="+this.connectionId;
        webSocket = new WebSocket(url);

        // associate events
        webSocket.onopen = onWsOpen;
        webSocket.onmessage = onWsMessage;
        webSocket.onclose = onWsClose;
        webSocket.onerror = onWsError;

        // wsTimeout
        updateWSTimeout();
    }
    this.wsSend = function(txt) {
        if (txt == "&")
            Sfera.Debug.logNotice("ws pong");
        else
            Sfera.Debug.log("ws send", txt);
        webSocket.send(txt);
    }
    this.wsClose = function() {
        webSocket.close();
    }

    function updateWSTimeout() {
        if (!wsTimeoutMs) {
            wsTimeoutMs = wsOptions.reconnectInterval;
        } else {
            wsTimeoutMs *= wsOptions.reconnectDecay;
            if (wsTimeoutMs > wsOptions.maxReconnectInterval)
                wsTimeoutMs = wsOptions.maxReconnectInterval;
        }
    }

    function resetConnCheckTimeout() {
        clearTimeout(connCheckTimeoutId);
        setTimeout(this.wsClose, pingInterval + responseTimeout);
    }
    // get current timestamp
    function getTimestamp() {
        return (new Date()).getTime();
    }

    // request resource
    this.request = function(url) {
        if (!req) {
            req = new Sfera.Net.Request()
            req.onLoaded = onReqLoaded;
            req.onError = onReqError;
        }

        req.open(url, 20);
    };

    // connect
    this.connect = function(options) {
        this.sync();
    }; // connect()

    // sync, if necessary
    this.sync = function() {
        for (var s in this.localTs) {
            if (this.localTs[s] == -1) { // || this.localTs[s] < this.remoteTs[s]) {
                cSync = s;
                this.request(httpBaseUrl + self.getURL(s));
                return; // one resource per time
            }
        }

        // use websockets?
        if (true) {
            self.wsOpen ();
            return;
        }

        if (!this.connectionId) {
            cSync = "connect";
            this.request(httpBaseUrl + self.getURL("connect"));
            return;
        }

        if (!this.subscribed) {
            cSync = "subscribe";

            this.request(httpBaseUrl + self.getURL("subscribe")+"&nodes=*");
            return;
        }

        cSync = "state";
        this.request(httpBaseUrl + self.getURL("state"));
    };

    function onReqLoaded() {
        Sfera.Debug.log(cSync + " loaded", "", req.getResponseText());

        if (self.localTs[cSync] != null)
            self.localTs[cSync] = getTimestamp();

        var state;

        switch (cSync) {
            case "dictionary":
                self.onUpdateDictionary.dispatch(req.getResponseXML())
                break;
            case "index":
                self.onUpdateIndex.dispatch(req.getResponseXML());
                break;

            case "connect":
                self.connectionId = req.getResponseJSON().cid;
                break;

            case "subscribe":
                self.subscribed = true;

            case "state":
                state = JSON.parse(req.getResponseText());
                if (state.timestamp)
                    self.stateTs = state.timestamp;
                break;

            // check if interface is available (load login index)
            case "check":
                Sfera.Login.gotoLogin();
                break;
        }

        self.sync();
    }

    function onReqError(errCode) {
        Sfera.Debug.logError("request error");
        if (errCode == 404)
            req.repeat(100);
    }

    this.nodeSubscribe = function (nodes) {
        var tag = (new Date()).getTime(); // request id
        var r = {
            action: "subscribe",
            nodes: nodes,
            tag: tag
        };

        this.wsSend(JSON.stringify(r));
    };

    /**
     * Returns the hostname given by the browser.
     *
     * @method Sfera.Net#getHostName
     * @return {string}
     */
    this.getHostName = function() {

        if (window.location && window.location.hostname) {
            return window.location.hostname;
        }

        return null;
    };

    this.sendCommand = function(req) {
        var r = {
            action: "command",
            cmd: req.command,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));
    };

    this.sendEvent = function(req) {
        var r = {
            action: "event",
            id: req.id,
            value: req.value,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));

    };

    this.sendConsole = function(req) {
        var r = {
            action: "console",
            cmd: req.command,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));

    };


})();
