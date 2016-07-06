/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
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
             // @ifdef DOC
             doc:"Title visible in the browser's title bar"
             // @endif
         },

         visible: {
             default:"false"
         }
     },

     init: function(){
     }
 });
