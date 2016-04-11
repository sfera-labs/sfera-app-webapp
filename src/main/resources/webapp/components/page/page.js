/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Page.js
 */

/**
 * Page component.
 *
 * @class Sfera.Components.Page
 * @constructor
 */
 Sfera.Components.create("Page",{
     presets:["Visibility"],

     attributes: {
         title: {
             type:"string",
         },

         visible: {
             default:"false"
         }
     },

     init: function(){
     }
 });
