/*! sfera-webapp - v0.0.2 - 2016-01-13 */

(function(){

    var root = this;


/**
* @namespace Sfera
*/
var Sfera = Sfera || {

    /**
    * The Sfera version number.
    * @constant
    * @type {string} - version
    */
    VERSION: '0.1.0',

    /**
    * Sfera client instance.
    * @constant
    * @type {array}
    */
    client: null

};


Sfera.Behaviors = {};
Sfera.Behaviors.Visibility = function() {
    // extend attributes
    this.attrDefs.visible = {
        type: "boolean",
        compile: function() {
            this.changed = false;
            this.value = !(!this.source || this.source == "false");
            this.update();
        },
        update: function() {
            this.component.element.style.display = this.value ? "inline" : "none";
        }
    };
};
Sfera.Behaviors.Position = function() {
    // extend attributes
    this.attrDefs.x = {
        type: "int",
        update: function() {
            this.component.element.style.left = this.value + "px";
        }
    };
    this.attrDefs.y = {
        type: "int",
        update: function() {
            this.component.element.style.top = this.value + "px";
        }
    };
};
Sfera.Behaviors.Size = function() {
    // extend attributes
    this.attrDefs.width = {
        type: "int",
        update: function() {
            this.component.element.style.width = this.value + "px";
        }
    };
    this.attrDefs.height = {
        type: "int",
        update: function() {
            this.component.element.style.height = this.value + "px";
        }
    };
};
Sfera.Behaviors.Label = function() {
    // extend attributes
    this.attrDefs.label = {
        type: "string",
        update: function() {
            this.component.element.innerHTML = this.value;
        }
    };
    this.attrDefs.color = {
        type: "string",
        update: function() {
            this.component.element.style.color = this.value;
        }
    };
    this.attrDefs.fontSize = {
        type: "int",
        update: function() {
            this.component.element.style.fontSize = this.value + "px";
        }
    };
    this.attrDefs.textAlign = {
        type: "string",
        update: function() {
            this.component.element.style.textAlign = this.value;
        }
    };

};


/**
 * Sfera.Compiler compiles components into DOM
 *
 * @class Sfera.Compiler
 * @constructor
 */
Sfera.Compiler = new(function() {

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
     * @param  {[type]} attributes [description]
     * @return {[type]}            [description]
     */
    this.createComponent = function(name, attributes) {
        /*
        if (src.indexOf("<!--sml") != -1) {
            var comments = getComments(newDiv);
            if (comments && comments.length) {
                // replace with components
            }
        }
        */

        var component = Sfera.Components.createInstance(name, attributes);
        return component;
    };

    this.compileXMLNode = function(xmlNode) {
        if (xmlNode.nodeType == 1) { // 1 = element
            var i, a;
            var attrs = {};
            for (i = 0; i < xmlNode.attributes.length; i++) {
                a = xmlNode.attributes[i];
                attrs[Sfera.Utils.dashToCamel(a.name)] = a.value;
            }

            var component = this.createComponent(xmlNode.nodeName, attrs);

            // add to the index
            if (component) {
                Sfera.client.indexComponent(component);

                var child;
                var c = xmlNode.childNodes;

                for (i = 0; i < c.length; i++) {
                    child = this.compileXMLNode(c[i]);
                    if (child)
                        component.addChild(child);
                }
            }

            return component;
        }
        return null;
    };

    /**
     *
     */
    this.compileXML = function(xmlDoc) {
        return this.compileXMLNode(xmlDoc.documentElement);
    };

    this.compileString = function(xmlStr) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");

        this.compileXML(xmlDoc);
    };

    /**
     * [function description]
     * @param  {[type]} xmlDoc [description]
     * @return {[type]}        [description]
     */
    this.compileDictionary = function(xmlDoc) {
        var xmlNode = xmlDoc.documentElement;
        if (xmlNode && xmlNode.nodeType == 1) { // 1 = element
            var c = xmlNode.childNodes,
                c2, c3, n, i, t, k;
            for (i = 0; i < c.length; i++) {
                if (c[i].nodeType == 1) switch (c[i].tagName) {
                    case "skin":
                        break;
                    case "components":
                        c2 = c[i].childNodes;
                        for (t = 0; t < c2.length; t++) {
                            if (c2[t].nodeType == 1) {
                                // component has source and lan
                                c3 = c2[t].childNodes;
                                for (k = 0; k < c3.length; k++) {
                                    switch (c3[k].tagName) {
                                        case "src":
                                            Sfera.Components.setSource(c2[t].tagName, Sfera.Utils.getCDATA(c3[k]));
                                            break;
                                        case "_lan":
                                            Sfera.Components.setLanguage(c2[t].tagName, Sfera.Utils.getCDATA(c3[k]));
                                            break;
                                    }
                                }
                            }
                        }
                        break;
                }
            }
        }
    };

    this.compileHTML = function (source) {
        source = source.replace(/\$interface\;/g, Sfera.client.name);



        return source;
    };

    this.getMustacheData = function(source) {
        if (!Sfera.Utils.isString(source) ||
            source.indexOf("{") == -1)
            return null;

        var data = {
            vars: []
        };
        var MUSTACHE = /\{\{([^}]*)\}\}/g;
        var m;
        while (m = MUSTACHE.exec(source)) {
            data.vars.push(m[1]);
        }

        // done
        if (!data.vars.length)
            return null;

        return data;
    };

    /**
     *
     */
    this.compileAttributeValue = function(attr, source) {
        var str;
        var MUSTACHE = /\{\{([^}]*)\}\}/g;

        /*/
        function myRep(match, capture) {
            switch (capture) {
                case "one":
                    return "1";
                    break;
                case "two":
                    return "2";
                    break;
            }

            return "";
        }
        //str = '<div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/arkane-studios/" rel="tag">Arkane Studios</a>, <a href="http://www.rockpapershotgun.com/tag/bethesda/" rel="tag">Bethesda</a>, <a href="http://www.rockpapershotgun.com/tag/dishonored/" rel="tag">Dishonored</a>, <a href="http://www.rockpapershotgun.com/tag/dishonored-2/" rel="tag">Dishonored 2</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.com/2015/09/17/dishonored-2-karnaca/#comments" title="Comment on Southland Tales: Dishonored 2&#8217;s Sun-Scorched Bloodflies">21 Comments &#187;</a></p> </footer> </div> </div> <div id="post-314999" class="block featured-block"> <p class="featured-block-title"> <a class="featured-block__text featured-block__text--feature" href="http://www.rockpapershotgun.com/category/featured-articles">RPS Feature</a> It's a number one. </p> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/" rel="bookmark" title="Permanent Link to Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See">Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#472d61647676767c2f61647676777c616471737c352861647e7e7c61647677707c61647676757c61647e707c61647676757c2261647676737c61647676727c616476X04;ot&#103;un.c&#111;&#109;">John Walker</a> on September 17th, 2015 at 5:00 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/"><span>Twitter</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see//"><span>Reddit</span></a></li> </ul> </div> </div> <p><a href="http://www.rockpapershotgun.com/images/15/sep/albt1b.jpg" rel="lightbox[314999]"><img src="http://www.rockpapershotgun.com/images/15/sep/albt1.jpg" alt=""/></a></p> <p><em>I&#8217;m really getting the hang of these headlines, I think. In <a href="http://www.rockpapershotgun.com/2015/09/15/albino-lullaby-review/">my review of Albino Lullaby</a> this week, I included a throwaway line that I then didn&#8217;t justify in pictorial form. I wrote that it features, &#822#8220;the best toilet in gaming history.&#8221; You can&#8217;t just say a thing like that and expect not to be required to prove it. I think the image above has already done that, but there are more, just in case &#8211; click on them to appreciate them fully.</em></p> <p> <a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/#more-314999" class="more-link">Read the rest of this entry &raquo;</a></p> </div> <footer class="article-footer"> <div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/albino-lullaby/" rel="tag">Albino Lullaby</a>, <a href="http://www.rockpapershotgun.com/tag/ape-law/" rel="tag">Ape Law</a>, <a href="http://www.rockpapershotgun.com/tag/feature/" rel="tag">feature</a>, <a href="http://www.rockpapershotgun.com/tag/toilets-in-games/" rel="tag">toilets-in-games</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.com/2015/09/17/is-this-gamings-greatest-toilet-the-toilet-publishers-dont-want-you-to-see/#comments" title="Comment on Is This Gaming&#8217;s Greatest Toilet? The Toilet Publishers Don&#8217;t Want You To See">20 Comments &#187;</a></p> </footer> </div> </div> <div id="post-315221" class="block featured-block"> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/" rel="bookmark" title="Permanent Link to Warhammer 40,000: Deathwatch Crusading Onto PC">Warhammer 40,000: Deathwatch Crusading Onto PC</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#e584c3c6d4d5ddde8cc3c6dcdcde80c3c6d3d1dec3c6d4d4d1dec3c6d4d4d4de86c3c6d4d5d2dec3c6d4d4d7de8495c3c6d4d5d4de97c3c6d4d4d0dec3c6d4d5d1deXo&#116;gu&#110;&#46;&#99;o&#109;">Alice O'Connor</a> on September 17th, 2015 at 4:11 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Warhammer 40,000: Deathwatch Crusading Onto PC http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/"><span>Twitter</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc//"><span>Reddit</span></a></li> </ul> </div> </div> <p><img src="http://www.rockpapershotgun.com/images/15/sep/17wh40kdeathwatch.jpg" title="Aye, a can of Raid won't solve this one."/></p> <p>The Warhammer 40,000 game I&#8217;d really like is still <a href="http://www.rockpapershotgun.com/2015/07/14/dawn-of-war-3-rumours/">Dawn of War 3</a>, but in the meantime I shall need to investigate other opportunities to wear a big ole skull on my crotch.</p> <p>Rodeo Games, the folks behind <a href="http://www.rockpapershotgun.com/tag/warhammer-quest/">Warhammer Quest</a>, have announced that they&#8217;re bringing another mobile doodad over to PC a little fancied up, and this one has all the crotchskulls I demand &#8211; Warhammer 40,000: Deathwatch [<a href="http://rodeogames.co.uk/deathwatch">official site</a>]. It&#8217;s a turn-based tactical affair about hunting down and squishing those naughty Tyranids, from cities to the guts of bio-ships, while expanding, levelling up, and equipping your Deathwatch Kill Team.</p> <p> <a href="http://www.rockpapershotgun.com/2015/09/17/warhammer-40k-deathwatch-pc/#more-315221" class="more-link">Read the rest of this entry &raquo;</a></p> </div> <footer class="article-footer"> <div class="hr"></div> <p class="tags hidden-mobile"><a href="http://www.rockpapershotgun.com/tag/rodeo-games/" rel="tag">Rodeo Games</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000/" rel="tag">Warhammer 40000</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000-deathwatch/" rel="tag">Warhammer 40000: Deathwatch</a>, <a href="http://www.rockpapershotgun.com/tag/warhammer-40000-deathwatch-enhanced-edition/" rel="tag">Warhammer 40000: Deathwatch - Enhanced Edition</a>.</p> <p class="comments"><a href="http://www.rockpapershotgun.{{that is}}com/2015/09/17/warhammer-40k-deathwatch-pc/#comments" title="Comment on Warhammer 40,000: Deathwatch Crusading Onto PC">10 Comments &#187;</a></p> </footer> </div> </div> <div id="post-299851" class="block featured-block"> <div class="post-inner"> <h2><a href="http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate/" rel="bookmark" title="Permanent Link to Have You Played&#8230; Kyrandia 2: Hand Of Fate?">Have You Played&#8230; Kyrandia 2: Hand Of Fate?</a></h2> <div class="entry"> <div class="top-matter hidden-mobile"> <aside class="byline"> <p>By <a href="/cdn-cgi/l/email-protection#91b7b2a0a0a5aab7b2a0a1a4aab7b2a8a8aab7b2a0a1a5aaf0b7b2a0a0a5aaf5b7b2a7a5aae3feb7b2a8a8aafab7b2a0a0a3aaf0b7b2a0a0a3aab7b2a0a1a0aab7b2X114;&#115;hot&#103;un.&#99;&#111;&#109;">Richard Cobbett</a> on September 17th, 2015 at 3:00 pm.</p> </aside> <div class="social-buttons"> <h4>Share this:</h4> <ul class="social-icons"> <li><a class="social-facebook icon-facebook" href="http://www.facebook.com/sharer.php?u=http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate//"><span>Facebook</span></a></li> <li><a class="social-twitter icon-twitter" href="http://twitter.com/intent/tweet?text=Have You Played&#8230; Kyrandia 2: Hand Of Fate? http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate/"><span>{{this is}}</span></a></li> <li><a class="social-reddit icon-reddit" href="http://www.reddit.com/submit?url=http://www.rockpapershotgun.com/2015/09/17/have-you-played-kyrandia-2-hand-of-fate//"><span>Reddit</span></a></li> </ul> </div> </div>';
        //str = '<div><!--sfera><--!></div><p></p><br /><div>{{two}}</div>';
        str = '<div>{{one}}</div><p></p><br /><div>{{two}}</div>';
        str = str.replace(MUSTACHE, myRep); // return 'gold ' + capture + '|' + match; "gold ring|string"
        /**/

        var value = source || attr.source;

        // mustache
        if (attr.mustache) {
            function rep(match, capture) {
                return Sfera.client.getNodeValue(capture);
            }
            value = value.replace(MUSTACHE, rep);
        }

        // type
        switch (attr.type) {
            case "integer":
                value = parseInt(value);
                break;
            case "string":
                break;
            case "boolean":
                value = !(value === "false" || value === false || value === undefined || value === null);
                break;
            case "regexp":
                try {
            		value = new RegExp(value); // add begin and end, it has to match the whole string
            	} catch (err) {
            		value = null;
            	}

                break;
        }

        // done
        return value;
    };

})();


