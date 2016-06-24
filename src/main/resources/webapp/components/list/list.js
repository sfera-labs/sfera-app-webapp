/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * List component.
 *
 * @class Sfera.Components.List
 * @constructor
 */
Sfera.Components.create("List", {
    presets: ["Visibility", "Position", "Size", "Style", "Color", "Enable"],

    attributes: {
        labels: {
            type: "list",
            update: function() {
                var co = this.component;
                co.redraw();
            },
        },

        values: {
            type: "list",
            update: function() {
                var co = this.component;
                co.redraw();
            },
        },

        template: {
            update: function() {
                var co = this.component;
                var str = this.value;
                var template;
        		if (!str) {
        			template = null;
        			return;
        		}
        		template = {a:[], b:[]};
        		var a = str.split("%"),
        			k,p;
        		for (var i=0; i<a.length; i++) {
        			p = a[i];
        			if (i) {
        				// remove number from beginning of p
        				k = 0;
        				while (k<p.length && isNumeric(p[k])) k++;
        				if (k) {
        					template.a.push(p.substr(k));
        					template.b.push(p.substr(0,k));
        				} else {
        					template.a[template.a.length-1] += "%"+p;
        				}
        			} else {
        				template.a.push(p);
        			}
        		}

                co.template = template;

                co.redraw();
            },
        },

        onItemClick: {
            type: "js",
            default: "event(id,value)"
        }

    },

    init: function() {
        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);
        this.buttons = [];

        this.setAttribute("template",
        '<div class="component comp_button" style="position:static">\
            <div name="bt" class="container style_default color_default">\
                <div class="cLabel" name="label">\
                %1\
                </div>\
            </div>\
        </div>');

        this.updateClass();
    },

    updateClass: function() {
        //var sty = this.getAttribute("style") || "default";
        var d = (this.getAttribute("enabled") ? "" : " disabled")
        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].setClassName("container" + d);
            this.buttons[i].enable(d?false:true);
        }
    },

    removeButtons: function () {
        for (var i=0; i<this.buttons.length; i++)
			this.buttons[i].destroy(); // up buttons
        this.buttons = [];
    },

    // [value, label]
	getItem: function (i) {
        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");
		var v = (values && values[i]!=null)?values[i]:i+""; // no value? use index
		var l = (labels && labels[i]!=null)?labels[i]:v; // no label? same as value
		return [v,l];
	},

    // total items to show
	getTotalItems: function () {
        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");
		return (values && values.length && (!labels || values.length<=labels.length))?values.length:(labels && labels.length)?labels.length:0; // min value
	},

    // index, items array (different from _items when still composing)
    getItemHTML: function(i, items) {
		var c = items[i], // content [v,l]
			html = '<div class="item',
			s = false;

		// check selection
		/*
		if (isSelected(c[0])) {
			if (!multi) {
				if (selectedIndex == i ||  // already selected
					selectedIndex == -1 || // nothing selected
					!items[selectedIndex] || // item previously selected doesn't exist anymore
					!isSelected(items[selectedIndex][0])) { // or the item previously selected is not selected anymore
					s = true;
					selectedIndex = i;
				}
			} else {
				s = true;
				_value += (_value?",":"") + c[0];
			}
		}
		if (s) html += ' selected';
        */

		html += '" data-name="'+name+'" data-param="'+c[0]+'"'; // params for user object

        var style ="";
		html += ' style="'+style+'">'; // item style

		html += this.applyTemplate(c[1])+"</div>";
		return html;
	},

    initItemEvents: function (i) {
        var d = this.elements.content.childNodes[i];
        var ad = d.getElementsByTagName("DIV");
        var e;
        for (var k=0; k<ad.length; k++) {
            if (ad[k].getAttribute("name") == "bt") {
                e = ad[k]
                break;
            }
        }
        if (!e) e = d;
        console.log("binding "+i);
        this.buttons[i] = new Sfera.UI.Button(e,{onclick:this.onItemClick.bind(this,i)});
        if (!this.getAttribute("enabled"))
            this.buttons[i].enable(false);
    },

    onItemClick: function (i) {
        var c = this.getItem(i);
        var f = this.getAttribute("onItemClick");
        Sfera.Custom.exec(f, this.id, c[0]);
    },

    updateItemContents: function (i) {
        var c = this._items[i], e;
        e.innerHTML = this.applyTemplate(c[1]);
    },

    applyTemplate: function (c) {
        var l = c;
        if (!l) {
            l = "&nbsp;";
        } else if (this.template) {
            var a = l.split("|"),
                k;
            l = "";
            for (var i=0; i<this.template.a.length; i++) {
                l += this.template.a[i];
                if (this.template.b.length > i) {
                    k = this.template.b[i]-1;
                    l += a[k]!==undefined?a[k]:"";
                }
            }
        }
        return l;
    },

    redraw: function () {
		// lift all buttons
		for (var i=0; i<this.buttons.length; i++)
			this.buttons[i].lift(); // up buttons

        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");

		if (!values && !labels) {
			this.removeButtons();
			return; // nothing to draw
		}

		// how many?
		var n = this.getTotalItems();

		var i,k;

		var items = [];
		for (i=0; i<n; i++)
			items.push(this.getItem(i));

		var mn = 0, // modified
			an = 0  // added
			rn = 0; // removed counter

		// full redraw
		if (true || !_items.length || (!n && _items.length) || items.length>_items.length*2) { // not so sure about this...
			// draw
			var html = "";

			_items = []; // reset
			this.removeButtons(); // remove from container, reset userO
			var c,s; // current item [value, label], selected
			for (i=0; i<n; i++) {
				_items[i] = items[i];
				html += this.getItemHTML(i,items);
				an++;
			}
			this.elements.content.innerHTML = html;
			// assign events
			var l = this.elements.content.childNodes.length;
			for (var i = 0; i<l; i++)
				this.initItemEvents(i);
		}
        /*
		// no redraw, add/remove items
		else {
			// add items
			if (n != _items.length) {
				// add/remove head
				if (!_items[0].same(items[0]) && _items.last().same(items.last())) {
					if (n < _items.length) { // new is shorter
						// remove from head
						while (n < _items.length) {
							this.elements.content.removeChild(this.elements.content.firstChild);
							_items.shift();

							if (!isUserList) {
								btsE.shift();
							} else {
								userO.shift().free();
							}
							rn++;
						}
						// fix btsE data-id
						if (!isUserList) {
							for (i=0;i<btsE.length;i++)
								btsE[i].setAttribute("data-id",i);
						}
					} else { // new is longer
						// add to head
						k = n-_items.length;
						var para = document.createElement("P");                       // Create a <p> element
						for (i=k-1;i>=0;i--) {
							_items.unshift(items[i]);
							para.innerHTML = getItemHTML(i,items);
							this.elements.content.insertBefore(para.childNodes[0], this.elements.content.firstChild);
							if (!isUserList)
								btsE.unshift(null);
							else
								userO.unshift(null);
						}
						// assign events
						for (i=0;i<k;i++) {
							initItemEvents(i);
						}
						an+=k;
						// fix btsE data-id
						if (!isUserList) {
							for (i=k;i<btsE.length;i++)
								btsE[i].setAttribute("data-id",i);
						}
					}
					// can't have a value that isn't in the list. check this!
					if (!multi && _value && selectedIndex == -1)
						_value = getDefault(); // no more value
				}
				// add/remove tail
				else {
					if (n < _items.length) { // new is shorter
						// remove from tail
						while (n < _items.length) {
							this.elements.content.removeChild(this.elements.content.lastChild);
							_items.pop();

							if (!isUserList) {
								btsE.pop();
							} else {
								userO.pop().free();
							}
							rn++;
						}
					} else {  // new is longer
						// add to tail
						var t = _items.length;
						var k = n - t;
						var h = "";

						var para = document.createElement("P"); // Create a <p> element

						for (i=0; i<k; i++) {
							_items[t+i] = items[t+i];
							para.innerHTML = getItemHTML(t+i,items);
							this.elements.content.appendChild(para.childNodes[0]);
							an++;
						}
						// assign events
						for (i=t; i<n; i++)
							initItemEvents(i);

						// can't have a value that isn't in the list
						if (!multi && _value && selectedIndex == -1)
							_value = getDefault(); // no more value
					}
				}

			}
			// update
			for (i=0; i<n; i++) {
				if (!_items[i].same(items[i])) {
					_items[i] = items[i];
					updateItemContents(i);
					mn++;
				}
			}

		}
        */
	}, // redraw()


});
