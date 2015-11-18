/**
* @author       Gionatan Iasio <gionatan@sferalabs.cc>
* @copyright    2015 SferaLabs
* @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
* Custom.Outro.js
*/

    // bridge functions
    this.startupEvent = (typeof(StartupEvent) === 'function') ? function () {StartupEvent();} : null;
    this.commandEvent = (typeof(commandEvent) === 'function') ? function (id, value) {return commandEvent(id, value);} : null;
    this.uiEvent = (typeof(uiEvent) === 'function') ? function (id, attr, value) {return uiEvent(id, attr, value);} : null;
    this.pageOpenEvent = (typeof(pageOpenEvent) === 'function') ? function (name) {return pageOpenEvent(name);} : null;
    this.pageCloseEvent = (typeof(pageCloseEvent) === 'function') ? function (name) {return pageCloseEvent(name);} : null;
    this.pageBackEvent = (typeof(pageBackEvent) === 'function') ? function (name) {return pageBackEvent(name);} : null;

    // context functions
    function page(id) {
        Sfera.client.showPage(id);
    }

    function event(id, value) {
        Sfera.client.sendEvent(id, value, this);
    }

    function command(command)  {
        Sfera.client.sendCommand(command, this);
    }

    // exec custom code
    this.exec = function (f) {
        // eval button js
        try {
            var f = this.getAttribute("onClick");
            eval(f);
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert(e.message);
            } else {
                throw (e);
            }
        }
    };

})();