/**
 * Sfera.Attribute Component attribute
 *
 * @namespace Sfera.Attribute
 */
Sfera.Attribute = function(component, config) {
    // type
    this.type = "string";
    // needs to be compiled?
    this.changed = false;
    // value source
    this.source = "";
    // compiled value
    this.value = "";
    // owner component
    this.component = component;

    for (var c in config) {
        switch (c) {
        case "type":
        case "source":
        case "value":
            this[c] = config[c];
            break;
        case "set":
        case "get":
        case "compile":
        case "update":
            this[c] = config[c].bind(this);
            break;
        }
    }
};
Sfera.Attribute.prototype = {
    set: function(value, manualUpdate) {
        if (this.source == value) return; // no changes

        this.changed = true; // if true, we need to call compile
        this.source = value;
        var mustache = Sfera.Compiler.getMustacheData(value);
        var eq = (this.mustache && mustache && this.mustache.vars.equals(mustache.vars)); // old and new mustache data variables are equal
        // remove old observers
        if (this.mustache && !eq) {
            for (var i=0; i<this.mustache.vars.length; i++)
                Sfera.client.removeAttrObserver(this.mustache.vars[i], this);
        }
        this.mustache = mustache;
        // add new observers
        if (this.mustache && !eq) {
            for (var i=0; i<this.mustache.vars.length; i++)
                Sfera.client.bindAttrObserver(this.mustache.vars[i], this);
        }
        if (!manualUpdate)
            this.compile();
    },

    get: function() {
        return this.value;
    },

    compile: function () {
        var value = Sfera.Compiler.compileAttributeValue(this);
        // update only if changed. TODO: same source compiles to different values???????????????????
        if (value != this.value) {
            this.changed = false;
            this.value = value;
            this.update();
        }
    },

    update: function () {
        // do something with the value
    }
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
		};

		// get components by ..
		this.getByType = function (type) { return getBy(byType,type); }
		this.getByAddress = function (address) { return getBy(byAddress,address); }
		this.getById = function (id) { return getBy(byId,id); }
	}; // components

	// index component
	this.index = function (o) {
		components.add(o);
	};

	// get single object (first) by id
	this.getObjById = function (id) {
		return components.getById(id)[0];
	};

	// get components by id
	this.getObjsById = function (id) {
		return components.getById(id);
	};

	// get components by type
	this.getObjsByType = function (type) {
		return components.getByType(type);
	};

	// get value from single object (first) by id
	this.getObjValue = function (id) {
		var o = components.getById(id)[0];
		return o && o.getValue?o.getValue():null;
	};

	// get fav pages (for app)
	this.getFavPages = function () {
		var pages = [];
		var links = this.getObjsByType("link");
		for (var i=0; i<links.length; i++)
			 pages.push(links[i].target);

		pages = pages.unique().sort();

		return pages;
	};

};


