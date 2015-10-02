/*! sfera-webapp - v0.0.2 - 2015-10-02 */

(function(){

    var root = this;


/**
* @namespace Sfera
*/
var Sfera = Sfera || {

    /**
    * The Sfera version number.
    * @constant
    * @type {string}
    */
    VERSION: '0.1.0',

    /**
    * Sfera client instance.
    * @constant
    * @type {array}
    */
    CLIENT: []

};


/**
 * Sfera.Compiler compiles components into DOM
 *
 * @class Sfera.Compiler
 * @constructor
 * @param {Sfera.Client} client - A reference to the currently running client.
 */
Sfera.Compiler = function(client) {

    this.client = client;

    function getComments(context) {
        var foundComments = [];
        var elementPath = [context];
        while (elementPath.length > 0) {
            var el = elementPath.pop();
            for (var i = 0; i < el.childNodes.length; i++) {
                var node = el.childNodes[i];
                if (node.nodeType === 8) {
                    foundComments.push(node);
                } else {
                    elementPath.push(node);
                }
            }
        }

        return foundComments;
    }


// first time compiling an element.
// if it finds <!-- sml, replace it with elements
// add on each element main div data-controller="Link" (added automatically when compiling any component?)
// set composed = true
// SAVE new source and composed
//
// when assigning the controller, if composed, browse the html to assign controllers

    /**
     * Create component instance.
     * @param  {[type]} name       [description]
     * @param  {[type]} properties [description]
     * @return {[type]}            [description]
     */
    this.createComponent = function (name, properties) {
        /*
        if (src.indexOf("<!--sml") != -1) {
            var comments = getComments(newDiv);
            if (comments && comments.length) {
                // replace with components
            }
        }
        */

        var component = Sfera.Components.getInstance(name, properties);
        return component;
    }

    this.compileXMLNode = function (xmlNode) {
        if (xmlNode.nodeType == 1) { // 1 = element
            var i,a;
            var attrs = {};
            for (i=0; i<xmlNode.attributes.length; i++) {
                a = xmlNode.attributes[i];
                attrs[a.name] = a.value;
            }

            var component = this.createComponent(xmlNode.nodeName, attrs);

            // add to the index
            client.indexComponent(component);

            var child;
            var c = xmlNode.childNodes;

            for (i=0; i<c.length; i++) {
                child = this.compileXMLNode(c[i]);
                if (child)
                    component.addChild(child);
            }

            return component;
        }
        return null;
    }

    /**
     *
     */
    this.compileXML = function (xmlDoc) {
        return this.compileXMLNode(xmlDoc.documentElement);
    };

    this.compileString = function(xmlStr) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");

        this.compileXML(xmlDoc);
    };

    this.compileDictionary = function (xmlDoc) {
        var xmlNode = xmlDoc.documentElement;
        if (xmlNode && xmlNode.nodeType == 1) { // 1 = element
            var c = xmlNode.childNodes;
            var n,i;
            for (i=0; i<c.length; i++) {
                if (c[i].nodeType == 1) {
                    Sfera.Components.setSource(c[i].tagName, Sfera.Utils.getCDATA(c[i]));
                }
            }
        }
    };

};


/**
* Sfera.ComponentManager holds current client's components
*
* @class Sfera.ComponentManager
* @constructor
*/
Sfera.ComponentManager = function (client) {

    this.client = client;

	var components = new function () {
		// pointers to all components
		this.all = [];

		// pointers to components. {id:[ ... ], ...}
		var byId = {};
		var byAddress = {};
		var byType = {};

		// generic add by function. object, which array (byId, byAddress..), attribute (id, address..)
		function addBy(o,arr,attr) {
			if (!arr[o[attr]]) // ex. byId["dummy.1"]
				arr[o[attr]] = [];
			arr[o[attr]].push(o);
		}

		// generic get by function
		function getBy(arr,value) {
			return (arr[value]?arr[value]:[]); // if no array return an empty one
		}

		// add object by ..
		this.add = function (o) {
			this.all.push(o);
			addBy(o,byType,"type");
			if (o.id)		addBy(o,byId,"id");
			if (o.address)	addBy(o,byAddress,"address");
		}

		// get components by ..
		this.getByType = function (type) { return getBy(byType,type); }
		this.getByAddress = function (address) { return getBy(byAddress,address); }
		this.getById = function (id) { return getBy(byId,id); }
	}; // components

	// index component
	this.index = function (o) {
		components.add(o);
	}

	// get single object (first) by id
	this.getObjById = function (id) {
		return components.getById(id)[0];
	}

	// get components by id
	this.getObjsById = function (id) {
		return components.getById(id);
	}

	// get components by type
	this.getObjsByType = function (type) {
		return components.getByType(type);
	}

	// get value from single object (first) by id
	this.getObjValue = function (id) {
		var o = components.getById(id)[0];
		return o && o.getValue?o.getValue():null;
	}

	// get fav pages (for app)
	this.getFavPages = function () {
		var pages = [];
		var links = this.getObjsByType("link");
		for (var i=0; i<links.length; i++)
			 pages.push(links[i].target);

		pages = pages.unique().sort();

		return pages;
	}

};


/**
* Sfera.Components singleton that handles components
*
* @namespace Sfera.Components
*/
Sfera.Components = new function () {

    this.setSource = function (componentName, source) {
        var cc = this.getClass(componentName);
        cc.prototype.source = source;
    };

    this.getClassName = function (componentName) {
        return componentName[0].toUpperCase() + componentName.substr(1);
    };

    this.getClass = function (componentName) {
        return Sfera.Components[this.getClassName(componentName)];
    };

    this.getInstance = function(componentName, properties) {
        // component class
        var cc = this.getClass(componentName);

        // no component with that name
        if (cc == null)
            return null;

        var component = new cc(properties);

        if (component.source) {
            // DOM
            var d = document.createElement("div");
            d.innerHTML = component.source;

            component.element = Sfera.Utils.getFirstChildNodeOfType(d, 1);
            component.element.controller = component;

            component.element.setAttribute("data-controller",componentName);
            component.element.setAttribute("data-id",component.id);

            // TODO: get children components
            // fastest way.. parse the whole html code and then dig through and associate?
            // also for composed components, save the html the first time you dig through, to optimize
        }

        component.init();

        return component;
    };


};

var Test = function () {
    var str;

    //str = '<div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/arkane-studios/" rel="tag">Arkane Studios</a>, <a href="http://www.rockpapershotgun.com/tag/bethesda/" rel="tag">Bethesda</a>, <a href="http://www.rockpapershotgun.com/tag/dishonored/" rel="tag">Dishonored</a>, <a href="http://www.rockpapershotgun.com/tag/dishonored-2/" rel="tag">Dishonored 2</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.com/2015/09/17/dishonored-2-karnaca/#comments" title="Comment on Southland Tales: Dishonored 2&#8217;s Sun-Scorched Bloodflies">21 Comments &#187;</a></p> </footer> </div> </div> <div id="post-314999" class="block featured-block"> <p class="featured-block-title"> <a class="featured-block__text featured-block__text--feature" href="http://www.rockpapershotgun.com/category/featured-articles">RPS Feature</a> It's a number one. </p> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/" rel="bookmark" title="Permanent Link to Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See">Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#472d61647676767c2f61647676777c616471737c352861647e7e7c61647677707c61647676757c61647e707c61647676757c2261647676737c61647676727c616476X04;ot&#103;un.c&#111;&#109;">John Walker</a> on September 17th, 2015 at 5:00 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/"><span>Twitter</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see//"><span>Reddit</span></a></li> </ul> </div> </div> <p><a href="http://www.rockpapershotgun.com/images/15/sep/albt1b.jpg" rel="lightbox[314999]"><img src="http://www.rockpapershotgun.com/images/15/sep/albt1.jpg" alt=""/></a></p> <p><em>I&#8217;m really getting the hang of these headlines, I think. In <a href="http://www.rockpapershotgun.com/2015/09/15/albino-lullaby-review/">my review of Albino Lullaby</a> this week, I included a throwaway line that I then didn&#8217;t justify in pictorial form. I wrote that it features, &#822#8220;the best toilet in gaming history.&#8221; You can&#8217;t just say a thing like that and expect not to be required to prove it. I think the image above has already done that, but there are more, just in case &#8211; click on them to appreciate them fully.</em></p> <p> <a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/#more-314999" class="more-link">Read the rest of this entry &raquo;</a></p> </div> <footer class="article-footer"> <div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/albino-lullaby/" rel="tag">Albino Lullaby</a>, <a href="http://www.rockpapershotgun.com/tag/ape-law/" rel="tag">Ape Law</a>, <a href="http://www.rockpapershotgun.com/tag/feature/" rel="tag">feature</a>, <a href="http://www.rockpapershotgun.com/tag/toilets-in-games/" rel="tag">toilets-in-games</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/#comments" title="Comment on Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See">20 Comments &#187;</a></p> </footer> </div> </div> <div id="post-315221" class="block featured-block"> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/" rel="bookmark" title="Permanent Link to Warhammer 40,000: Deathwatch Crusading Onto PC">Warhammer 40,000: Deathwatch Crusading Onto PC</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#e584c3c6d4d5ddde8cc3c6dcdcde80c3c6d3d1dec3c6d4d4d1dec3c6d4d4d4de86c3c6d4d5d2dec3c6d4d4d7de8495c3c6d4d5d4de97c3c6d4d4d0dec3c6d4d5d1deXo&#116;gu&#110;&#46;&#99;o&#109;">Alice O'Connor</a> on September 17th, 2015 at 4:11 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Warhammer 40,000: Deathwatch Crusading Onto PC http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/"><span>Twitter</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc//"><span>Reddit</span></a></li> </ul> </div> </div> <p><img src="http://www.rockpapershotgun.com/images/15/sep/17wh40kdeathwatch.jpg" title="Aye, a can of Raid won't solve this one."/></p> <p>The Warhammer 40,000 game I&#8217;d really like is still <a href="http://www.rockpapershotgun.com/2015/07/14/dawn-of-war-3-rumours/">Dawn of War 3</a>, but in the meantime I shall need to investigate other opportunities to wear a big ole skull on my crotch.</p> <p>Rodeo Games, the folks behind <a href="http://www.rockpapershotgun.com/tag/warhammer-quest/">Warhammer Quest</a>, have announced that they&#8217;re bringing another mobile doodad over to PC a little fancied up, and this one has all the crotchskulls I demand &#8211; Warhammer 40,000: Deathwatch [<a href="http://rodeogames.co.uk/deathwatch">official site</a>]. It&#8217;s a turn-based tactical affair about hunting down and squishing those naughty Tyranids, from cities to the guts of bio-ships, while expanding, levelling up, and equipping your Deathwatch Kill Team.</p> <p> <a href="http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/#more-315221" class="more-link">Read the rest of this entry &raquo;</a></p> </div> <footer class="article-footer"> <div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/rodeo-games/" rel="tag">Rodeo Games</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000/" rel="tag">Warhammer 40000</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000-deathwatch/" rel="tag">Warhammer 40000: Deathwatch</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000-deathwatch-enhanced-edition/" rel="tag">Warhammer 40000: Deathwatch - Enhanced Edition</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.{{that is}}com/2015/09/17/warhammer-40k-deathwatch-pc/#comments" title="Comment on Warhammer 40,000: Deathwatch Crusading Onto PC">10 Comments &#187;</a></p> </footer> </div> </div> <div id="post-299851" class="block featured-block"> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate/" rel="bookmark" title="Permanent Link to Have You Played&#8230; Kyrandia 2: Hand Of Fate?">Have You Played&#8230; Kyrandia 2: Hand Of Fate?</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#91b7b2a0a0a5aab7b2a0a1a4aab7b2a8a8aab7b2a0a1a5aaf0b7b2a0a0a5aaf5b7b2a7a5aae3feb7b2a8a8aafab7b2a0a0a3aaf0b7b2a0a0a3aab7b2a0a1a0aab7b2X114;&#115;hot&#103;un.&#99;&#111;&#109;">Richard Cobbett</a> on September 17th, 2015 at 3:00 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Have You Played&#8230; Kyrandia 2: Hand Of Fate? http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate/"><span>{{this is}}</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate//"><span>Reddit</span></a></li> </ul> </div> </div>';

    str = '<div>{{one}}</div><p></p><br /><div>{{two}}</div>';
    var MUSTACHE = /\{\{([^}]*)\}\}/;

    str = '<div><!--sfera><--!></div><p></p><br /><div>{{two}}</div>';

    function myRep(what) {
        switch (what) {
        case "one":
            return "1";
            break;
        case "two":
            return "2";
            break;
        }

        return "";
    }


    str.replace(MUSTACHE, function (match, capture) { return myRep(capture); }); // return 'gold ' + capture + '|' + match; "gold ring|string"


}


