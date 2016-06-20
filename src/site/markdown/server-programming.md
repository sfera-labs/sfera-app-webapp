# Server-side programming

The client communicates with the server by means of UI events. These events are instances of the [UIEvent class](../../../sfera/apidocs/cc/sferalabs/sfera/ui/UIEvent.html).

You can handle UI events in your Java applications:

```
@Subscribe
public void onUiEvent(UIEvent ev) {
    log.info("Processing UI event {} = {}", ev.getId(), ev.getValue());
}				
```

and in your scripts:

```
ui.test == "hello" : {
    log.info("Processing UI event {} = {}", _e.id, _e.value);
}
```

The `ui` node (instance of the [UI class](../../../sfera/apidocs/cc/sferalabs/sfera/ui/UI.html)) provides the methods to set the value of of UI components' attributes.

```
init {
    var x = 0;
}

ui.increase : {
    x++;
    ui.set("myLabel", "text", "Counter: " + x);
}
```

The above script will set the `text` attribute of the component (possibly a label) with ID `myLabel` to the updated value of `x` whenever a `ui.increase` event is received from the client (e.g. a button with ID `increase` is pressed). This is a _global_ action, i.e. all interfaces instances (currently open or open after this call) will see the change. To act only on a specific interface instance, refer to the next paragraph. 

### Global VS Instance

In some cases you may want to act only on a specific interface instance (i.e. browser tab) and leave all other unchanged. For instance you may want to change the attribute of a component only for the interface instance on which an event has been triggered.

UI events expose the method `getConnectionId()` that returns an identifier for the source interface instance. You can pass this ID to the `ui.set()` method to act only on that interface:

```
init {
    var x = 0;
}

ui.increase : {
    x++;
    ui.set("myLabel", "text", "Counter: " + x, _e.connectionId);
}
```

The above script will update the value of `x` on every `ui.increase` event coming from any interface instance, but the updated value will be shown only on the one that triggered the event. This is the equivalent of setting the component attribute from logic [executed on the client](client-scripting.html).