/**
* Sfera.Components singleton that handles components
*
* @namespace Sfera.Components
*/
Sfera.Components = new (function () {

    this.setSource = function (componentName, source) {
        var cc = this.getClass(componentName);
        cc.prototype.source = Sfera.Compiler.compileHTML(source);
    };

    this.getClassName = function (componentName) {
        return componentName[0].toUpperCase() + componentName.substr(1);
    };

    this.getClass = function (componentName) {
        return Sfera.Components[this.getClassName(componentName)];
    };

    this.createInstance = function(componentName, attributes) {
        // component class
        var cc = this.getClass(componentName);

        // no component with that name
        if (cc == null)
            return null;

        var component = new cc({attributes:attributes});

        return component;
    };

    this.create = function (name,config) {
        // constructor
        Sfera.Components[name] = function Component (config) {
            // html element
            if (config.element) {
                this.element = element;
            } else {
                // DOM
                var d = document.createElement("div");
                d.innerHTML = this.source;

                this.element = Sfera.Utils.getFirstChildNodeOfType(d, 1);
                this.element.controller = this;

                this.element.setAttribute("data-controller",name);

                // TODO: get children components
                // fastest way.. parse the whole html code and then dig through and associate?
                // also for composed components, save the html the first time you dig through, to optimize
            }

            // attributes
            this.attributes = {};
            for (var attr in this.attrDefs) {
                this.attributes[attr] = new Sfera.Attribute(this, this.attrDefs[attr]);
            }
            // attribute values
            if (config.attributes) {
                for (var attr in config.attributes) {
                    this.setAttribute(attr, config.attributes[attr]);
                }
            }

            // init
            this.super("_Base","init");
            this.init();
        };
        var comp = Sfera.Components[name];

        // non standard, allows developer tools to display object class names correctly
        comp.displayName = "Sfera.Component."+name;
        /*
        Object.defineProperty(Sfera.Components[name], 'name', {
          value: "Sfera.Component."+name
        });
        */

        // extends
        if (!config.extends)
            config.extends = "_Base";

        var sup = Sfera.Components[config.extends].prototype;

        comp.prototype = Object.create(sup);
        comp.prototype.constructor = comp;
        comp.prototype.type = name;

        // copy attributes
        comp.prototype.attrDefs = {};
        for (var a in sup.attrDefs) {
            comp.prototype.attrDefs[a] = sup.attrDefs[a];
        }

        for (var f in config) {
            switch (f){
                case "behaviors":
                    var be;
                    for (var i=0; i < config.behaviors.length; i++) {
                        be = Sfera.Behaviors[config.behaviors[i]];
                        be.call(comp.prototype); // extend prototype
                    }
                    break;
                case "attributes":
                    for (var attr in config.attributes) {
                        comp.prototype.attrDefs[attr] = config.attributes[attr];
                    }
                    break;

                default:
                    comp.prototype[f] = config[f];
                    if (typeof comp.prototype[f] === "function")
                        comp.prototype[f].displayName = "Sfera.Components."+name+"."+f;
                    break;
            }
        }
    };

})();


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
    var paused = false;

    // currently visible page
    this.cPage = null;

    var manifestTimestamp = 0;

    var self = this;


    var interfaceC;
    /**
     * Initialize the client and start it.
     *
     * @method Sfera.Client#boot
     * @protected
     */
    this.boot = function(url) {
        if (this.isBooted)
            return;

        var location = Sfera.Browser.getLocation();

        this.name = location.interface;
        this.isLogin = location.login;

        if (config.timestamp)
            manifestTimestamp = config.timestamp;

        Sfera.client = this;


        this.isBooted = true;

        this.components = new Sfera.ComponentManager(this);

        // get name
        this.name = config.interface;

        if (true || this.config.enableDebug) {
            this.debug = Sfera.Debug;
            this.debug.boot();
        } else {

        }

        if (window.focus) {
            window.focus();
        }

        Sfera.Debug.showHeader();

        // configure Sfera.Net
        Sfera.Net.onReply.add(onReply);
        Sfera.Net.onEvent.add(onEvent);
        Sfera.Net.onUpdateDictionary.add(onUpdateDictionary);
        Sfera.Net.onUpdateIndex.add(onUpdateIndex);
        Sfera.Net.connect();

        window.onresize = adjustLayout;

        delete config;
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
    function onReply(json) {
        if (json.result && json.result.uiSet) {
            for (var u in json.result.uiSet) {
                var n = u.split(".");
                var a = n.pop();
                var c = self.components.getObjsById(n.join("."));
                for (var i = 0; i < c.length; i++) {
                    c[i].setAttribute(a, json.result.uiSet[u]);
                }
            }
        }
    }

    function onUpdateDictionary(xmlDoc) {
        var root = Sfera.Compiler.compileDictionary(xmlDoc);
    };

    function onUpdateIndex(xmlDoc) {
        var root = Sfera.Compiler.compileXML(xmlDoc);
        document.getElementById("sfera").appendChild(root.element);

        self.start();
    };

    this.start = function() {
        Sfera.Browser.start();
        interfaceC = this.components.getObjsByType("Interface")[0];
        adjustLayout();
    }

    this.indexComponent = function(component) {
        this.components.index(component);
    };

    this.setAttribute = function(id, name, value) {
        var c = this.components.getObjsById(id);
        for (var i = 0; i < c.length; i++)
            c[i].setAttribute(name, value);
    };

    this.getAttribute = function(id, name) {
        var c = this.components.getObjById(id); // get first onerror
        return c.getAttribute(name);
    };

    this.showPage = function(id) {
        if (id.indexOf(":") == -1)
            id = "page:" + id;

        if (this.cPage)
            this.cPage.setAttribute("visible", false);

        var p = this.components.getObjById(id);
        if (p) {
            p.setAttribute("visible", true);
            this.cPage = p;
            Sfera.Browser.updateUrl(id, p.getAttribute("title"));
        } else {
            console.log("page not found: " + id);
        }
    };

    var commandQueue = [];
    this.sendCommand = function(command, callback) {
        var tag = (new Date()).getTime();
        var req = {
            command: command,
            tag: tag,
            callback: callback
        };
        commandQueue.push(req);
        Sfera.Net.sendCommand(req);

        return tag;
    };

    var eventQueue = [];
    this.sendEvent = function(id, value, callback) {
        var tag = (new Date()).getTime(); // request id
        var req = {
            id: "webapp.ui." + id,
            value: value,
            tag: tag,
            callback: callback
        };
        eventQueue.push(req, callback);
        Sfera.Net.sendEvent(req);

        return tag;
    };


    var nodeValues = {};

    this.getNodeValue = function(node) {
        return nodeValues[node] ? nodeValues[node] : "";
    }

    function onEvent(json) {
        // {"type":"event","events":{"remote.myvalue":"5","system.plugins":"reload","remote.":"undefined","system.state":"ready"}}
        // {"type":"event","events":{"gui.button_link1.label":"changed"}}
        for (var e in json.nodes) {
            var n = e.split(".");
            switch (n[0]) {
                case "ui":
                    if (n[1] == "set") { // ui.set.<global | cid>
                        n = n.slice(3); // remove ui, set, global | cid
                        var a = n.pop();
                        var c = self.components.getObjsById(n.join("."));
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
                        if (json.nodes[e] != manifestTimestamp) {
                            manifestTimestamp = json.nodes[e];
                            Sfera.Browser.reload();
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
    }

    function adjustLayout() {
        // not initialized yet
        if (!interfaceC) return;

        var width = parseInt(interfaceC.getAttribute("width"));
        var height = parseInt(interfaceC.getAttribute("height"));

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

            interfaceC.element.style.display = "none";
            interfaceC.element.style.left = left + "px";
            interfaceC.element.style.top = top + "px";
            interfaceC.element.style.display = "block";
        } // viewportWidth>0
    } // adjustLayout()


    var attrObservers = {};
    // attribute observers
    this.bindAttrObserver = function(node, attribute) {
        if (!attrObservers[node])
            attrObservers[node] = new Sfera.Signal();
        attrObservers[node].addOnce(attribute.compile, attribute);
    }
    this.removeAttrObserver = function(node, attribute) {
        attrObservers[node].remove(attribute.compile, attribute);
    }
};


/**
 * Debug obj
 *
 * @class Sfera.Client
 * @constructor
 */
Sfera.Debug = new(function() {
    var self = this;
    var logE,
        debugE;

    // this needs to be done on Device?
    //
    document.addEventListener("keydown", keyDown, false);

    this.visible = false;

    this.boot = function() {
        logE = document.getElementById("debugLog");
        debugE = document.getElementById("debug");
        show(false);
    };

    this.toggle = function() {
        this.visible = !this.visible;
        show(this.visible);
    };

    function show(v) {
        debugE.style.display = v ? "block" : "none";
        if (v)
            self.initPane();
    };

    function keyDown(e) {
        var keyCode = e.keyCode;
        if (keyCode == 13) {
            // enter key
        } else if (event.altKey && event.keyCode >= 65 && event.keyCode <= 90) { // if a letter pressed
            switch (String.fromCharCode(event.keyCode)) {
                case "D":
                    self.toggle();
                    break;
            }
        } else {

        }
        return true;
    }

    var logCounter = 0;
    this.log = function(level, title, txt) {
        logCounter++;

        var ds = Sfera.Utils.getDate();
        title = ds + " - " + title;

        var src =
            '<label class="menu_label" for="debugEntry' + logCounter + '">' +
            title +
            '</label>' +
            '<input type="checkbox" id="debugEntry' + logCounter + '" /><div class="arrow"></div>' +
            '<ol><li><textarea style="width:500px; height:200px">' +
            txt +
            '</textarea></li></ol>';

        var e = document.createElement("div");
        e.innerHTML = src;
        logE.appendChild(e);
    };

    /**
     * Displays a Sfera version debug header in the console.
     *
     * @method Sfera.Client#showDebugHeader
     * @protected
     */
    this.showHeader = function() {

        var v = Sfera.VERSION;

        var c = 2;
        var a = "hello";

        if (Sfera.Device.chrome) {
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
        } else if (window.console) {
            console.log('Sfera v' + v + ' | ' + a + ' | http://sferalabs.cc');
        }

    };



})();




/////////////////////
Sfera.Debug.initPane = function() {
    /*
     * @author https://twitter.com/blurspline / https://github.com/zz85
     * See post @ http://www.lab4games.net/zz85/blog/2014/11/15/resizing-moving-snapping-windows-with-js-css/
     */

    // Minimum resizable area
    var minWidth = 60;
    var minHeight = 40;

    // Thresholds
    var FULLSCREEN_MARGINS = -10;
    var MARGINS = 10;

    // End of what's configurable.
    var clicked = null;
    var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

    var rightScreenEdge, bottomScreenEdge;

    var preSnapped;

    var b, x, y;

    var redraw = false;

    var pane = document.getElementById('debugPane');
    var paneTitle = document.getElementById('debugTitle');
    var ghostpane = document.getElementById('debugGhost');

    paneTitle.style.width = pane.style.width;

    function setBounds(element, x, y, w, h) {
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.width = w + 'px';
        element.style.height = h + 'px';
    }

    function hintHide() {
        setBounds(ghostpane, b.left, b.top, b.width, b.height);
        ghostpane.style.opacity = 0;

        // var b = ghostpane.getBoundingClientRect();
        // ghostpane.style.top = b.top + b.height / 2;
        // ghostpane.style.left = b.left + b.width / 2;
        // ghostpane.style.width = 0;
        // ghostpane.style.height = 0;
    }


    // Mouse events
    pane.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    // Touch events
    pane.addEventListener('touchstart', onTouchDown);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);


    function onTouchDown(e) {
        onDown(e.touches[0]);
        e.preventDefault();
    }

    function onTouchMove(e) {
        onMove(e.touches[0]);
    }

    function onTouchEnd(e) {
        if (e.touches.length == 0) onUp(e.changedTouches[0]);
    }

    function onMouseDown(e) {
        onDown(e);
        e.preventDefault();
    }

    function onDown(e) {
        calc(e);

        var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

        clicked = {
            x: x,
            y: y,
            cx: e.clientX,
            cy: e.clientY,
            w: b.width,
            h: b.height,
            isResizing: isResizing,
            isMoving: !isResizing && canMove(),
            onTopEdge: onTopEdge,
            onLeftEdge: onLeftEdge,
            onRightEdge: onRightEdge,
            onBottomEdge: onBottomEdge
        };
    }

    function canMove() {
        return x > 0 && x < b.width && y > 0 && y < b.height && y < 30;
    }

    function calc(e) {
        b = pane.getBoundingClientRect();
        x = e.clientX - b.left;
        y = e.clientY - b.top;

        onTopEdge = y < MARGINS;
        onLeftEdge = x < MARGINS;
        onRightEdge = x >= b.width - MARGINS;
        onBottomEdge = y >= b.height - MARGINS;

        rightScreenEdge = window.innerWidth - MARGINS;
        bottomScreenEdge = window.innerHeight - MARGINS;
    }

    var e;

    function onMove(ee) {
        calc(ee);

        e = ee;

        redraw = true;

    }

    function animate() {

        requestAnimationFrame(animate);

        if (!redraw) return;

        redraw = false;

        if (clicked && clicked.isResizing) {

            if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
            if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

            if (clicked.onLeftEdge) {
                var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);
                if (currentWidth > minWidth) {
                    pane.style.width = currentWidth + 'px';
                    pane.style.left = e.clientX + 'px';
                }
            }

            if (clicked.onTopEdge) {
                var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
                if (currentHeight > minHeight) {
                    pane.style.height = currentHeight + 'px';
                    pane.style.top = e.clientY + 'px';
                }
            }

            hintHide();

            paneTitle.style.width = pane.style.width;

            return;
        }

        if (clicked && clicked.isMoving) {

            if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
                // hintFull();
                setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
                ghostpane.style.opacity = 0.2;
            } else if (b.top < MARGINS) {
                // hintTop();
                setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
                ghostpane.style.opacity = 0.2;
            } else if (b.left < MARGINS) {
                // hintLeft();
                setBounds(ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
                ghostpane.style.opacity = 0.2;
            } else if (b.right > rightScreenEdge) {
                // hintRight();
                setBounds(ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
                ghostpane.style.opacity = 0.2;
            } else if (b.bottom > bottomScreenEdge) {
                // hintBottom();
                setBounds(ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
                ghostpane.style.opacity = 0.2;
            } else {
                hintHide();
            }

            if (preSnapped) {
                setBounds(pane,
                    e.clientX - preSnapped.width / 2,
                    e.clientY - Math.min(clicked.y, preSnapped.height),
                    preSnapped.width,
                    preSnapped.height
                );

                paneTitle.style.width = pane.style.width;

                return;
            }

            // moving
            pane.style.top = (e.clientY - clicked.y) + 'px';
            pane.style.left = (e.clientX - clicked.x) + 'px';

            paneTitle.style.width = pane.style.width;

            return;
        }

        // This code executes when mouse moves without clicking

        // style cursor
        if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
            pane.style.cursor = 'nwse-resize';
        } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
            pane.style.cursor = 'nesw-resize';
        } else if (onRightEdge || onLeftEdge) {
            pane.style.cursor = 'ew-resize';
        } else if (onBottomEdge || onTopEdge) {
            pane.style.cursor = 'ns-resize';
        } else if (canMove()) {
            pane.style.cursor = 'move';
        } else {
            pane.style.cursor = 'default';
        }
    }

    animate();

    function onUp(e) {
        calc(e);

        if (clicked && clicked.isMoving) {
            // Snap
            var snapped = {
                width: b.width,
                height: b.height
            };

            if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
                // hintFull();
                setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
                preSnapped = snapped;
            } else if (b.top < MARGINS) {
                // hintTop();
                setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
                preSnapped = snapped;
            } else if (b.left < MARGINS) {
                // hintLeft();
                setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
                preSnapped = snapped;
            } else if (b.right > rightScreenEdge) {
                // hintRight();
                setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
                preSnapped = snapped;
            } else if (b.bottom > bottomScreenEdge) {
                // hintBottom();
                setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
                preSnapped = snapped;
            } else {
                preSnapped = null;
            }

            hintHide();

        }

        clicked = null;

    }
};