/**
* This is the main object of Sfera.
*
* @class Sfera.Client
* @constructor
* @param {object} [config=null] - A configuration object containing parameters
* @param {boolean} [config.debug=false] - Debug mode
*/
Sfera.Client = function (config) {

	Sfera.client = this;

	/**
	* @property {object} config - The Sfera.Client configuration object.
	*/
	this.config = null;

	/**
	* @property {boolean} isBooted - Is the client booted?
	* @readonly
	*/
	this.isBooted = false;

	/**
	* @property {boolean} isRunning - Is the client running or paused?
	* @readonly
	*/
	this.isRunning = false;

	/**
	* @property {Sfera.Device} device - Reference to the device manager
	*/
	this.device = null;

	/**
	* @property {Sfera.Net} net - Reference to the network manager.
	*/
	this.net = null;

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

	// Is the client paused?
    this._paused = false;

	// Default settings
    var _defaultConfig = {
        /** Whether this instance should log debug messages. */
        enableDebug: true,

        /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
        automaticOpen: true,

        /** The number of milliseconds to delay before attempting to reconnect. */
        reconnectInterval: 1000,
        /** The maximum number of milliseconds to delay a reconnection attempt. */
        maxReconnectInterval: 30000,
        /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
        reconnectDecay: 1.5,

        /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
        timeoutInterval: 2000,

        /** The maximum number of reconnection attempts to make. Unlimited if null. */
        maxReconnectAttempts: null
    };

    if (!config) { config = {}; }

    // Overwrite and define settings with options if they exist.
    for (var key in config) {
        if (typeof config[key] !== 'undefined') {
            this[key] = defaultConfig[key];
        } else {
            this[key] = config[key];
        }
    }

	this.device = Sfera.Device;
	this.device.whenReady(this.boot, this);

	return this;
};


Sfera.Client.prototype = {
	/**
    * Initialize the client and start it.
    *
    * @method Sfera.Client#boot
    * @protected
    */
	boot: function () {
		if (this.isBooted) {
			return;
		}

		this.isBooted = true;

		this.net = new Sfera.Net(this);

		this.compiler = new Sfera.Compiler(this);

		this.components = new Sfera.ComponentManager(this);

		if (false && this.config.enableDebug) {
			this.debug = new Sfera.Debug(this);
			this.debug.boot();
		} else {

		}

		if (window.focus) {
            window.focus();
        }

		this.showDebugHeader();
	},

	/**
    * Displays a Sfera version debug header in the console.
    *
    * @method Sfera.Client#showDebugHeader
    * @protected
    */
    showDebugHeader: function () {

        var v = Sfera.VERSION;

		var c = 2;
		var a = "hello";

        if (this.device.chrome) {
            var args = [
                '%c %c %c Sfera v' + v + ' | ' + a + '  %c %c ' + '%c http://sfera.cc %c\u2665%c\u2665%c\u2665',
                'background: #9854d8',
                'background: #6c2ca7',
                'color: #ffffff; background: #450f78;',
                'background: #6c2ca7',
                'background: #9854d8',
                'background: #ffffff'
            ];

            for (var i = 0; i < 3; i++) {
                if (i < c) {
                    args.push('color: #ff2424; background: #fff');
                } else {
                    args.push('color: #959595; background: #fff');
                }
            }

            console.log.apply(console, args);
        }
		else if (window.console) {
            console.log('Sfera v' + v + ' | ' + a + ' | http://sfera.cc');
        }

    },

    /**
    * Destroys the Client. Don't cry for him, he'll be back.
    *
    * @method Sfera.Client#destroy
    */
	destroy: function () {

        this.input.destroy();

        this.input = null;
        this.isBooted = false;

		Sfera.CLIENTS[this.id] = null;

    },

	/**
	* Open an index, compile it and add it to the DOM
	*
	* @method Sfera.Client#openIndex
	* @property {string} URL - The Index URL.
	*/
	openIndex: function (url, onDone) {
		var req = new Sfera.Net.Request();

		var self = this;
		req.onLoaded = function (req) {
			var root = self.compiler.compileXML(req.getResponseXML());
			document.getElementById("sfera").appendChild(root.element);
			if (onDone)
				onDone();
		};
		req.open(url);
	},

	openDictionary: function (url, onDone) {
		var req = new Sfera.Net.Request();

		var self = this;
		req.onLoaded = function (req) {
			var root = self.compiler.compileDictionary(req.getResponseXML());
			if (onDone)
				onDone();
		};
		req.open(url);
	},

	indexComponent: function (component) {
		this.components.index(component);
	},

	setProperty: function (id, name, value) {
		var c = this.components.getObjsById(id);
		for (var i=0; i<c.length; i++)
			c[i].setProperty(name, value);
	},

	cPage: null,

	showPage: function (id) {
		if (id.indexOf(":")==-1)
			id = "page:"+id;

		if (this.cPage)
			this.cPage.setProperty("visible", false);

		var p = this.components.getObjById(id);
		if (p) {
			p.setProperty("visible", true);
			this.cPage = p;
		}
	}

};

