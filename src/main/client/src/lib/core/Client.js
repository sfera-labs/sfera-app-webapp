/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * This is the main object of the interface.
 *
 * @class Sfera.Client
 * @constructor
 * @param {object} [config=null] - A configuration object containing parameters
 * @param {boolean} [config.debug=false] - Debug mode
 */
Sfera.Client = function(config) {
    // main reference
    Sfera.client = this;

    if (!config)
        config = {};

    /**
     * @property {string} name - interface name
     * @readonly
     */
    this.name = "";

    /**
     * @property {boolean} isLogin - are we on the login page?
     * @type {String}
     */
    this.isLogin = false;

    this.state = {
        booted: false,
        started: false,
        indexUpdated: false,
        firstEventReceived: false
    };

    /**
     * @property {Sfera.ComponentManager} - Reference to the component manager.
     */
    this.components = null;

    /**
     * @property {Sfera.Input} input - Reference to the input manager
     */
    this.input = null;

    /**
     * @property {Sfera.Utils.Debug} debug - Debug utilities.
     */
    this.debug = null;

    // current interface
    this.cInterface = null;

    // currently visible page
    this.cPage = null;

    var manifestTimestamp = 0;
    var self = this;

    // requests waiting for a reply
    var commandReqs = {};
    var eventReqs = {};

    // html elements
    var elements = {};

    // cache variables
    var cacheLoadedFiles = 0;
    var checkCacheInterval; // just to be sure, an interval to check if cache is ready
    var reloadCalled;

    /**
     * Initialize the client and start it.
     *
     * @method Sfera.Client#boot
     * @protected
     */
    this.boot = function(url) {
        if (this.state.booted)
            return;

        var location = Sfera.Browser.getLocation();

        this.name = location.interface;
        this.isLogin = location.login;

        if (config.timestamp)
            manifestTimestamp = config.timestamp;

        Sfera.client = this;

        this.state.booted = true;

        Sfera.Components.boot(); // init component classes

        this.components = new Sfera.ComponentManager(this);

        // get name
        this.name = config.interface;

        if (true || this.config.enableDebug) {
            this.debug = Sfera.Debug;
            this.debug.boot();
        }

        if (window.focus) {
            window.focus();
        }

        // get html elements
        var e = ["sfera", "loading", "cacheStatus", "cachePerc"];
        for (var i=0; i<e.length; i++) {
            elements[e[i]] = document.getElementById(e[i]);
        }

        Sfera.Debug.showHeader();

        // configure Sfera.Net
        Sfera.Net.boot();

		Sfera.Net.require(["dictionary", "index"]); // resources needed by the client

        Sfera.Net.onReply.add(onReply);
        Sfera.Net.onEvent.add(onEvent);
        Sfera.Net.onUpdateDictionary.add(onUpdateDictionary);
        Sfera.Net.onUpdateIndex.add(onUpdateIndex);
        Sfera.Net.onConnection.add(onConnection);
        Sfera.Net.onClose.add(onClose);

        Sfera.Net.connect();

        // window events
        window.onresize = adjustLayout;
        window.addEvent("keydown", window, onKeyDown);
        window.addEvent("keyup", window, onKeyUp);
        window.addEvent("keypress", window, onKeyPress);

        // loading events
        elements.loading.onmousedown =
        elements.loading.onmouseup =
        elements.loading.onmousemove = function (e) { Sfera.Browser.preventDefault(e); };

        //delete config;
    };

    /**
     * Destroys the Client, he deserved it.
     *
     * @method Sfera.Client#destroy
     */
    this.destroy = function() {
        this.input.destroy();

        this.input = null;
        this.isBooted = false;

        Sfera.CLIENTS[this.id] = null;
    };

    /**
     * Open an index, compile it and add it to the DOM
     *
     * @method Sfera.Client#openIndex
     * @property {string} URL - The Index URL.
     */
    this.openIndex = function(url, onDone) {
        // ???
    };

    this.openDictionary = function(url, onDone) {
        // ???
    };

    // Net callbacks

    function onConnection(json) {
        config.idleTimeout = json.idleTimeout;
        Sfera.Login.resetIdleTimeout();

        self.state.firstEventReceived = false;
        if (self.isLogin) {
            Sfera.Login.gotoInterface();
        } else {
            Sfera.Net.nodeSubscribe("*");
        }
    }

    function onClose() {
        if (!self.isLogin)
            self.showLoading(true);
    }

	// event or command replies
    function onReply(json) {
        if (json.result && json.result.uiSet) {
            for (var u in json.result.uiSet) {
                var n = u.split(".");
                var a = n.pop();
                var c = self.components.getById(n.join("."));
                for (var i = 0; i < c.length; i++) {
                    c[i].setAttribute(a, json.result.uiSet[u]);
                }
            }
        }
        switch (json.action) {
            case "command":
                if (commandReqs[json.tag]) {
                    if (commandReqs[json.tag].callback)
                        commandReqs[json.tag].callback(commandReqs[json.tag].cmd,
                            json.result);
                    delete commandReqs[json.tag];
                }
                break;
            case "event":
                if (eventReqs[json.tag]) {
                    if (eventReqs[json.tag].callback)
                        eventReqs[json.tag].callback(eventReqs[json.tag].id,
                            eventReqs[json.tag].value,
                            json.result);
                    delete eventReqs[json.tag];
                }
                break;
        }
    }

    function onUpdateDictionary(xmlDoc) {
        var root = Sfera.Compiler.compileDictionary(xmlDoc);
    }

    function onUpdateIndex(xmlDoc) {
        var root = Sfera.Compiler.compileXML(xmlDoc);
        elements.sfera.appendChild(root.element);

        self.cInterface = self.components.getByType("Interface")[0];
        self.cInterface.setAttribute("visible","false");

        self.state.indexUpdated = true;
        // whichever runs last, starts the interface. login is not connected, so it never receives the first event
        if (!self.state.started && (self.state.firstEventReceived || self.isLogin)) {
            self.start();
        }
    }

    this.start = function() {
        Sfera.Browser.start();

        this.cInterface.setAttribute("visible","true");

        adjustLayout();

        this.state.started = true;
        this.showLoading(false);

        if (Sfera.Custom.onReady)
            Sfera.Custom.onReady();
    };

    this.stop = function () {

    };

    this.indexComponent = function(component) {
        this.components.index(component);
    };

    this.setAttribute = function(id, name, value, silent) {
        var c = this.components.getById(id);
        for (var i = 0; i < c.length; i++)
            c[i].setAttribute(name, value, silent);
    };

    this.getAttribute = function(id, name) {
        var c = this.components.getFirstById(id); // get first onerror
        return c.getAttribute(name);
    };

    this.showPage = function(id) {
        if (id.indexOf(":") == -1)
            id = "page:" + id;

        // custom?
        if (Sfera.Custom.onPage && Sfera.Custom.onPage(id) === false)
            return; // false, skip

        if (this.cPage)
            this.cPage.setAttribute("visible", false);

        var p = this.components.getFirstById(id);
        if (p) {
            p.setAttribute("visible", true);
            this.cPage = p;
            var i = this.cInterface.getAttribute("title");
            var t = p.getAttribute("title");
            Sfera.Browser.updateUrl(id, (i ? i : 'Sfera') + (t ? " - " + t : ''));
        } else {
            if (this.isLogin)
                this.showPage("page:home");
            console.log("page not found: " + id);
        }
    };

    this.sendCommand = function(command, callback) {
        var tag = (new Date()).getTime();
        var req = {
            command: command,
            tag: tag,
            callback: callback
        };
        commandReqs[tag] = req;
        Sfera.Net.sendCommand(req);

        return tag;
    };

    this.sendEvent = function(id, value, callback) {
        if (!id) {
            Sfera.Debug.logError("sending event: id not valid");
            return;
        }

        var tag = (new Date()).getTime(); // request id
        var req = {
            id: "webapp.ui." + id,
            value: value,
            tag: tag,
            callback: callback
        };
        eventReqs[req] = req;
        Sfera.Net.sendEvent(req);

        return tag;
    };

    var nodeValues = {};

    this.getNodeValue = function(node) {
        return nodeValues[node] ? nodeValues[node] : "";
    };

    function onEvent(json) {
        for (var e in json.nodes) {
            // custom?
            if (Sfera.Custom.onEvent && Sfera.Custom.onEvent(e, json.nodes[e]) === false)
                continue; // false, skip

            var n = e.split(".");
            switch (n[0]) {
                case "ui":
                    if (n[1] == "set") { // ui.set.<global | cid>
                        n = n.slice(3); // remove ui, set, global | cid
                        var a = n.pop();
                        var c = self.components.getById(n.join("."));
                        for (var i = 0; i < c.length; i++) {
                            c[i].setAttribute(a, json.nodes[e]);
                        }
                    }
                    break;
                case "webapp":
                    //webapp.interface.new.update":1446813798521
                    if (n[1] == "interface" &&
                        n[2] == self.name &&
                        n[3] == "update") {
                        manifestTimestamp = json.nodes[e];
                        if (manifestTimestamp != config.timestamp) {
                            self.reload();
                        }
                    }
                    break;
            }

            // update local node values
            nodeValues[e] = json.nodes[e];

            // attribute observer
            if (attrObservers[e])
                attrObservers[e].dispatch();
        }

        self.state.firstEventReceived = true;
        // whichever runs last, starts the interface
        if (!self.state.started && self.state.indexUpdated) {
            self.start();
        } else {
            self.showLoading(false);
        }
    }

    function adjustLayout() {
        // not initialized yet
        if (!self.cInterface) return;

        var width = self.cInterface.getAttribute("width");
		var height = self.cInterface.getAttribute("height");

        // center container within window size
        var viewportWidth;
        var viewportHeight;

        if (window.innerWidth) {
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            viewportWidth = document.documentElement.clientWidth;
            viewportHeight = document.documentElement.clientHeight;
        } else if (document.body.clientWidth) {
            viewportWidth = document.body.clientWidth;
            viewportHeight = document.body.clientHeight;
        } else {
            viewportWidth = 0;
            viewportHeight = 0;
        }

        if (viewportWidth > 0) {
            var left = (viewportWidth > width) ? (viewportWidth - width) / 2 : 0;
            var top = (viewportHeight > height) ? (viewportHeight - height) / 2 : 0;

            self.cInterface.element.style.display = "none";
            self.cInterface.element.style.left = left + "px";
            self.cInterface.element.style.top = top + "px";
            self.cInterface.element.style.display = "block";
        } // viewportWidth>0

		// trigger event on component and all children
		function trigger(co) {
			if (co.onAdjust) {
				co.onAdjust();
			}

			if (co.children) {
				for (var c = 0; c < co.children.length; c++)
					trigger(co.children[c]);
			}
		}
		if (self.cPage)
			trigger(self.cPage);

    } // adjustLayout()

    var attrObservers = {};
    // attribute observers
    this.bindAttrObserver = function(node, attribute) {
        if (!attrObservers[node])
            attrObservers[node] = new Sfera.Signal();
        attrObservers[node].addOnce(attribute.compile, attribute);
    };
    this.removeAttrObserver = function(node, attribute) {
        attrObservers[node].remove(attribute.compile, attribute);
    };

    // events
    // on key down event
    function onKeyDown(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyDown) {
            if (!focusedCo.onKeyDown(evt, code)) {
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        } else {
            if (code == 9) {
                if (self.cPage.children.length)
                    focusFirst(self.cPage, evt.shiftKey); // get first or last
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        }

        return true;
    } // onKeyDown()

    function onKeyPress(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyPress) {
            if (!focusedCo.onKeyPress(evt, code)) {
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        }

        return true;
    }

    // on key up event
    function onKeyUp(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyUp) {
            if (focusedCo.onKeyUp(evt, code)) return true; // the event will go through
        }

        // the event won't go through, prevent
        Sfera.Browser.preventDefault(evt);
        return false;
    } // onKeyUp()

    ////////////////////////// focus
    var focusedCo;
    var blurTimeoutId;

    // set focused component, call onFocus
    this.setFocused = function(co) {
        if (focusedCo && focusedCo != co)
            focusedCo.blur();
        focusedCo = co;
        if (blurTimeoutId)
            clearTimeout(blurTimeoutId);
        if (!co.noBlurTimeout) // if noBlurTimeout = true, won't start the blur timeout
            blurTimeoutId = setTimeout(this.focus, 30000); // blur after a while
    };
    // clear focused component, call onBlur
    this.clearFocused = function(co) {
        if (focusedCo == co)
            focusedCo = null;
        if (blurTimeoutId)
            clearTimeout(blurTimeoutId);
    };

    // focus client
    this.focus = function() {
        if (focusedCo)
            focusedCo.blur();
    }; // focusProject()

    function canFocus(co) {
        return (co != this && co.focus && co.isVisible() && co.isEnabled());
    }

    // focus first component in container (start from the first or the last)
    function focusFirst(container, dir) {
        var l = container.children.length;
        var co = container.children[dir ? l - 1 : 0];
        if (co.isVisible()) {
            if (co.focus && co.isEnabled()) { // found
                co.focus();
                return co;
            } else if (co.children && co.children.length) { // container? look inside
                return focusFirst(co, dir);
            }
        }

        // couldn't focus, keep looking
        return focusNext(co);
    } // focusFirst()

    function focusNext(co, dir) {
        var cos = co.parent.children;
        var oi = -1;
        var i;
        var r; // result
        // search this co index
        for (i = 0; i < cos.length; i++) {
            if (cos[i] == co) {
                oi = i;
                break;
            }
        }

        if (oi == -1) return null; // is it even possible?
        i = oi; // start from next
        do {
            if (dir) {
                i--;
                if (i < 0) {
                    // in a container? check parent
                    if (co.parent.parent) {
                        r = focusNext(co.parent, dir);
                        if (r) return r; // no need to focus again
                    }
                    i = cos.length - 1; // restart from last
                }
            } else {
                i++;
                if (i >= cos.length) {
                    // in a container? check parent
                    if (co.parent.parent) {
                        r = focusNext(co.parent, dir);
                        if (r) return r; // no need to focus again
                    }
                    i = 0; // restart from 0
                }
            }
            // container? go inside
            if (cos[i].children && cos[i].children.length) {
                r = focusFirst(cos[i], dir); // get first or last
                if (r) return r; // no need to focus again
            }
            // has focus function? can focus?
            if (canFocus(cos[i])) {
                cos[i].focus();
                return cos[i];
            }
        } while (cos[i] != co); // go round once
        return null; // no next coect found (co wasn't focusable?)
    } // focusNext()

    this.focusNext = function(dir) {
        return focusNext(focusedCo, dir);
    };

    /////////////////////// connecting
    this.showLoading = function (show) {
        elements.loading.style.display = show?"inline":"none";
    };

    //--------------------------------------------------------------------------------------------------------------------------------
	// reload, cache -----------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------

    this.showCachePercentage = function (perc) {
        elements.cacheStatus.style.display = perc?"inline":"none";
        elements.cachePerc.innerHTML = perc?perc+"%":"";
    };

	// reload, cache
	this.reload = function (now) {
		if (reloadCalled) return;
		reloadCalled = true; // so we can call it just once

		if (!now && window.applicationCache && window.applicationCache.status != window.applicationCache.UNCACHED) {
			if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
				checkCache();
			} else {
				checkCacheInterval = setInterval(checkCache,500);
				window.addEvent("updateready", window.applicationCache, checkCache, false);
				window.addEvent("error", window.applicationCache, onCacheError, false);
				window.addEvent("progress", applicationCache, cacheProgressEvent, false);
				cacheLoadedFiles = 0;
				window.applicationCache.update();
			}
		} else if (!this.cInterface.getAttribute("autoReload")) { // no autoreload, needs to be reloaded manually
			config.timestamp = manifestTimestamp;
			reloadCalled = false;
		} else { // reload now
			client.stop();
			//client.clearCookies();
			Sfera.Browser.reload();
		}
	}; // reload()

	// cache progress event
	function cacheProgressEvent(e) {
		if (e != null) try {
			// update the percent
			totalFiles = Number(e.total);
			cacheLoadedFiles = cacheLoadedFiles + 1;
			var progress = Math.round(cacheLoadedFiles / totalFiles * 100);

			self.showCachePercentage(progress);
		} catch (err) {}
	} // cacheProgressEvent()

	// check cache to see if we're ready to reload
	function checkCache() {
		// done
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY ||
			window.applicationCache.status == window.applicationCache.IDLE) {
			clearInterval(checkCacheInterval);
			//var weirdErr;
			try {
				window.applicationCache.swapCache();
			} catch (err) {
				console.log("Error on swapCache "+err.message);
				//weirdErr = (err.message == "Failed to execute 'swapCache' on 'ApplicationCache': there is no newer application cache to swap to.");
			}
			if (!self.cInterface.getAttribute("autoReload")) { // no autoreload, needs to be reloaded manually
				config.timestamp = manifestTimestamp;
				reloadCalled = false;
				statusIcon.set("cache",false);
			} else { // reload now
				client.stop();
				//client.clearCookies();
				Sfera.Browser.reload(true);
			}
		} else if (window.applicationCache.status == window.applicationCache.OBSOLETE) {
			// correct behaviour?
			onCacheError();
		}
	} // checkCache()

	// cache error
	function onCacheError() {
		clearInterval(checkCacheInterval);
		reloadCalled = false;
		self.reload();
	} // onCacheError()

};
