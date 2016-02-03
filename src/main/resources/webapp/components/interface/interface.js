/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Interface.js
 */

/**
 * Interface component.
 *
 * @class Sfera.Components.Interface
 * @constructor
 */
 Sfera.Components.create("Interface",{
     behaviors:["Visibility","Size"],

     attributes: {
         zoom: {
             type:"float",
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
         }
     }
 });