Sfera.Client.prototype.constructor = Sfera.Client;


/**
* A Signal is an event dispatch mechanism that supports broadcasting to multiple listeners.
*
* Event listeners are uniquely identified by the listener/callback function and the context.
*
* @class Sfera.Signal
* @constructor
*/
Sfera.Signal = function () {
};

Sfera.Signal.prototype = {

    /**
    * @property {?Array.<Sfera.SignalBinding>} _bindings - Internal variable.
    * @private
    */
    _bindings: null,

    /**
    * @property {any} _prevParams - Internal variable.
    * @private
    */
    _prevParams: null,

    /**
    * Memorize the previously dispatched event?
    *
    * If an event has been memorized it is automatically dispatched when a new listener is added with {@link #add} or {@link #addOnce}.
    * Use {@link #forget} to clear any currently memorized event.
    *
    * @property {boolean} memorize
    */
    memorize: false,

    /**
    * @property {boolean} _shouldPropagate
    * @private
    */
    _shouldPropagate: true,

    /**
    * Is the Signal active? Only active signals will broadcast dispatched events.
    *
    * Setting this property during a dispatch will only affect the next dispatch. To stop the propagation of a signal from a listener use {@link #halt}.
    *
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * @property {function} _boundDispatch - The bound dispatch function, if any.
    * @private
    */
    _boundDispatch: true,

    /**
    * @method Sfera.Signal#validateListener
    * @param {function} listener - Signal handler function.
    * @param {string} fnName - Function name.
    * @private
    */
    validateListener: function (listener, fnName) {

        if (typeof listener !== 'function')
        {
            throw new Error('Sfera.Signal: listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
        }

    },

    /**
    * @method Sfera.Signal#_registerListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {boolean} isOnce - Should the listener only be called once?
    * @param {object} [listenerContext] - The context under which the listener is invoked.
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0).
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    _registerListener: function (listener, isOnce, listenerContext, priority, args) {

        var prevIndex = this._indexOfListener(listener, listenerContext);
        var binding;

        if (prevIndex !== -1)
        {
            binding = this._bindings[prevIndex];

            if (binding.isOnce() !== isOnce)
            {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        }
        else
        {
            binding = new Sfera.SignalBinding(this, listener, isOnce, listenerContext, priority, args);
            this._addBinding(binding);
        }

        if (this.memorize && this._prevParams)
        {
            binding.execute(this._prevParams);
        }

        return binding;

    },

    /**
    * @method Sfera.Signal#_addBinding
    * @private
    * @param {Sfera.SignalBinding} binding - An Object representing the binding between the Signal and listener.
    */
    _addBinding: function (binding) {

        if (!this._bindings)
        {
            this._bindings = [];
        }

        //  Simplified insertion sort
        var n = this._bindings.length;

        do {
            n--;
        }
        while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);

        this._bindings.splice(n + 1, 0, binding);

    },

    /**
    * @method Sfera.Signal#_indexOfListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {object} [context=null] - Signal handler function.
    * @return {number} The index of the listener within the private bindings array.
    */
    _indexOfListener: function (listener, context) {

        if (!this._bindings)
        {
            return -1;
        }

        if (context === undefined) { context = null; }

        var n = this._bindings.length;
        var cur;

        while (n--)
        {
            cur = this._bindings[n];

            if (cur._listener === listener && cur.context === context)
            {
                return n;
            }
        }

        return -1;

    },

    /**
    * Check if a specific listener is attached.
    *
    * @method Sfera.Signal#has
    * @param {function} listener - Signal handler function.
    * @param {object} [context] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    * @return {boolean} If Signal has the specified listener.
    */
    has: function (listener, context) {

        return this._indexOfListener(listener, context) !== -1;

    },

    /**
    * Add an event listener for this signal.
    *
    * An event listener is a callback with a related context and priority.
    *
    * You can optionally provide extra arguments which will be passed to the callback after any internal parameters.
    *
    * For example: `Sfera.Key.onDown` when dispatched will send the Sfera.Key object that caused the signal as the first parameter.
    * Any arguments you've specified after `priority` will be sent as well:
    *
    * `fireButton.onDown.add(shoot, this, 0, 'lazer', 100);`
    *
    * When onDown dispatches it will call the `shoot` callback passing it: `Sfera.Key, 'lazer', 100`.
    *
    * Where the first parameter is the one that Key.onDown dispatches internally and 'lazer',
    * and the value 100 were the custom arguments given in the call to 'add'.
    *
    * @method Sfera.Signal#add
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    add: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'add');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, false, listenerContext, priority, args);

    },

    /**
    * Add a one-time listener - the listener is automatically removed after the first execution.
    *
    * If there is as {@link Sfera.Signal#memorize memorized} event then it will be dispatched and
    * the listener will be removed immediately.
    *
    * @method Sfera.Signal#addOnce
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    addOnce: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'addOnce');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, true, listenerContext, priority, args);

    },

    /**
    * Remove a single event listener.
    *
    * @method Sfera.Signal#remove
    * @param {function} listener - Handler function that should be removed.
    * @param {object} [context=null] - Execution context (since you can add the same handler multiple times if executing in a different context).
    * @return {function} Listener handler function.
    */
    remove: function (listener, context) {

        this.validateListener(listener, 'remove');

        var i = this._indexOfListener(listener, context);

        if (i !== -1)
        {
            this._bindings[i]._destroy(); //no reason to a Sfera.SignalBinding exist if it isn't attached to a signal
            this._bindings.splice(i, 1);
        }

        return listener;

    },

    /**
    * Remove all event listeners.
    *
    * @method Sfera.Signal#removeAll
    * @param {object} [context=null] - If specified only listeners for the given context will be removed.
    */
    removeAll: function (context) {

        if (context === undefined) { context = null; }

        if (!this._bindings)
        {
            return;
        }

        var n = this._bindings.length;

        while (n--)
        {
            if (context)
            {
                if (this._bindings[n].context === context)
                {
                    this._bindings[n]._destroy();
                    this._bindings.splice(n, 1);
                }
            }
            else
            {
                this._bindings[n]._destroy();
            }
        }

        if (!context)
        {
            this._bindings.length = 0;
        }

    },

    /**
    * Gets the total number of listeners attached to this Signal.
    *
    * @method Sfera.Signal#getNumListeners
    * @return {integer} Number of listeners attached to the Signal.
    */
    getNumListeners: function () {

        return this._bindings ? this._bindings.length : 0;

    },

    /**
    * Stop propagation of the event, blocking the dispatch to next listener on the queue.
    *
    * This should be called only during event dispatch as calling it before/after dispatch won't affect another broadcast.
    * See {@link #active} to enable/disable the signal entirely.
    *
    * @method Sfera.Signal#halt
    */
    halt: function () {

        this._shouldPropagate = false;

    },

    /**
    * Dispatch / broadcast the event to all listeners.
    *
    * To create an instance-bound dispatch for this Signal, use {@link #boundDispatch}.
    *
    * @method Sfera.Signal#dispatch
    * @param {any} [params] - Parameters that should be passed to each handler.
    */
    dispatch: function () {

        if (!this.active || !this._bindings)
        {
            return;
        }

        var paramsArr = Array.prototype.slice.call(arguments);
        var n = this._bindings.length;
        var bindings;

        if (this.memorize)
        {
            this._prevParams = paramsArr;
        }

        if (!n)
        {
            //  Should come after memorize
            return;
        }

        bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
        this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

        //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
        //reverse loop since listeners with higher priority will be added at the end of the list
        do {
            n--;
        }
        while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);

    },

    /**
    * Forget the currently {@link Sfera.Signal#memorize memorized} event, if any.
    *
    * @method Sfera.Signal#forget
    */
    forget: function() {

        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * Dispose the signal - no more events can be dispatched.
    *
    * This removes all event listeners and clears references to external objects.
    * Calling methods on a disposed objects results in undefined behavior.
    *
    * @method Sfera.Signal#dispose
    */
    dispose: function () {

        this.removeAll();

        this._bindings = null;
        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * A string representation of the object.
    *
    * @method Sfera.Signal#toString
    * @return {string} String representation of the object.
    */
    toString: function () {

        return '[Sfera.Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';

    }

};

/**
* Create a `dispatch` function that maintains a binding to the original Signal context.
*
* Use the resulting value if the dispatch function needs to be passed somewhere
* or called independently of the Signal object.
*
* @memberof Sfera.Signal
* @property {function} boundDispatch
*/
Object.defineProperty(Sfera.Signal.prototype, "boundDispatch", {

    get: function () {
        var _this = this;
        return this._boundDispatch || (this._boundDispatch = function () {
            return _this.dispatch.apply(_this, arguments);
        });
    }

});

Sfera.Signal.prototype.constructor = Sfera.Signal;


/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
*
* @class Sfera.SignalBinding
* @constructor
* @param {Sfera.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
Sfera.SignalBinding = function (signal, listener, isOnce, listenerContext, priority, args) {

    /**
    * @property {Sfera.Game} _listener - Handler function bound to the signal.
    * @private
    */
    this._listener = listener;

    if (isOnce)
    {
        this._isOnce = true;
    }

    if (listenerContext != null) /* not null/undefined */
    {
        this.context = listenerContext;
    }

    /**
    * @property {Sfera.Signal} _signal - Reference to Signal object that listener is currently bound to.
    * @private
    */
    this._signal = signal;

    if (priority)
    {
        this._priority = priority;
    }

    if (args && args.length)
    {
        this._args = args;
    }

};

Sfera.SignalBinding.prototype = {

    /**
    * @property {?object} context - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    */
    context: null,

    /**
    * @property {boolean} _isOnce - If binding should be executed just once.
    * @private
    */
    _isOnce: false,

    /**
    * @property {number} _priority - Listener priority.
    * @private
    */
    _priority: 0,

    /**
    * @property {array} _args - Listener arguments.
    * @private
    */
    _args: null,

    /**
    * @property {number} callCount - The number of times the handler function has been called.
    */
    callCount: 0,

    /**
    * If binding is active and should be executed.
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute` (curried parameters).
    * @property {array|null} params
    * @default
    */
    params: null,

    /**
    * Call listener passing arbitrary parameters.
    * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
    * @method Sfera.SignalBinding#execute
    * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
    * @return {any} Value returned by the listener.
    */
    execute: function(paramsArr) {

        var handlerReturn, params;

        if (this.active && !!this._listener)
        {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;

            if (this._args)
            {
                params = params.concat(this._args);
            }

            handlerReturn = this._listener.apply(this.context, params);

            this.callCount++;

            if (this._isOnce)
            {
                this.detach();
            }
        }

        return handlerReturn;

    },

    /**
    * Detach binding from signal.
    * alias to: @see mySignal.remove(myBinding.getListener());
    * @method Sfera.SignalBinding#detach
    * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
    */
    detach: function () {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
    },

    /**
    * @method Sfera.SignalBinding#isBound
    * @return {boolean} True if binding is still bound to the signal and has a listener.
    */
    isBound: function () {
        return (!!this._signal && !!this._listener);
    },

    /**
    * @method Sfera.SignalBinding#isOnce
    * @return {boolean} If SignalBinding will only be executed once.
    */
    isOnce: function () {
        return this._isOnce;
    },

    /**
    * @method Sfera.SignalBinding#getListener
    * @return {function} Handler function bound to the signal.
    */
    getListener: function () {
        return this._listener;
    },

    /**
    * @method Sfera.SignalBinding#getSignal
    * @return {Sfera.Signal} Signal that listener is currently bound to.
    */
    getSignal: function () {
        return this._signal;
    },

    /**
    * Delete instance properties
    * @method Sfera.SignalBinding#_destroy
    * @private
    */
    _destroy: function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    },

    /**
    * @method Sfera.SignalBinding#toString
    * @return {string} String representation of the object.
    */
    toString: function () {
        return '[Sfera.SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
    }

};

Sfera.SignalBinding.prototype.constructor = Sfera.SignalBinding;


/**
* Sfera.Net handles browser URL related tasks such as checking host names, domain names and query string manipulation.
*
* @class Sfera.Net
* @constructor
* @param {Sfera.Client} client - A reference to the currently running client.
*/
Sfera.Net = function (client) {

    this.client = client;

    var webSocket;

    var self = this;
    var wsUrl = "";

    function openSocket() {
    	console.log("opening socket on "+wsUrl);
        // Ensures only one connection is open at a time
        if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
            writeResponse("WebSocket is already opened.");
            return;
        }
        // Create a new instance of the websocket

        webSocket = new WebSocket(wsUrl);

        webSocket.onopen = function(event) {
            // For reasons I can't determine, onopen gets called twice
            // and the first time event.data is undefined.
            // Leave a comment if you know the answer.
            if (event.data === undefined)
                return;

            writeResponse(event.data);

            self.wsSend("hello");
        };

        webSocket.onmessage = function(event) {
            writeResponse(event.data);
        };

        webSocket.onclose = function(event) {
            writeResponse("Connection closed");
        };
    }

    /**
     * Sends the value of the text input to the server
     */
    this.wsOpen = function () {
    	openSocket();
    }
    this.wsSend = function (txt) {
        webSocket.send(txt);
    }
    this.wsClose = function () {
    	closeSocket();
    }

    function closeSocket() {
        webSocket.close();
    }

    function writeResponse(text) {
    	console.log("websocket: "+text);
		var e = document.getElementById("output");
		e.innerHTML += "webSocket response:<br><textarea style='width:500px; height:200px'>"+text+"</textarea><br><br>";
    }


    //openSocket();
	///////////////////////////////////////////////////////////////////


	var started = false; // connected: ongoing state requests

	var cSync = ""; // currently cSync?

	var self = this;

	this.stateTs = -1;
	this.subscribed = false; // change this

	// local timestamps, to check required updates
	this.localTs = {
		"dictionary":-1,
		"index":-1
	};

	this.remoteTs = {
		"dictionary":-1,
		"index":-1
	};

	// get current timestamp
	function getTimestamp() {
		return (new Date()).getTime();
	}

	// init
	this.init = function () {
		parser = new Parser();

		this.sync();
	}; // init()

	// sync, if necessary
	this.sync = function () {
		for (var s in this.localTs) {
			if (this.localTs[s] == -1) { // || this.localTs[s] < this.remoteTs[s]) {
				cSync = s;
				req.open(urls.get(s),20);
				return; // one resource per time
			}
		}

		if (!this.subscribed) {
			cSync = "subscribe";
			req.open(urls.get("subscribe"));
			return;
		}

		cSync = "state";
		req.open(urls.get("state"));
	};

	function onReqLoaded() {
		console.log(cSync+" loaded");
		var e = document.getElementById("output");
		e.innerHTML += cSync+" loaded:<br><textarea style='width:500px; height:200px'>"+req.getResponseText()+"</textarea><br><br>";

		if (self.localTs[cSync] != null)
			self.localTs[cSync] = getTimestamp();

		var state;

		switch (cSync) {
		case "dictionary":
			console.log("creating dictionary");
			dictionary = new Dictionary(req.getResponseXML());
			break;
		case "index":
			console.log("parsing interface");
			parser.parseInterface(req.getResponseXML(), {cInterface:cInterface});
			self.showPage();
			break;

		case "subscribe":
			self.subscribed = true;

		case "state":
			state = JSON.parse(req.getResponseText());
			if (state.id)
				config.clientId = state.id;
			if (state.timestamp)
				self.stateTs = state.timestamp;
			break;
		}

		self.sync();
	}
	function onReqError() {
		console.log("error");
		var e = document.getElementById("output");
		e.innerHTML += "<br><br>Error.<br><br>";
	}


};