/**
 * Log obj
 *
 * @class Sfera.Log
 * @constructor
 */
Sfera.Log = new(function() {

    // logging levels
    // ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF
    this.ALL = 1;
    this.DEBUG = 2;
    this.INFO = 3;
    this.WARN = 4;
    this.ERROR = 5;
    this.FATAL = 6;
    this.OFF = 7;

    var _level = this.WARN;

    // set the level
    this.setLevel = function (level) {
        _level = level;
    };

})();


/**
 * Login obj
 *
 * @class Sfera.Login
 * @constructor
 */
Sfera.Login = new(function() {

    var checkTimeout = null;
    var checkMs = 500;
    var req;

    var action = "";

    this.login = function (user, password) {
        if (!req)
            initReq();

        action = "login";

        resetCheck();

        user = user || Sfera.client.getAttribute("username","value");
        password = password || Sfera.client.getAttribute("password","value");

        req.open("/api/login?user=" + user + "&password=" + password, 100);
    };

    this.logout = function () {
        if (!req)
            initReq();

        action = "logout";

        req.open("/api/logout", 100);
    };

    function initReq() {
        req = new Sfera.Net.Request();

        req.onLoaded = function() {
            clearTimeout(checkTimeout);

            switch (action) {
            case "login":
            	window.location.replace("/"+Sfera.client.name);
            	break;
            case "logout":
                window.location.reload();
                break;
            }
        }
        req.onError = function() {
            resetCheck();
        }

    }

    function checkLogin() {
        // req.open("/api/login",100);
    }

    function resetCheck() {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkLogin, checkMs);
    }

    window.onload = function() {
        resetCheck(); // start now
    }

})();


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


