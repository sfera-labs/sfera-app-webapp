# Utility functions

To ease development there are some predefined functions for the most common uses:

### page
Navigates to a page with the specified id.

```js
page(<id>)
```

>Example: show the home page.

>```js
page("home")
```

### setAttribute
Sets a component's attribute value, given the component's id, the attribute's name and the new value.

```js
setAttribute(id, name, value)
```

### event
Sends a UI event (instance of [UIEvent class](../../../sfera/apidocs/cc/sferalabs/sfera/ui/UIEvent.html)) with the specified id and value to the server.

```js
event(<id>, <value>)
```

>Example: generate a ui event with id _ui.myEvent_ and value "7"

>```js
event("myEvent", "7")
```

### command
Calls a method on a server node (e.g. a driver instance). An optional callback function can be specified to process the returned value.

```js
command(command, callback)
```

>Example: call the _doSomething()_ method of _myNode_, specifying _myCallback_ function as a callback.

	
>```js
command("myNode.doSomething(7)", myCallback);
```

>in _script.js_:

>```js
function myCallback(command, result) {
	alert("command's result:" + result);
}
```
	
### logout
Logs the user out.

```js
logout()
```

### login
Logs the user in with the specified username and password.

```js
login(username, password)
```