Sfera.Net.prototype = {

    /**
    * Returns the hostname given by the browser.
    *
    * @method Sfera.Net#getHostName
    * @return {string}
    */
    getHostName: function () {

        if (window.location && window.location.hostname) {
            return window.location.hostname;
        }

        return null;

    }


};

Sfera.Net.prototype.constructor = Sfera.Net;


Sfera.Net.Request = function () {
	var req = null; // request

	var status; // -1: aborted, 0: ready, 1:loading, 2:loaded

	var reqTimeout = null; // trigger timeout
	this.url = "";

	// custom event handlers
	this.onLoaded = null; // needed
	this.onStop = null; // when request is stopped. called with true if loading, false if reqTimeout
	this.onRetry = null; // before retrying on error
	this.onError = null; // any error not captured by custom error handlers
	this.onRequest = null; // when sending request

	// custom error handlers
	this.onConnectionError = null; // connection error
	this.onAuthenticate = null; // false if just logout, true if lock (so we reload)
	this.onNoAccess = null;

	this.maxWaitingTime = 0; // 0 nothing, msec to wait for an answer, else abort
	var waitTimeout = null; // abort after maxWaitingTime

	this.retryOnErrorDelay = 0; // retry delay msec (on any error), 0 does not retry
	this.maxRetries = 0; // max n of retries. after that, stops and fires onError event(s). if maxRetries is 0, custom onError event is never fired
	this.retries = 0; // current retry attempt

	var foo = this; // variable scope

	// errors
	this.ERROR_GENERAL = 0;
	this.ERROR_CONNECTION = 1;
	this.ERROR_MAXWAITTIME = 2;
	this.ERROR_LOGOUT = 3;
	this.ERROR_LOCK = 4;
	this.ERROR_NOACCESS = 5;

	this.init = function () {
		status = 0; // ready
		// init req
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
			req.onreadystatechange = onReadyStateChange;
			// branch for IE/Windows ActiveX version
		} else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
			if (req) {
				req.onreadystatechange = onReadyStateChange;
			}
		}
	}

	// open url. url optional (no url:repeat). ms optional (ms:delay request)
	this.open = function (url, ms) {
		if (status == 1) // loading?
			foo.stop();
		status = 0; // ready
		if (url) { // no url? repeat last one stored
			foo.url = url;
			foo.retries = 0; // reset retries
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
			reqTimeout = setTimeout(foo.open, ms);
			return;
		}
		if (!req) foo.init();
		status = 1; // loading
		if (foo.onRequest)
			foo.onRequest();
		try {
			req.open("GET", foo.url, true);
		} catch (err) {
			// If document is not fully active, throw an "InvalidStateError" exception and terminate the overall set of steps.
			// URL relative to base. If the algorithm returns an error, throw a "SyntaxError" exception and terminate these steps.
			onError(foo.ERROR_GENERAL);
			return;
		}
		req.send();

		// wait timeout
		if (foo.maxWaitingTime) {
			waitTimeout = setTimeout(onWaitTimeout, foo.maxWaitingTime);
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
		onError(foo.ERROR_MAXWAITTIME);
		foo.init(); // reinitialize req every time we abort
	}

	function onReadyStateChange() {
		// check readyState
		if (req.readyState == null) return; // does it ever happen?
		switch (req.readyState) {
		case 0: // unsent
		case 1: // open called, send not called
			//foo.open(); // retry?
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
			onError(foo.ERROR_CONNECTION);
			return;
		}

		// get response text
		var res = "";
		try {
			res = req.responseText;
		} catch (err) {
			// If responseType is not the empty string or "text", throw an "InvalidStateError" exception.
			onError(foo.ERROR_GENERAL);
			return;
		}

		if (res.indexOf("authenticate") == 0 || res.indexOf("logout") == 0) {
			onError(foo.ERROR_LOGOUT);
			return;
		} else if (res.indexOf("lock") == 0) {
			onError(foo.ERROR_LOCK);
			return;
		} else if (res == "noaccess") {
			onError(foo.ERROR_NOACCESS);
			return;
		}

		if (foo.onLoaded) foo.onLoaded(foo);
	}

	// on error. called for every error (but not on stop > abort)
	function onError(errCode) {
		// specific errors, if there's a custom handler it won't repeat automatically
		switch (errCode) {
		case foo.ERROR_CONNECTION:
			if (foo.onConnectionError) {
				foo.onConnectionError();
				return;
			}
			break;
		case foo.ERROR_LOGOUT:
			if (foo.onAuthenticate) {
				foo.onAuthenticate(false);
				return;
			}
			break;
		case foo.ERROR_LOCK:
			if (foo.onAuthenticate) {
				foo.onAuthenticate(true);
				return;
			}
			break;
		case foo.ERROR_NOACCESS:
			if (foo.onNoAccess) {
				foo.onNoAccess();
				return;
			}
			break;
		}
		// repeat?
		if (foo.retryOnErrorDelay) {
			if (!foo.maxRetries || foo.retries < foo.maxRetries) {
				foo.retries++;
				if (foo.onRetry) // before repeating, so we can change the retryOnErrorDelay
					foo.onRetry();
				if (foo.retryOnErrorDelay) {// could be changed by onRetry
					foo.repeat(foo.retryOnErrorDelay);
					return;
				}
			}
		}
		// no custom handlers, no (more) retries. generic error callback
		if (foo.onError)
			foo.onError(errCode);
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


/**
* Sfera.Skins contains and handles skins
*
* @class Sfera.Skins
* @constructor
* @param {Sfera.Client} client - A reference to the current client.
*/
Sfera.Skins = function (client) {

    this.client = client;

};


/**
 * Browser singleton
 */
Sfera.Browser = function(client) {

    /**
     * Change the browser tab URL without reloading (if supported)
     * @param  {string} title - Title of the page
     * @param  {string} url   - URL of the page
     * @return {boolean}      - true if successful, false otherwise
     */
    this.changeUrl = function (title, url) {
        if (typeof(history.pushState) != "undefined") {
            var obj = {
                Title: title,
                Url: url
            };
            history.pushState(obj, obj.Title, obj.Url);
            return true;
        }
        return false;
    }

    this.changePage = function (pageId, pageLabel) {
        var location = this.getLocation();
        hash = pageId;
        this.changeUrl(pageLabel, location.pathname + "#" + pageId + "?" + location.search);
    }

    this.getLocation = function () {
        var url, host, protocol, pathname, hash, search, a;

        url = window.location.href; // "http://localhost:8080/index.html#page1?a=2"
        host = window.location.host; // "localhost:8080"
        protocol = window.location.protocol; // http:
        pathname = window.location.pathname;
        hash = window.location.hash; // #page1
        search = window.location.search; // ?a=2

        if (hash) {
            if (hash[0] == '#')
                hash = hash.substr(1); // remove #
            if (hash.indexOf("?") != -1) {
                a = hash.split("?");
                hash = a[0];
                search = a[1];
            }
        }
        if (search) {
            if (search[0] == '?')
                search = search.substr(1); // remove ?
            if (search.indexOf("#") != -1) {
                a = search.split("#");
                search = a[0];
                hash = a[1];
            }
        }

        return {
            url:url,
            host:host,
            protocol:protocol,
            pathname:pathname,
            hash:hash,
            search:search
        };
    }

    var hash = window.location.hash;
    var self = this;

    setInterval(function(){
        if (window.location.hash != hash) {
            hash = window.location.hash;
            var location = self.getLocation();
            Sfera.client.showPage(location.hash);
            //alert("User went back or forward to application state represented by " + hash);
        }
    }, 100);
}

// Browser is a singleton/static entity; instantiate it
// and add new methods directly sans-prototype.
Sfera.Browser = new Sfera.Browser();


/**
* @classdesc
* Detects device support capabilities and is responsible for device intialization - see {@link Sfera.Device.whenReady whenReady}.
*
* This class represents a singleton object that can be accessed directly as `client.device`
* (or, as a fallback, `Sfera.Device` when a client instance is not available) without the need to instantiate it.
*
* Unless otherwise noted the device capabilities are only guaranteed after initialization. Initialization
* occurs automatically and is guaranteed complete before {@link Sfera.client} begins its "boot" phase.
* Feature detection can be modified in the {@link Sfera.Device.onInitialized onInitialized} signal.
*
* When checking features using the exposed properties only the *truth-iness* of the value should be relied upon
* unless the documentation states otherwise: properties may return `false`, `''`, `null`, or even `undefined`
* when indicating the lack of a feature.
*
* Uses elements from System.js by MrDoob and Modernizr
*
* @description
* It is not possible to instantiate the Device class manually.
*
* @class
* @protected
*/
Sfera.Device = function () {

    /**
    * The time the device became ready.
    * @property {integer} deviceReadyAt
    * @protected
    */
    this.deviceReadyAt = 0;

    /**
    * The time as which initialization has completed.
    * @property {boolean} initialized
    * @protected
    */
    this.initialized = false;

    //  Browser / Host / Operating System

    /**
    * @property {boolean} desktop - Is running on a desktop?
    * @default
    */
    this.desktop = false;

    /**
    * @property {boolean} iOS - Is running on iOS?
    * @default
    */
    this.iOS = false;

    /**
    * @property {boolean} cocoonJS - Is the client running under CocoonJS?
    * @default
    */
    this.cocoonJS = false;

    /**
    * @property {boolean} cocoonJSApp - Is this client running with CocoonJS.App?
    * @default
    */
    this.cocoonJSApp = false;

    /**
    * @property {boolean} cordova - Is the client running under Apache Cordova?
    * @default
    */
    this.cordova = false;

    /**
    * @property {boolean} node - Is the client running under Node.js?
    * @default
    */
    this.node = false;

    /**
    * @property {boolean} nodeWebkit - Is the client running under Node-Webkit?
    * @default
    */
    this.nodeWebkit = false;

    /**
    * @property {boolean} electron - Is the client running under GitHub Electron?
    * @default
    */
    this.electron = false;

    /**
    * @property {boolean} ejecta - Is the client running under Ejecta?
    * @default
    */
    this.ejecta = false;

    /**
    * @property {boolean} crosswalk - Is the client running under the Intel Crosswalk XDK?
    * @default
    */
    this.crosswalk = false;

    /**
    * @property {boolean} android - Is running on android?
    * @default
    */
    this.android = false;

    /**
    * @property {boolean} chromeOS - Is running on chromeOS?
    * @default
    */
    this.chromeOS = false;

    /**
    * @property {boolean} linux - Is running on linux?
    * @default
    */
    this.linux = false;

    /**
    * @property {boolean} macOS - Is running on macOS?
    * @default
    */
    this.macOS = false;

    /**
    * @property {boolean} windows - Is running on windows?
    * @default
    */
    this.windows = false;

    /**
    * @property {boolean} windowsPhone - Is running on a Windows Phone?
    * @default
    */
    this.windowsPhone = false;

    //  Features

    /**
    * @property {boolean} canvas - Is canvas available?
    * @default
    */
    this.canvas = false;

    /**
    * @property {?boolean} canvasBitBltShift - True if canvas supports a 'copy' bitblt onto itself when the source and destination regions overlap.
    * @default
    */
    this.canvasBitBltShift = null;

    /**
    * @property {boolean} webGL - Is webGL available?
    * @default
    */
    this.webGL = false;

    /**
    * @property {boolean} file - Is file available?
    * @default
    */
    this.file = false;

    /**
    * @property {boolean} fileSystem - Is fileSystem available?
    * @default
    */
    this.fileSystem = false;

    /**
    * @property {boolean} localStorage - Is localStorage available?
    * @default
    */
    this.localStorage = false;

    /**
    * @property {boolean} worker - Is worker available?
    * @default
    */
    this.worker = false;

    /**
    * @property {boolean} css3D - Is css3D available?
    * @default
    */
    this.css3D = false;

    /**
    * @property {boolean} pointerLock - Is Pointer Lock available?
    * @default
    */
    this.pointerLock = false;

    /**
    * @property {boolean} typedArray - Does the browser support TypedArrays?
    * @default
    */
    this.typedArray = false;

    /**
    * @property {boolean} vibration - Does the device support the Vibration API?
    * @default
    */
    this.vibration = false;

    /**
    * @property {boolean} getUserMedia - Does the device support the getUserMedia API?
    * @default
    */
    this.getUserMedia = true;

    /**
    * @property {boolean} quirksMode - Is the browser running in strict mode (false) or quirks mode? (true)
    * @default
    */
    this.quirksMode = false;

    //  Input

    /**
    * @property {boolean} touch - Is touch available?
    * @default
    */
    this.touch = false;

    /**
    * @property {boolean} mspointer - Is mspointer available?
    * @default
    */
    this.mspointer = false;

    /**
    * @property {?string} wheelType - The newest type of Wheel/Scroll event supported: 'wheel', 'mousewheel', 'DOMMouseScroll'
    * @default
    * @protected
    */
    this.wheelEvent = null;

    //  Browser

    /**
    * @property {boolean} arora - Set to true if running in Arora.
    * @default
    */
    this.arora = false;

    /**
    * @property {boolean} chrome - Set to true if running in Chrome.
    * @default
    */
    this.chrome = false;

    /**
    * @property {number} chromeVersion - If running in Chrome this will contain the major version number.
    * @default
    */
    this.chromeVersion = 0;

    /**
    * @property {boolean} epiphany - Set to true if running in Epiphany.
    * @default
    */
    this.epiphany = false;

    /**
    * @property {boolean} firefox - Set to true if running in Firefox.
    * @default
    */
    this.firefox = false;

    /**
    * @property {number} firefoxVersion - If running in Firefox this will contain the major version number.
    * @default
    */
    this.firefoxVersion = 0;

    /**
    * @property {boolean} ie - Set to true if running in Internet Explorer.
    * @default
    */
    this.ie = false;

    /**
    * @property {number} ieVersion - If running in Internet Explorer this will contain the major version number. Beyond IE10 you should use Device.trident and Device.tridentVersion.
    * @default
    */
    this.ieVersion = 0;

    /**
    * @property {boolean} trident - Set to true if running a Trident version of Internet Explorer (IE11+)
    * @default
    */
    this.trident = false;

    /**
    * @property {number} tridentVersion - If running in Internet Explorer 11 this will contain the major version number. See {@link http://msdn.microsoft.com/en-us/library/ie/ms537503(v=vs.85).aspx}
    * @default
    */
    this.tridentVersion = 0;

    /**
    * @property {boolean} mobileSafari - Set to true if running in Mobile Safari.
    * @default
    */
    this.mobileSafari = false;

    /**
    * @property {boolean} midori - Set to true if running in Midori.
    * @default
    */
    this.midori = false;

    /**
    * @property {boolean} opera - Set to true if running in Opera.
    * @default
    */
    this.opera = false;

    /**
    * @property {boolean} safari - Set to true if running in Safari.
    * @default
    */
    this.safari = false;

    /**
    * @property {boolean} webApp - Set to true if running as a WebApp, i.e. within a WebView
    * @default
    */
    this.webApp = false;

    /**
    * @property {boolean} silk - Set to true if running in the Silk browser (as used on the Amazon Kindle)
    * @default
    */
    this.silk = false;

    //  Audio

    /**
    * @property {boolean} audioData - Are Audio tags available?
    * @default
    */
    this.audioData = false;

    /**
    * @property {boolean} webAudio - Is the WebAudio API available?
    * @default
    */
    this.webAudio = false;

    /**
    * @property {boolean} ogg - Can this device play ogg files?
    * @default
    */
    this.ogg = false;

    /**
    * @property {boolean} opus - Can this device play opus files?
    * @default
    */
    this.opus = false;

    /**
    * @property {boolean} mp3 - Can this device play mp3 files?
    * @default
    */
    this.mp3 = false;

    /**
    * @property {boolean} wav - Can this device play wav files?
    * @default
    */
    this.wav = false;

    /**
    * Can this device play m4a files?
    * @property {boolean} m4a - True if this device can play m4a files.
    * @default
    */
    this.m4a = false;

    /**
    * @property {boolean} webm - Can this device play webm files?
    * @default
    */
    this.webm = false;

    //  Video

    /**
    * @property {boolean} oggVideo - Can this device play ogg video files?
    * @default
    */
    this.oggVideo = false;

    /**
    * @property {boolean} h264Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.h264Video = false;

    /**
    * @property {boolean} mp4Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.mp4Video = false;

    /**
    * @property {boolean} webmVideo - Can this device play webm video files?
    * @default
    */
    this.webmVideo = false;

    /**
    * @property {boolean} vp9Video - Can this device play vp9 video files?
    * @default
    */
    this.vp9Video = false;

    /**
    * @property {boolean} hlsVideo - Can this device play hls video files?
    * @default
    */
    this.hlsVideo = false;

    //  Device

    /**
    * @property {boolean} iPhone - Is running on iPhone?
    * @default
    */
    this.iPhone = false;

    /**
    * @property {boolean} iPhone4 - Is running on iPhone4?
    * @default
    */
    this.iPhone4 = false;

    /**
    * @property {boolean} iPad - Is running on iPad?
    * @default
    */
    this.iPad = false;

    // Device features

    /**
    * @property {number} pixelRatio - PixelRatio of the host device?
    * @default
    */
    this.pixelRatio = 0;

    /**
    * @property {boolean} littleEndian - Is the device big or little endian? (only detected if the browser supports TypedArrays)
    * @default
    */
    this.littleEndian = false;

    /**
    * @property {boolean} LITTLE_ENDIAN - Same value as `littleEndian`.
    * @default
    */
    this.LITTLE_ENDIAN = false;

    /**
    * @property {boolean} support32bit - Does the device context support 32bit pixel manipulation using array buffer views?
    * @default
    */
    this.support32bit = false;

    /**
    * @property {boolean} fullscreen - Does the browser support the Full Screen API?
    * @default
    */
    this.fullscreen = false;

    /**
    * @property {string} requestFullscreen - If the browser supports the Full Screen API this holds the call you need to use to activate it.
    * @default
    */
    this.requestFullscreen = '';

    /**
    * @property {string} cancelFullscreen - If the browser supports the Full Screen API this holds the call you need to use to cancel it.
    * @default
    */
    this.cancelFullscreen = '';

    /**
    * @property {boolean} fullscreenKeyboard - Does the browser support access to the Keyboard during Full Screen mode?
    * @default
    */
    this.fullscreenKeyboard = false;

};

// Device is a singleton/static entity; instantiate it
// and add new methods directly sans-prototype.
Sfera.Device = new Sfera.Device();

/**
* This signal is dispatched after device initialization occurs but before any of the ready
* callbacks (see {@link Sfera.Device.whenReady whenReady}) have been invoked.
*
* Local "patching" for a particular device can/should be done in this event.
*
* _Note_: This signal is removed after the device has been readied; if a handler has not been
* added _before_ `new Sfera.client(..)` it is probably too late.
*
* @type {?Sfera.Signal}
* @static
*/
Sfera.Device.onInitialized = new Sfera.Signal();

/**
* Add a device-ready handler and ensure the device ready sequence is started.
*
* Sfera.Device will _not_ activate or initialize until at least one `whenReady` handler is added,
* which is normally done automatically be calling `new Sfera.client(..)`.
*
* The handler is invoked when the device is considered "ready", which may be immediately
* if the device is already "ready". See {@link Sfera.Device#deviceReadyAt deviceReadyAt}.
*
* @method
* @param {function} handler - Callback to invoke when the device is ready. It is invoked with the given context the Sfera.Device object is supplied as the first argument.
* @param {object} [context] - Context in which to invoke the handler
* @param {boolean} [nonPrimer=false] - If true the device ready check will not be started.
*/
Sfera.Device.whenReady = function (callback, context, nonPrimer) {

    var readyCheck = this._readyCheck;

    if (this.deviceReadyAt || !readyCheck)
    {
        callback.call(context, this);
    }
    else if (readyCheck._monitor || nonPrimer)
    {
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);
    }
    else
    {
        readyCheck._monitor = readyCheck.bind(this);
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);

        var cordova = typeof window.cordova !== 'undefined';
        var cocoonJS = navigator['isCocoonJS'];

        if (document.readyState === 'complete' || document.readyState === 'interactive')
        {
            // Why is there an additional timeout here?
            window.setTimeout(readyCheck._monitor, 0);
        }
        else if (cordova && !cocoonJS)
        {
            // Ref. http://docs.phonegap.com/en/3.5.0/cordova_events_events.md.html#deviceready
            //  Cordova, but NOT Cocoon?
            document.addEventListener('deviceready', readyCheck._monitor, false);
        }
        else
        {
            document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
            window.addEventListener('load', readyCheck._monitor, false);
        }
    }

};

