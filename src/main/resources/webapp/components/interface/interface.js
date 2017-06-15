/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Interface component.
 *
 * @class Sfera.Components.Interface
 * @constructor
 */
 Sfera.Components.create("Interface",{
     presets:["Visibility","Size"],

     attributes: {
         title: {
             type: "string",
         },

         skin: {
            default: "default",
            update: function () {
                Sfera.client.skin = new Sfera.Skins[Sfera.Utils.capitalize(this.value)]();
            }
         },

         zoom: {
             type: "float",
             update: function () {
         		if (this.value != 1) {
         			var bodyE = document.getElementsByTagName("BODY")[0];
         			var v = "scale("+this.value+","+this.value+")";
         			if (Sfera.Device.browser == "IE") {
         				bodyE.style.msTransform = v;
         				bodyE.style.msTransformOrigin = "0% 0%";
         			} else {
         				bodyE.style.zoom = (this.value*100)+"%";
         				bodyE.style.OTransform = v;
         				bodyE.style.MozTransform = v;
         				bodyE.style.WebkitTransformOrigin = "0 0";
         				bodyE.style.transformOrigin = "0% 0%";
         			}
         			// prevent artifacts
         			bodyE.style.width = "0px";
         			bodyE.style.height = "0px";
         		}
             }
         },

         fit: {
            type: "boolean", 
         },

         autoReload: {
             type: "boolean",
             default: "true"
         },

         bodyBackgroundColor: {
             type: "color",
             update: function () {
                 var bodyE = document.getElementsByTagName("body")[0];
                 bodyE.style.backgroundColor = this.value;
             }
         },

         frameBackgroundColor: {
             type: "color",
             update: function () {
                 this.component.element.style.backgroundColor = this.value;
             }
         }

     }
 });
