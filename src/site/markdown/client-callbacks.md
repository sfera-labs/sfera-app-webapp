# Callbacks

It's possible to declare the following functions in your interface's JavaScript files that will be called on the corresponding events:

### onReady

Called when the interface is available, after loading is finished.

```js
function onReady()
```

>Example: show an alert popup when the interface is ready.

>```js
function onReady() {
	alert("ready event");
}
```

### onPage
Called when a page is about to be shown. If the return value is false, the page won't be shown.

```js
function onPage(id)
```

>Example: show an alert popup when a page is shown.

>```js
function onPage(id) {
	alert("page shown: " + id);
}
```

### onEvent
called when an event is received from the server. If the return value is false, the event is canceled (as if it wasn't received at all).

```js
function onEvent(id, value)
```

>Example: show an alert popup on each event.

>```js
function onEvent(id, value) {
	alert("Event received. ID: " + id + ", value: " + value);
}
```