/**
* Internal method used for checking when the device is ready.
* This function is removed from Sfera.Device when the device becomes ready.
*
* @method
* @private
*/
Sfera.Device._readyCheck = function () {

    var readyCheck = this._readyCheck;

    if (!document.body)
    {
        window.setTimeout(readyCheck._monitor, 20);
    }
    else if (!this.deviceReadyAt)
    {
        this.deviceReadyAt = Date.now();

        document.removeEventListener('deviceready', readyCheck._monitor);
        document.removeEventListener('DOMContentLoaded', readyCheck._monitor);
        window.removeEventListener('load', readyCheck._monitor);

        this._initialize();
        this.initialized = true;

        this.onInitialized.dispatch(this);

        var item;
        while ((item = readyCheck._queue.shift()))
        {
            var callback = item[0];
            var context = item[1];
            callback.call(context, this);
        }

        // Remove no longer useful methods and properties.
        this._readyCheck = null;
        this._initialize = null;
        this.onInitialized = null;
    }

};

/**
* Internal method to initialize the capability checks.
* This function is removed from Sfera.Device once the device is initialized.
*
* @method
* @private
*/
Sfera.Device._initialize = function () {

    var device = this;

    /**
    * Check which OS is client running on.
    */
    function _checkOS () {

        var ua = navigator.userAgent;

        if (/Playstation Vita/.test(ua))
        {
            device.vita = true;
        }
        else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua))
        {
            device.kindle = true;
            // This will NOT detect early generations of Kindle Fire, I think there is no reliable way...
            // E.g. "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"
        }
        else if (/Android/.test(ua))
        {
            device.android = true;
        }
        else if (/CrOS/.test(ua))
        {
            device.chromeOS = true;
        }
        else if (/iP[ao]d|iPhone/i.test(ua))
        {
            device.iOS = true;
        }
        else if (/Linux/.test(ua))
        {
            device.linux = true;
        }
        else if (/Mac OS/.test(ua))
        {
            device.macOS = true;
        }
        else if (/Windows/.test(ua))
        {
            device.windows = true;
        }

        if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua))
        {
            device.android = false;
            device.iOS = false;
            device.macOS = false;
            device.windows = true;
            device.windowsPhone = true;
        }

        var silk = /Silk/.test(ua); // detected in browsers

        if (device.windows || device.macOS || (device.linux && !silk) || device.chromeOS)
        {
            device.desktop = true;
        }

        //  Windows Phone / Table reset
        if (device.windowsPhone || ((/Windows NT/i.test(ua)) && (/Touch/i.test(ua))))
        {
            device.desktop = false;
        }

    }

    /**
    * Check HTML5 features of the host environment.
    */
    function _checkFeatures () {

        device.canvas = !!window['CanvasRenderingContext2D'] || device.cocoonJS;

        try {
            device.localStorage = !!localStorage.getItem;
        } catch (error) {
            device.localStorage = false;
        }

        device.file = !!window['File'] && !!window['FileReader'] && !!window['FileList'] && !!window['Blob'];
        device.fileSystem = !!window['requestFileSystem'];

        device.webGL = ( function () { try { var canvas = document.createElement( 'canvas' ); /*Force screencanvas to false*/ canvas.screencanvas = false; return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
        device.webGL = !!device.webGL;

        device.worker = !!window['Worker'];

        device.pointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        device.quirksMode = (document.compatMode === 'CSS1Compat') ? false : true;

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        device.getUserMedia = device.getUserMedia && !!navigator.getUserMedia && !!window.URL;

        // Older versions of firefox (< 21) apparently claim support but user media does not actually work
        if (device.firefox && device.firefoxVersion < 21)
        {
            device.getUserMedia = false;
        }

    }

    /**
    * Checks/configures various input.
    */
    function _checkInput () {

        if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1))
        {
            device.touch = true;
        }

        if (window.navigator.msPointerEnabled || window.navigator.pointerEnabled)
        {
            device.mspointer = true;
        }

        if (!device.cocoonJS)
        {
            // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
            if ('onwheel' in window || (device.ie && 'WheelEvent' in window))
            {
                // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
                device.wheelEvent = 'wheel';
            }
            else if ('onmousewheel' in window)
            {
                // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
                device.wheelEvent = 'mousewheel';
            }
            else if (device.firefox && 'MouseScrollEvent' in window)
            {
                // FF prior to 17. This should probably be scrubbed.
                device.wheelEvent = 'DOMMouseScroll';
            }
        }

    }

    /**
    * Checks for support of the Full Screen API.
    */
    function _checkFullScreenSupport () {

        var fs = [
            'requestFullscreen',
            'requestFullScreen',
            'webkitRequestFullscreen',
            'webkitRequestFullScreen',
            'msRequestFullscreen',
            'msRequestFullScreen',
            'mozRequestFullScreen',
            'mozRequestFullscreen'
        ];

        var element = document.createElement('div');

        for (var i = 0; i < fs.length; i++)
        {
            if (element[fs[i]])
            {
                device.fullscreen = true;
                device.requestFullscreen = fs[i];
                break;
            }
        }

        var cfs = [
            'cancelFullScreen',
            'exitFullscreen',
            'webkitCancelFullScreen',
            'webkitExitFullscreen',
            'msCancelFullScreen',
            'msExitFullscreen',
            'mozCancelFullScreen',
            'mozExitFullscreen'
        ];

        if (device.fullscreen)
        {
            for (var i = 0; i < cfs.length; i++)
            {
                if (document[cfs[i]])
                {
                    device.cancelFullscreen = cfs[i];
                    break;
                }
            }
        }

        //  Keyboard Input?
        if (window['Element'] && Element['ALLOW_KEYBOARD_INPUT'])
        {
            device.fullscreenKeyboard = true;
        }

    }

    /**
    * Check what browser is client running in.
    */
    function _checkBrowser () {

        var ua = navigator.userAgent;

        if (/Arora/.test(ua))
        {
            device.arora = true;
        }
        else if (/Chrome\/(\d+)/.test(ua) && !device.windowsPhone)
        {
            device.chrome = true;
            device.chromeVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Epiphany/.test(ua))
        {
            device.epiphany = true;
        }
        else if (/Firefox\D+(\d+)/.test(ua))
        {
            device.firefox = true;
            device.firefoxVersion = parseInt(RegExp.$1, 10);
        }
        else if (/AppleWebKit/.test(ua) && device.iOS)
        {
            device.mobileSafari = true;
        }
        else if (/MSIE (\d+\.\d+);/.test(ua))
        {
            device.ie = true;
            device.ieVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Midori/.test(ua))
        {
            device.midori = true;
        }
        else if (/Opera/.test(ua))
        {
            device.opera = true;
        }
        else if (/Safari/.test(ua) && !device.windowsPhone)
        {
            device.safari = true;
        }
        else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua))
        {
            device.ie = true;
            device.trident = true;
            device.tridentVersion = parseInt(RegExp.$1, 10);
            device.ieVersion = parseInt(RegExp.$3, 10);
        }

        //  Silk gets its own if clause because its ua also contains 'Safari'
        if (/Silk/.test(ua))
        {
            device.silk = true;
        }

        //  WebApp mode in iOS
        if (navigator['standalone'])
        {
            device.webApp = true;
        }

        if (typeof window.cordova !== "undefined")
        {
            device.cordova = true;
        }

        if (typeof process !== "undefined" && typeof require !== "undefined")
        {
            device.node = true;
        }

        if (device.node && typeof process.versions === 'object')
        {
            device.nodeWebkit = !!process.versions['node-webkit'];

            device.electron = !!process.versions.electron;
        }

        if (navigator['isCocoonJS'])
        {
            device.cocoonJS = true;
        }

        if (device.cocoonJS)
        {
            try {
                device.cocoonJSApp = (typeof CocoonJS !== "undefined");
            }
            catch(error)
            {
                device.cocoonJSApp = false;
            }
        }

        if (typeof window.ejecta !== "undefined")
        {
            device.ejecta = true;
        }

        if (/Crosswalk/.test(ua))
        {
            device.crosswalk = true;
        }

    }

    /**
    * Check video support.
    */
    function _checkVideo () {

        var videoElement = document.createElement("video");
        var result = false;

        try {
            if (result = !!videoElement.canPlayType)
            {
                if (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ''))
                {
                    device.oggVideo = true;
                }

                if (videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                    device.h264Video = true;
                    device.mp4Video = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ''))
                {
                    device.webmVideo = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ''))
                {
                    device.vp9Video = true;
                }

                if (videoElement.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    device.hlsVideo = true;
                }
            }
        } catch (e) {}
    }

    /**
    * Check audio support.
    */
    function _checkAudio () {

        device.audioData = !!(window['Audio']);
        device.webAudio = !!(window['AudioContext'] || window['webkitAudioContext']);
        var audioElement = document.createElement('audio');
        var result = false;

        try {
            if (result = !!audioElement.canPlayType)
            {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.ogg = true;
                }

                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, ''))
                {
                    device.opus = true;
                }

                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, ''))
                {
                    device.mp3 = true;
                }

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''))
                {
                    device.wav = true;
                }

                if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, ''))
                {
                    device.m4a = true;
                }

                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.webm = true;
                }
            }
        } catch (e) {
        }

    }

    /**
    * Check PixelRatio, iOS device, Vibration API
    */
    function _checkDevice () {

        device.pixelRatio = window['devicePixelRatio'] || 1;
        device.iPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
        device.iPhone4 = (device.pixelRatio == 2 && device.iPhone);
        device.iPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;


        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        if (navigator.vibrate)
        {
            device.vibration = true;
        }

    }

    //  Run the checks
    _checkOS();
    _checkAudio();
    _checkVideo();
    _checkBrowser();
    _checkDevice();
    _checkFeatures();
    _checkFullScreenSupport();
    _checkInput();

};

