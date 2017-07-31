/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
     * @param  {string} name        name of the
     * @param  {object} attributes  attributes of
     * @return {object}             thing
     */
    this.createComponent = function(name, attributes) {
        return Sfera.Components.createInstance(name, attributes);
    };

    this.compileXMLNode = function(xmlNode, options) {
        if (xmlNode.nodeType == 1) { // 1 = element
            options = options || {};
            options.index = options.index || true; // default is true

            var i, a;
            var attrs = {};
            for (i = 0; i < xmlNode.attributes.length; i++) {
                a = xmlNode.attributes[i];
                attrs[Sfera.Utils.dashToCamel(a.name)] = a.value;
            }

            // add prefix?
            if (options.idPrefix && attrs.id)
                attrs.id = options.idPrefix + "." + attrs.id;

            var component = this.createComponent(xmlNode.nodeName, attrs);

            // add to the index
            if (component) {
                if (options.index)
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
    this.compileXML = function(xmlDoc, options) {
        return this.compileXMLNode(xmlDoc.documentElement, options);
    };

    this.compileString = function(xmlStr) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");

        this.compileXML(xmlDoc);
    };

    /**
     * [function description]
     * @param  {string} xmlDoc [description]
     * @return {string}        [description]
     */
    this.compileDictionary = function(xmlDoc) {
        var xmlNode = xmlDoc.documentElement;
        if (xmlNode && xmlNode.nodeType == 1) { // 1 = element
            var c = xmlNode.childNodes,
                c2, c3, n, i, t, k;
            for (i = 0; i < c.length; i++) {
                if (c[i].nodeType == 1)
                switch (c[i].tagName) {
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

    this.compileHTML = function(source) {
        source = source.replace(/\$interface\;/g, Sfera.client.name);

        // ...

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
            case "float":
                value = parseFloat(value);
                break;
            case "color":
                value = value.toLowerCase();
                names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];
                /*
                /^(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|rgba *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|black|green|silver|gray|olive|white|yellow|maroon|navy|red|blue|purple|teal|fuchsia|aqua)$/i
                if (names.indexOf(value) == -1) {
                    if (!(/^#[a-f0-9]{6}$/i).test(value)) {
                        if (/^[a-f0-9]{6}$/i).test(value) {
                            value = '#'.value;
                        } else {

                        }
                    }
                }
                */
                break;
			case "size":
				if (typeof(value) == "string" && value.indexOf("%") != -1) {
					value = parseInt(value) + "%";
				} else if (value != "auto") {
					value = parseInt(value);
				}
				break;
            case "string":
            case "js":
                if (typeof(value) != "string" && value.toString) {
                    var v = value.toString();
                    if (v == "[object Object]")
                        value = JSON.stringify(value);
                    else
                        value = v;
                }
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
            case "list":
                value = value.split(",");
                break;
        }

        // done
        return value;
    };

})();