var mySingleton = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {

    // Singleton

    // Private methods and variables
    function privateMethod(){
        consolthis.element.log( "I am private" );
    }

    var privateVariable = "Im also private";

    return {

      // Public methods and variables
      publicMethod: function () {
        consolthis.element.log( "The public can see me!" );
      },

      publicProperty: "I am also public"
    };

  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }

  };

})();

// Usage:

var singleA = mySingleton.getInstance();


Sfera.UI = new (function(){
    var pressedBt;
    var lastButton;

    this.skipButtonEvents = false; // won't fire any button events (ex. while we're dragging)
    this.overEnabled = true; // mouse over effect enabled?
    this.buttonFeedbackEnabled = true;

    this.setPressedButton = function(bt) {
        pressedBt = bt;
    };

	// get pressedBt button
	this.getPressedButton = function () {
		return pressedBt;
	}; // getTouchedButton()

	// update last button
	this.updateLastButton = function () {
		lastButton = pressedBt;
	}; // getTouchedButton()

    // get last clicked button
	this.getLastButton = function () {
		return lastButton;
	}; // getLastButton()

    // lift pressed button. bt or currently pressed button if any
	this.liftButton = function (bt) {
		if (pressedBt && (!bt || bt == pressedBt)) {
			if (pressedBt.data.state) {
				pressedBt.data.state = "";
				pressedBt.updateClass();
			}
			// on lift event?
			if (pressedBt.onLift)
				pressedBt.onLift();
			pressedBt = null;
			return true;
		}
		return false;
	}; // liftButton()

	// reset button: lifts and clear state (over)
	this.resetButton = function (bt) {
		// bt is currently pressedBt? otherwise reset the class
		if (!this.liftButton(bt)) {
			bt.data.state = "";
			bt.updateClass();
		}
	};

})();