/**
* Check whether the host environment can play audio.
*
* @method canPlayAudio
* @memberof Sfera.Device.prototype
* @param {string} type - One of 'mp3, 'ogg', 'm4a', 'wav', 'webm' or 'opus'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Sfera.Device.canPlayAudio = function (type) {

    if (type === 'mp3' && this.mp3)
    {
        return true;
    }
    else if (type === 'ogg' && (this.ogg || this.opus))
    {
        return true;
    }
    else if (type === 'm4a' && this.m4a)
    {
        return true;
    }
    else if (type === 'opus' && this.opus)
    {
        return true;
    }
    else if (type === 'wav' && this.wav)
    {
        return true;
    }
    else if (type === 'webm' && this.webm)
    {
        return true;
    }

    return false;

};

/**
* Check whether the host environment can play video files.
*
* @method canPlayVideo
* @memberof Sfera.Device.prototype
* @param {string} type - One of 'mp4, 'ogg', 'webm' or 'mpeg'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Sfera.Device.canPlayVideo = function (type) {

    if (type === 'webm' && (this.webmVideo || this.vp9Video))
    {
        return true;
    }
    else if (type === 'mp4' && (this.mp4Video || this.h264Video))
    {
        return true;
    }
    else if ((type === 'ogg' || type === 'ogv') && this.oggVideo)
    {
        return true;
    }
    else if (type === 'mpeg' && this.hlsVideo)
    {
        return true;
    }

    return false;

};


/**
* Sfera.Utils singleton
*
* @class Sfera.Utils
* @constructor
*/
Sfera.Utils = function () {
    this.mixin = function (a, b) {

    };

    this.extend = function (c,e) {
        c.prototype = Object.create(e.prototype);
        this.initClass(c);
        c.prototype.ancestor = e.prototype;
        /*
        for (var i = 0; i < arguments.length; i++) {
            alert(arguments[i]);
        }
        */
    };


    this.initClass = function (c) {
        c.prototype.constructor = c;
    };

    this.getFirstChildNodeOfType = function (xmlNode, type) {
        for (var i=0; i<xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == type) {
                return xmlNode.childNodes[i];
            }
        }
        return null;
    };

    this.getCDATA = function (xmlNode) {
        var node = this.getFirstChildNodeOfType(xmlNode, 4);
        return node ? node.nodeValue : "";
    };


};

