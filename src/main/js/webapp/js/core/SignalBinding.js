/**
* @author       Miller Medeiros http://millermedeiros.github.com/js-signals/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/Sfera/blob/master/license.txt|MIT License}
*/

/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
*
* @class Sfera.SignalBinding
* @constructor
* @param {Sfera.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
Sfera.SignalBinding = function (signal, listener, isOnce, listenerContext, priority, args) {

    /**
    * @property {Sfera.Game} _listener - Handler function bound to the signal.
    * @private
    */
    this._listener = listener;

    if (isOnce)
    {
        this._isOnce = true;
    }

    if (listenerContext != null) /* not null/undefined */
    {
        this.context = listenerContext;
    }

    /**
    * @property {Sfera.Signal} _signal - Reference to Signal object that listener is currently bound to.
    * @private
    */
    this._signal = signal;

    if (priority)
    {
        this._priority = priority;
    }

    if (args && args.length)
    {
        this._args = args;
    }

};

Sfera.SignalBinding.prototype = {

    /**
    * @property {?object} context - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    */
    context: null,

    /**
    * @property {boolean} _isOnce - If binding should be executed just once.
    * @private
    */
    _isOnce: false,

    /**
    * @property {number} _priority - Listener priority.
    * @private
    */
    _priority: 0,

    /**
    * @property {array} _args - Listener arguments.
    * @private
    */
    _args: null,

    /**
    * @property {number} callCount - The number of times the handler function has been called.
    */
    callCount: 0,

    /**
    * If binding is active and should be executed.
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute` (curried parameters).
    * @property {array|null} params
    * @default
    */
    params: null,

    /**
    * Call listener passing arbitrary parameters.
    * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
    * @method Sfera.SignalBinding#execute
    * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
    * @return {any} Value returned by the listener.
    */
    execute: function(paramsArr) {

        var handlerReturn, params;

        if (this.active && !!this._listener)
        {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;

            if (this._args)
            {
                params = params.concat(this._args);
            }

            handlerReturn = this._listener.apply(this.context, params);

            this.callCount++;

            if (this._isOnce)
            {
                this.detach();
            }
        }

        return handlerReturn;

    },

    /**
    * Detach binding from signal.
    * alias to: @see mySignal.remove(myBinding.getListener());
    * @method Sfera.SignalBinding#detach
    * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
    */
    detach: function () {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
    },

    /**
    * @method Sfera.SignalBinding#isBound
    * @return {boolean} True if binding is still bound to the signal and has a listener.
    */
    isBound: function () {
        return (!!this._signal && !!this._listener);
    },

    /**
    * @method Sfera.SignalBinding#isOnce
    * @return {boolean} If SignalBinding will only be executed once.
    */
    isOnce: function () {
        return this._isOnce;
    },

    /**
    * @method Sfera.SignalBinding#getListener
    * @return {function} Handler function bound to the signal.
    */
    getListener: function () {
        return this._listener;
    },

    /**
    * @method Sfera.SignalBinding#getSignal
    * @return {Sfera.Signal} Signal that listener is currently bound to.
    */
    getSignal: function () {
        return this._signal;
    },

    /**
    * Delete instance properties
    * @method Sfera.SignalBinding#_destroy
    * @private
    */
    _destroy: function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    },

    /**
    * @method Sfera.SignalBinding#toString
    * @return {string} String representation of the object.
    */
    toString: function () {
        return '[Sfera.SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
    }

};

Sfera.SignalBinding.prototype.constructor = Sfera.SignalBinding;