Sfera.UI.Button = function (element, events) {
    this.element = element;
    this.element.btObj = this;

    this.initData();
    if (events)
        this.initEvents(events);
};
Sfera.UI.Button.prototype = {
    // possible button style attributes
    _attributes: {
        "disabled":0,
        "selected":1,
        "pressed":2,
        "checked":3,
        "mini":4,
        "error":5
    },

    initData: function () {
        var colors = [
            "light",
            "stable",
            "positive",
            "calm",
            "balanced",
            "energized",
            "assertive",
            "royal",
            "dark"
        ];

        var cs = this.element.className;
        var ss = "(.*\\s)?([mc][^\\s]*Button)(\\s("+colors.join("|")+"))?(\\s.*)?(\\sover|\\sdown)?"; // search string (button color regexp in includthis.element.js)
        var rx = new RegExp(ss);
        var matches = rx.exec(cs);

        // build obj. pre, button class, attributes (binary string based on
        if (!matches || !matches[2]) // should this happen?
            var obj = {pre:cs, bc:"", color:"", attrs:[], state:""};
        else
            var obj = {pre:matches[1]?matches[1]:"",
                        bc:matches[2],
                        color:matches[4]?matches[4]:"", // r,g,b..
                        attrs:[],
                        state:matches[6]?matches[6].substr(1):""}; // ,over,down
        // attributes
        for (var a in this._attributes)
            obj.attrs[this._attributes[a]] = (matches && matches[5])?matches[5].indexOf(" "+a)!=-1:false;

        this.data = obj;
        this.onLift = null;
        this.dontLiftOnMove = false;
    },

    // button class:
	//  [...] [cm][...]Button [color]? [any button attribute] [state] [...]

	// init button events. f is an object containing all events, options?
	initEvents: function (f) {
		if (f.onclick) // default action is on up
			f.onup = f.onclick;

		if (Sfera.Device.touch) {
            this.element.ontouchstart = this.onEvent.bind(this,'touchstart',f.ondown,null);
            this.element.ontouchmove = this.onEvent.bind(this,'touchmove',f.onmove,f.onout);
            this.element.ontouchstart = this.onEvent.bind(this,'touchend',f.onup,null);
		} else {
            this.element.onmouseover = this.onEvent.bind(this,'mouseover',f.onover,null);
			this.element.onmouseout = this.onEvent.bind(this,'mouseout',f.onout,null);
			if (f.onmove)
				this.element.onmousemove = this.onEvent.bind(this,'mousemove',f.onmove,null);
			this.element.onmousedown = this.onEvent.bind(this,'mousedown',f.ondown,null);
			this.element.onmouseup = this.onEvent.bind(this,'mouseup',f.onup,null);
		}

		// on lift? when button is lifted with liftButton() (ex. when scrolling)
		if (f.onlift)
			this.onLift = f.onlift;
		// temporary (???) solution for divs that require drag for more than n pixels
		if (f.dontLiftOnMove)
			this.dontLiftOnMove = true;
		var d;
		//for (var i = 0; (d = this.element.getElementsByTagName("img")[i]); i++) initImg(d);
	}, // initButtonEvents()

	// clear button events
	clearEvents: function () {
		if (Sfera.Device.touch) {
			delete this.element.ontouchstart;
			delete this.element.ontouchmove;
			delete this.element.ontouchend;
		} else {
			delete this.element.onmouseover;
			delete this.element.onmouseout;
			delete this.element.onmousedown;
			delete this.element.onmouseup;
		}
	}, // clearButtonEvents()

	// set button color
	setColor: function (c) {
		this.data.color = c;
		this.updateClass(); // update class based on this.data
	}, // setButtonColor()

	// enabled/disabled button
	enable: function (enable) {
		this.setAttribute(this.element, "disabled", !enable);
	}, // enableButton()

	// select/deselect button
	select: function (select) {
		this.setAttribute(this.element, "selected", select);
	}, // selectButton()

	// set mini mode
	mini: function (mini) {
		this.setAttribute(this.element, "mini", mini);
	}, // miniButton()

	// get button style attribute
	getAttribute: function (attrName) {
		if (!this.data)
            this.initData(); // can happen when events are assigned manually
		return this.data.attrs[this._attributes[attrName]];
	}, // getButtonAttribute()

	// set button style attributthis.element. name and value (true or false)
    setAttribute: function (attrName,attrValue) {
		if (this.getAttribute(attrName) != attrValue) {
			this.data.attrs[this._attributes[attrName]] = attrValue;
			this.updateClass(); // update class based on this.data
		}
	}, // setButtonAttribute()

	// update button class from its btObj
	updateClass: function () {
		var d = this.data;
		var c = d.pre+d.bc
		if (d.color)
			c += " "+d.color;
		for (var a in this._attributes)
			if (d.attrs[this._attributes[a]])
				c += " "+a;
		if (Sfera.UI.buttonFeedbackEnabled && d.state)
			c += " "+d.state;
		this.element.className = c;
	},

	disableAndroidLongPress: function (evt,e) {
		if (browser.OS == "Android") {
			var d = e;
			while (d) {
				if (d.getAttribute && d.getAttribute("data-scrollmode")) return; // scrollable, don't disable the long press
				d = d.parentNode;
			}
			evt.preventDefault && evt.preventDefault();
			evt.stopPropagation && evt.stopPropagation();
			evt.cancelBubble = true;
			evt.returnValue = false;
		}
	},

    // prevent default event
    preventDefault: function (evt) {
        if (evt.returnValue)
            evt.returnValue = false;
        if (evt.preventDefault)
            evt.preventDefault();
    },

	// generic button event. graphic feedback and function associated to the event. f can be a string or a function(event,e). of is an additional optional function (user on touchmove for onout). clt: cancel long touch on android devices when clicking on an image
	onEvent: function (w,f,of,event) {
        if (Sfera.UI.skipButtonEvents) return;

		// event
		var evt = window.event || event;

		// touchevents or not?
		if (w == "touchstart" || w == "touchend" || w == "touchmove") {
			if (!Sfera.Device.touch) return false;
		} else {
			if (evt)
				this.preventDefault(evt);
			if (Sfera.Device.touch) return false;
		}

        // can happen when events are assigned manually
		if (!this.data)
            this.initData();

		var swi = this.data.attrs[this._attributes["switch"]]; // behave like a switch?
		var swip = swi?this.data.attrs[this._attributes["pressed"]]:false; // switch pressed
		var nswip = swip; // new switch pressed value, to notice if it changes

		var s = ""; // class to add, down/over (only if not disabled)
		if (!this.data.attrs[this._attributes["disabled"]]) switch (w) {
		case "touchstart":
			Sfera.UI.setPressedButton(this);
			lastButton = null;
			touchStartX = evt.touches[0].clientX;
			touchStartY = evt.touches[0].clientY;
			s = "down";
			if (swi) nswip = !swip;
			disableAndroidLongPress(evt,this.element);
			break;
		case "touchmove":
			if (Sfera.UI.getPressedButton() == this) {
				s = "down";
				if (!this.dontLiftOnMove && // temporary (?) solution for divs that require drag for more than 40px
					(Math.abs(evt.touches[0].clientX - touchStartX) > 30 ||
					 Math.abs(evt.touches[0].clientY - touchStartY) > 30)) {
					  Sfera.UI.setPressedButton(null);
					  f = of; // execute optional function if any
				}
			}
			disableAndroidLongPress(evt,this.element);
			break;
		case "touchend":
			if (Sfera.UI.getPressedButton() != this) {
				f = null; // won't execute the function
			} else {
				Sfera.UI.updateLastButton(); // store it
				this.preventDefault(evt);
			}
			Sfera.UI.setPressedButton(null);
			disableAndroidLongPress(evt,this.element);
			break;
		case "mouseover":
            var pressedBt = Sfera.UI.getPressedButton();
			if (pressedBt) {
				if (pressedBt == this.element)
					s = "down";
			} else if (Sfera.UI.overEnabled) s = "over"; // over only on manager
			break;
		case "mousemove":
			break;
		case "mouseout":
			// if we're still on the same div, do nothing
			var reltg;
			if (evt) // no evt if we're calling onEvent from code (like Login, on keydown)
				reltg = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
			if (reltg) {
				while (reltg && reltg != this.element && reltg.nodeName != 'BODY')
					reltg = reltg.parentNode;
				if (reltg == this.element) return;
			}
			Sfera.UI.setPressedButton(null);
			break;
		case "mousedown":
			Sfera.UI.setPressedButton(this);
			lastButton = null;
			s = "down";
			if (swi) nswip = !swip;
			break;
		case "mouseup":
			if (Sfera.UI.getPressedButton() != this) {
				f = null; // won't execute the function
			} else {
                Sfera.UI.updateLastButton()
			}
            Sfera.UI.setPressedButton(null);
			if (Sfera.UI.overEnabled)
				s = "over"; // over only on manager
			break;
		}

		// update class based on this.data
		if (s != this.data.state || nswip != swip) {
			this.data.state = s;
			if (swi)
				this.data.attrs[this._attributes["pressed"]] = nswip;
			this.updateClass();
		}

		// function
		if (f && f!="null" && !this.data.attrs[this._attributes["disabled"]]) {
			// if f is a string, create a new function, otherwise just call it with (event,this.element)
			var func = (typeof(f) == "string")?new Function("event","this.element",f):f;
			func(event,this.element);
		}
		// don't prevent default to allow scrolling
		return false;
	} // onEvent()
};