Sfera.Utils = new Sfera.Utils();


/**
* Sfera.Component base class for component
*
* @class Sfera.Component
* @constructor
* @param {Object} properties - Object containing property values.
*/
Sfera.Components.Component = function (properties) {
    // set property values
    for (var p in properties) {
        if (p == "id") {
            this.id = properties[p];
        } else if (this.properties[p]) {
            this.properties[p].value = properties[p];
        }
    }
};

Sfera.Components.Component.prototype = {
    /**
     * Component instance id
     * @type {String}
     */
    id: "",

    /**
     * Component type
     * @type {String}
     */
    type: "",

    /**
     * Has the source been processed?
     * @type {Boolean}
     */
    processed: false,

    /**
     * HTML element
     * @type {DOM Element}
     */
    element: null,

    /**
     * Set component's html source. Reset processed variable
     * @param {string} src - html source
     */
    setSource: function (src) {
        this.processed = false;
    },

    init: function () {
        for (var p in this.properties)
            this.setProperty(p,this.properties[p].value);
    },

    children:[],

    addChild: function (child) {
        this.children.push(child);
        child.parent = this;
        if (this.element) {
            this.element.appendChild(child.element);
        }
    },

    setProperty: function (name, value) {
        // no property by that name?
        if (this.properties[name] == null)
            return false;

        // parse value depending on type
        switch (this.properties[name].type) {
        case "boolean":
            value = (value == "true" || value == true);
            break;
        case "integer":
            value = parseInt(value);
            break;
        }

        this.properties[name].value = value;
        return true;
    },

    setProperties: function (properties) {
        for (var p in properties) {
            this.setProperty(p, properties[p]);
        }
    }

};

