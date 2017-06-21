/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Image component.
 *
 * @class Sfera.Components.Image
 * @mixes Sfera.Behaviors.Visibility
 * @mixes Sfera.Behaviors.Position
 * @property {string} source - source url of the image
 */
Sfera.Components.create("Image", {
    presets: ["Visibility", "Position", "Size"],

    attributes: {
        source: {
            type: "string",
            update: function() {
                var c = this.component;
                var e = c.element;
                // no source, hide it
                if (!this.value) {
                    e.innerHTML = "";
                }
                // svg
                else if (this.value.indexOf(".svg") == this.value.length - 4) {
                    var req = new Sfera.Net.Request();
                    req.init();
                    req.onLoaded = function() {
                        var xml = req.getResponseXML();
                        c.svg = xml.getElementsByTagName("svg")[0];
                        e.innerHTML = "";
                        if (c.svg) {
                            e.appendChild(c.svg);
                            c.svg.style.width = c.getAttribute("width");
                            c.svg.style.height = c.getAttribute("height");
                        }
                        // done
                        req = null;
                    };
                    req.open(this.value);
                }
                // normal img
                else {
                    e.innerHTML = "<img src='" + this.value + "' width='100%' height='100%'>";
                }
            }
        }
    },

    init: function() {
        this.svg = null;
    },

    onShow: function () {
        if (this.svg) {
            this.svg.style.width = this.getAttribute("width") + "px";
            this.svg.style.height = this.getAttribute("height") + "px";
        }
	},

});