/**
 * Sfera.Net handles browser URL related tasks such as checking host names, domain names and query string manipulation.
 *
 * @class Sfera.Net
 * @constructor
 */
Sfera.Net = new (function() {
    // getURL function
    this.getURL = function(name) {
    	switch (name) {
    	case "dictionary":  return Sfera.client.name+(Sfera.client.isLogin?"/login":"")+"/dictionary.xml";
    	case "index" :      return Sfera.client.name+(Sfera.client.isLogin?"/login":"")+"/index.xml";
    	case "subscribe" :  return "subscribe?id="+(Sfera.client.net.subscribeId?Sfera.client.net.subscribeId+"&":"")+"nodes=*";
    	case "state" :      return "state/"+Sfera.client.net.subscribeId+"?ts="+Sfera.client.stateTs;
        case "command":     return "command";
        case "event":       return "event";
        case "websocket":   return (Sfera.Browser.getLocation().protocol == "https:" ? "wss:" : "ws:")+
                                    "//"+Sfera.Browser.getLocation().host+"/api/websocket";
        }
	};

    var _defaultConfig = {
        //name: Sfera.Browser.getLocation().interface,

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


    var req;

    var webSocket;
    var wsConnected = false;

    var self = this;
    var httpBaseUrl = "/";

    var connectionId;
    var pingInterval;
    var responseTimeout;
    var connCheckTimeoutId;

    var cSync = ""; // currently synchronizing resource

    var self = this;

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
    this.onMessage = new Sfera.Signal();
    this.onEvent = new Sfera.Signal();
    this.onReply = new Sfera.Signal();
    this.onUpdateDictionary = new Sfera.Signal();
    this.onUpdateIndex = new Sfera.Signal();

    function onWsOpen(event) {
        // For reasons I can't determine, onopen gets called twice
        // and the first time event.data is undefined.
        // Leave a comment if you know the answer.
        if (event.data === undefined)
            return;

        Sfera.Debug.log(Sfera.Utils.getDate("hisu") + " - websocket: open, sending subscribe", event.data);

        //self.wsSend("hello");
        self.wsSend(self.getURL("subscribe"));
    }

    function onWsMessage(event) {
        console.log(Sfera.Utils.getDate("hisu") + " - received: " + event.data);

        // ping
        if (event.data == "&") {
            resetConnCheckTimeout();
            self.wsSend("&");
        } else {
            self.onMessage.dispatch(event.data);
            Sfera.Debug.log("websocket: onmessage", event.data);
            json = JSON.parse(event.data);

            // {"type":"event","events":{"remote.myvalue":"5","system.plugins":"reload","remote.":"undefined","system.state":"ready"}}
            switch (json.type) {
                case "reply":
                    self.onReply.dispatch(json);
                    break;
                case "connection":
                    connectionId = json.connectionId;
                    pingInterval = parseInt(json.pingInterval);
                    responseTimeout = parseInt(json.responseTimeout);

                    resetConnCheckTimeout();
                    var tag = (new Date()).getTime(); // request id
                    var r = {
                        action: "subscribe",
                        nodes: "*",
                        tag: tag
                    };

                    self.wsSend(JSON.stringify(r));
                    wsConnected = true;
                    break;
                case "event":
                    self.onEvent.dispatch(json);
                    break;
            }
        }
    }

    function onWsError(event) {
        console.log("here", event);
        self.wsOpen (); // reopen
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
        var reason;

        wsConnected = false;
        self.wsOpen (); // reopen

        reason = event.code + " - " + getWsCloseReason(event.code);
        Sfera.Debug.log(Sfera.Utils.getDate("hisu") + " - web socket: connection closed", reason);
    }

    // public methods
    this.wsOpen  = function() {
        var url = self.getURL("websocket");

        console.log(Sfera.Utils.getDate("hisu") + " - opening socket on " + url);
        // ensure only one connection is open at a time
        if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
            Sfera.Debug.log(Sfera.Utils.getDate() + " - websocket: is already opened.");
            return;
        }
        // create a new instance of the websocket
        if (connectionId != null)
            url += "?cid="+connectionId;
        webSocket = new WebSocket(url);

        // associate events
        webSocket.onopen = onWsOpen;
        webSocket.onmessage = onWsMessage;
        webSocket.onclose = onWsClose;
        webSocket.onerror = onWsError;
    }
    this.wsSend = function(txt) {
        console.log(Sfera.Utils.getDate("hisu") + " - sending:  " + txt);
        webSocket.send(txt);
    }
    this.wsClose = function() {
        webSocket.close();
    }


    function resetConnCheckTimeout() {
        clearTimeout(connCheckTimeoutId);
        setTimeout(this.wsClose, pingInterval + responseTimeout);
    }
    // get current timestamp
    function getTimestamp() {
        return (new Date()).getTime();
    }

    // connect
    this.connect = function() {
        if (!req) {
            req = new Sfera.Net.Request()
            req.onLoaded = onReqLoaded;
            req.onError = onReqError;
        }

        this.sync();
    }; // connect()

    // sync, if necessary
    this.sync = function() {
        for (var s in this.localTs) {
            if (this.localTs[s] == -1) { // || this.localTs[s] < this.remoteTs[s]) {
                cSync = s;
                req.open(httpBaseUrl + self.getURL(s), 20);
                return; // one resource per time
            }
        }

        // use websockets?
        if (true) {
            self.wsOpen ();
            return;
        }

        if (!this.subscribed) {
            cSync = "subscribe";

            req.open(urls.get("subscribe"));
            return;
        }

        cSync = "state";
        req.open(httpBaseUrl + urls.get("state"));
    };

    function onReqLoaded() {
        console.log(cSync + " loaded");
        Sfera.Debug.log("xmlreq: loaded", req.getResponseText());

        if (self.localTs[cSync] != null)
            self.localTs[cSync] = getTimestamp();

        var state;

        switch (cSync) {
            case "dictionary":
                console.log("loaded dictionary");
                self.onUpdateDictionary.dispatch(req.getResponseXML())
                break;
            case "index":
                console.log("loaded index");
                self.onUpdateIndex.dispatch(req.getResponseXML());
                break;

            case "subscribe":
                self.subscribed = true;

            case "state":
                state = JSON.parse(req.getResponseText());
                if (state.timestamp)
                    self.stateTs = state.timestamp;
                break;
        }

        self.sync();
    }

    function onReqError() {
        console.log("error");
        //var e = document.getElementById("output");
        //e.innerHTML += "<br><br>Error.<br><br>";
    }

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
        //this.wsSend(self.getURL("command")+"?id="+id+"&"+command);

        var r = {
            action: "command",
            cmd: req.command,
            tag: req.tag
        };
        this.wsSend(JSON.stringify(r));
    };

    this.sendEvent = function(req) {
        //    this.wsSend(self.getURL("event")+"?id="+id+"&"+event);

        var r = {
            action: "event",
            id: req.id,
            value: req.value,
            tag: req.tag
        };
        this.wsSend(JSON.stringify(r));

    };

})();