Sfera.Utils.initClass(Sfera.Components.Component);


/**
 * Interface component.
 *
 * @class Sfera.Components.Interface
 * @constructor
 */
Sfera.Components.Interface = function(properties) {
    this.type = "Interface";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        text: {
            type: String,
            value: ""
        },

        // style
        style: {
            type: String,
            value: ""
        }

    };

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Interface, Sfera.Components.Component);

Sfera.Components.Interface.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            break;
    }
};


/**
 * Label component.
 *
 * @class Sfera.Components.Label
 * @constructor
 */
Sfera.Components.Label = function(properties) {
    this.type = "Label";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        text: {
            type: "string",
            value: ""
        },

        // style
        style: {
            type: "string",
            value: ""
        },

        // visible
        visible: {
            type: "boolean",
            value: true
        }

    };

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Label, Sfera.Components.Component);

Sfera.Components.Label.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            break;
    }
};


/**
 * Page component.
 *
 * @class Sfera.Components.Page
 * @constructor
 */
Sfera.Components.Page = function(properties) {
    this.type = "Page";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // title
        title: {
            type: String,
            value: ""
        },

        // style
        style: {
            type: String,
            value: ""
        },

        // visible
        visible: {
            type: "boolean",
            value: true
        }

    };

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Page, Sfera.Components.Component);

Sfera.Components.Page.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            return true;

        case "visible":
            this.element.style.display = value?"":"none";
            return true;
    }

    return false;
};

Sfera.Components.Page.prototype.init = function() {
    Sfera.Components.Component.prototype.init.call(this);

    this.element.style.display = "none";
};


if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Sfera;
        }
        exports.Sfera = Sfera;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('Sfera', (function() { return root.Sfera = Sfera; }) ());
    } else {
        root.Sfera = Sfera;
    }
}).call(this);

/*
* ""
*/

//# sourceMappingURL=sfera-webapp.js.map