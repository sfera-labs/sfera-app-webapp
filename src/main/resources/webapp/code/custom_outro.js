/**
* @author       Gionatan Iasio <gionatan@sferalabs.cc>
* @copyright    2015 SferaLabs
* @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
*/

    // bridge functions
    this.onStartup = (typeof(onStartup) === 'function') ? function () {onStartup();} : null;
    this.onEvent = (typeof(onEvent) === 'function') ? function (node, json) {return onEvent(node, json);} : null;
    this.onPage = (typeof(onPage) === 'function') ? function (name) {return onPage(name);} : null;

    // context functions
    function page(id) {
        Sfera.client.showPage(id);
    }

    function event(id, value) {
        Sfera.client.sendEvent(id, value, this);
    }

    function command(command, callback)  {
        Sfera.client.sendCommand(command, this);
    }

    function logout() {
        Sfera.Login.logout();
    }

    function login(username, password) {
        Sfera.Login.login(username, password);
    }

    function setAttribute(id, name, value) {
        Sfera.client.setAttribute(id, name, value);
    }

    // exec custom code. optional: id of the component calling, value to be sent
    this.exec = function (f, id, value) {
        // eval button js
        try {
            var result = eval(f);
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert(e.message);
            } else {
                throw (e);
            }
        }
        return (result === false ? false : true); // return false (block event?) only if eval results in false
    };

})();
