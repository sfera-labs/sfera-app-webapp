/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Image.js
 */

/**
 * Image component.
 *
 * @class Sfera.Components.Image
 * @constructor
 */
 Sfera.Components.create("Image",{
     behaviors:["Visibility","Position","Size"],

     attributes:{
         source:{
             type:"string",
             update: function () {
                 this.component.element.innerHTML = "<img src='"+this.value+"' width='100%' height='100%'>";
             }
         }
     },

     init: function() {
     }

 });
