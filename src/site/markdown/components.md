# Components

Components are elements that together make an [interface](interfaces.html).
A component can be a visible and interactive element, or simply extend the interface's functionalities.
Each component is added to the interface's _index.xml_ file as an XML node and can have several attributes that specify its appearance or behavior.

All components have an `id` attribute that is used to address them in client or server-side code. Different components can have the same id.

## Attributes

A component's attribute value can be set in two ways:

* from the component definition in the index.xml file: this is the initial value. Attributes on the index.xml files are written in dash-delimited style (ex. text-align="center").
* with a `setAttribute()` call that dinamically changes the value. Attributes in scripts are written using camel case style (ex. textAlign="center"). 
	There are two ways of calling a setAttribute:
	* from a client script, using the setAttribute function: [setAttribute(id, name, value)](client-scripting.html)
	* from the server, through a [ui.set event](server-programming.html).


Each attribute has a type, which determines how the value is handled.

Here's a list of attribute types:

Type|Description
---|---
string|A textual string
boolean|A boolean, can be either "true" or "false"
integer|An integer number (e.g. 12)
float|A floating point (decimal) number (e.g. 13.71)
js|A JavasScript code snippet

Regardless of its type, an attribute value is always set through a string value. This string is then automatically converted to a value of the correct type.

An attribute can have a default value, that is set before the interface is ready.
It can also have a set of valid values.