Sfera.Net = Sfera.Net || {};
/**
 * Request class
 * @constructor
 */
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
Sfera.Browser = new (function() {
    var location;

    this.reload = function() {
        window.location.reload();
    };

    /**
     * Change the browser tab URL without reloading (if supported)
     * @param  {string} title - Title of the page
     * @param  {string} url   - URL of the page
     * @return {boolean}      - true if successful, false otherwise
     */
    this.changeUrl = function(title, url) {
        if (typeof(history.pushState) != "undefined") {
            var obj = {
                Title: title,
                Url: url
            };
            history.pushState(obj, obj.Title, obj.Url);
            return true;
        }
        return false;
    };

    this.updateUrl = function(pageId, pageTitle) {
        var location = this.getLocation();
        hash = pageId == "page:homepage"?"":pageId;
        document.title = pageTitle;
        if (location.hash != hash) {
            lastHash = hash; // so the interval won't detect the change
            var url = location.pathname + "#" + pageId;
            if (pageId && location.search)
                url += "?" + location.search
            this.changeUrl(pageTitle, url);
        }
    };

    this.getLocation = function() {
        var url = window.location.href; // "http://localhost:8080/new/index.html#page1?a=2"

        if (!location || location.url != url) {
            var hash = window.location.hash, // #page1
                search = window.location.search, // ?a=2
                a;

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

            var sp = window.location.pathname.split("/");

            location = {
                url: url,
                host: window.location.host, // "localhost:8080"
                protocol: window.location.protocol, // http:
                pathname: window.location.pathname, // /new/index.html
                hash: hash, // #page1
                search: search, // ?a=2
                interface: sp[1], // new
                login: sp[2] == "login" // login page?
            };
        }

        return location;
    }

    var lastHash = null;
    var self = this;

    this.start = function() {
        setInterval(function() {
            var location = Sfera.Browser.getLocation();
            var locHash = location.hash == "page:homepage"?"":location.hash
            if (locHash !== lastHash) {
                lastHash = locHash;
                Sfera.client.showPage(location.hash ? location.hash : "homepage");
                //alert("User went back or forward to application state represented by " + hash);
            }
        }, 100);
    };
})();


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
Sfera.Utils = function() {
    this.mixin = function(a, b) {

    };

    this.extend = function(c, e) {
        c.prototype = Object.create(e.prototype);
        c.prototype.constructor = c;
        c.prototype.ancestor = e.prototype;
        /*
        for (var i = 0; i < arguments.length; i++) {
            alert(arguments[i]);
        }
        */
    };


    this.initClass = function(c) {
        c.prototype.constructor = c;
    };

    this.getFirstChildNodeOfType = function(xmlNode, type) {
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == type) {
                return xmlNode.childNodes[i];
            }
        }
        return null;
    };

    this.getCDATA = function(xmlNode) {
        var node = this.getFirstChildNodeOfType(xmlNode, 4);
        return node ? node.nodeValue : "";
    };


    this.isString = function(v) {
        return (typeof v === 'string' || v instanceof String);
    }

    this.camelToDash = function(str) {
        return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    this.dashToCamel = function(str) {
        return str.toLowerCase().replace(/\W+(.)/g, function(x, chr) {
            return chr.toUpperCase();
        })
    }

    this.getDate = function(format) {
        function pan(str,len) {
            str = str + "";
            if (!len) len = 2;
            while (str.length < len)
                str = "0"+str;
            return str;
        }

        var date = new Date();
        if (!format) {
            format = "dmyhisu";
        }
        var f = {};
        for (var i=0; i<format.length; i++)
            f[format[i]] = true;
        var str = "";
        if (f.d) {
            str += pan(date.getDate());
        }
        if (f.m) {
            str += (str?"/":"") + pan(date.getMonth() + 1);
        }
        if (f.y) {
            str += (str?"/":"") + date.getFullYear();
        }
        if (f.h) {
            str += (str?" ":"") + pan(date.getHours());
        }
        if (f.i) {
            str += (str?":":"") + pan(date.getMinutes());
        }
        if (f.s) {
            str += (str?":":"") + pan(date.getSeconds());
        }
        if (f.u) {
            str += (str?":":"") + pan(date.getMilliseconds(),3);
        }
        return str;
    }

};

Sfera.Utils = new Sfera.Utils();

Array.prototype.equals = function (array, strict) {
    if (!array)
        return false;

    if (arguments.length == 1)
        strict = true;

    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i], strict))
                return false;
        }
        else if (strict && this[i] != array[i]) {
            return false;
        }
        else if (!strict) {
            return this.sort().equals(array.sort(), true);
        }
    }
    return true;
}


/**
 * Sfera._Base component base class
 *
 * @class Sfera._Base
 * @constructor
 */
Sfera.Components.create("_Base", {
    id: null,

    // require update: null, true/ {}
    requireUpdate: null,

    children: [],

    attributes: {
        id: {
            type: "string",
            set: function(value) {
                this.value.id = value;
                this.component.id = value;
                this.component.element.setAttribute("data-id", value);
            },
            get: function() {
                return this.attributeValues.id;
            }
        }
    },

    init: function() {
        this.elements = {};
    },

    // shared methods
    getAttribute: function(name) {
        if (this.attributes[name]) {
            return this.attributes[name].get();
        }
    },

    // shared methods
    setAttribute: function(name, value, manualUpdate) {
        if (this.attributes[name]) {
            this.attributes[name].set(value, manualUpdate);
        }
    },

    // update
    update: function() {},

    // super
    super: function(superClassName, methodName) {
        Sfera.Components[superClassName].prototype[methodName].call(this);
    },

    /**
     * Set component's html source. Reset processed variable
     * @param {string} src - html source
     */
    setSource: function(src) {
        this.processed = false;
    },

    addChild: function(child) {
        this.children.push(child);
        child.parent = this;
        if (this.element) {
            this.element.appendChild(child.element);
        }
    }

});


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