# Client-side scripting

You can add any sort of custom logic to be executed on the client when the user interacts with an interface or when events are triggered on the system. 

To link the execution of some code to a user action on a component, add it to any of the js-typed attributes of the component (for instance the _on-click_ attribute of a button).    
You can call any of the [predefined functions](client-functions.html) or your own functions defined in one of the JavaScript files added to the [interface](interfaces.html).

Moreover, there are a set of predefined [callbacks](client-callbacks.html) that are called automatically for instance when the interface is loaded or when an event update is received from the server.

## Examples

### Triggering events

Triggering a UI event on the server when pressing a button:

_/webapp/interfaces/example/index.xml_

    <interface skin="default" title="Sending Events" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Hello" on-click="event('myevent','myvalue')" />
        </page>
    </interface>

Pressing the button will generate an event with id `ui.myevent` and value `myvalue`.
_ui_ is the prefix used for every event generated by a user interface.    
This will be captured by the server that can [react accordingly](server-programming.html).

### Calling methods of server nodes

Here's an example that calls a method of a node (e.g. a driver instance) and handles the returned value:

_/webapp/interfaces/example/index.xml_

    <interface skin="default" title="Sending Commands" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Hello" on-click="command('node.doSomething(1)', myCallback)" />
        </page>
    </interface>

_/webapp/interfaces/example/script.js_

    function myCallback(command, result) {
		alert("Command "+command+" executed, result: "+result);
	}

Pressing the button will cause the specified node action to be evaluated on the server. When the returned value is received, the JavaScript function will generate an alert popup.

### Setting attributes
In this example we have a slider and two buttons.    
Each button uses the `setAttribute()` function to set the slider's value. When a change is detected in the slider's value a "ui.myslider" event is generated and sent to the server (which is the default action of the slider on a value change).

_/webapp/interfaces/example/index.xml_

    <interface skin="default" title="Setting Attributes" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <slider id="myslider" x="70" y="30" width="40" height="210" bar-color="#5550f0" />
            <button x="190" y="50" width="160" height="60" label="max" on-click="setAttribute('myslider','value','100')" />
            <button x="190" y="150" width="160" height="60" label="min" on-click="setAttribute('myslider','value','0')" />
        </page>
    </interface>
    
![setting attributes](images/client-scripting/ex_attributes.png)

The slider component can be used to input a value within a range (for example to control a volume, a light's intensity, etc.).

### Custom functions

While it is allowed to write any sequence of JavaScript code directly in the event attributes of components, this is practical only for short amounts of code. For more complex logic it is advised to define custom functions in the interface's JavaScript files.      
These scripts are all in the same scope so any function or variable declared in it can be accessed from the inline script of components.    
Here's an example:

_/webapp/interfaces/example/index.xml_

    <interface skin="default" title="Custom functions" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <button x="130" y="80" width="160" height="60" label="one" on-click="myFunction(1)" />
            <button x="130" y="180" width="160" height="60" label="two" on-click="myFunction(2)" />
            <label id="mylabel" x="60" y="10" width="300" height="60" text-align="center" />
        </page>
    </interface>
    
_/webapp/interfaces/example/script.js_

    function myFunction(value) { 
        switch (value) {
        case 1:
            setAttribute("mylabel","text","first option");
            break;
        case 2:
            setAttribute("mylabel","text","second option")
            break;
        }
    }

![custom functions](images/client-scripting/ex_functions.png)
