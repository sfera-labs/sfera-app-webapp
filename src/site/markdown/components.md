# Components

Components are objects that together make an [interface](interfaces.html).
A component can be visible and interactive, or can extend the interface's functionality.
Each component is specified in the interface's _index.xml_ file as an xml node and can have attributes.

## Attributes

A component's attribute value can be set in two ways:

* from the component definition in the index.xml file: this is the initial value. Attributes on the index.xml files are written in dash-delimited style (ex. text-align="center").
* with a consecutive setAttribute call that dinamically changes the value. Attributes in scripts are written using camel case style (ex. textAlign="center"). 
	There are two ways of calling a setAttribute:
	* from a client script, using the setAttribute function: [setAttribute(id, name, value)](client-scripting.html)
	* from the server, through a ui.set event.


Each attribute has a type, which determines how the value is handled.

Here's a list of attribute types:

Type|Description
---|---
string|A string
boolean|A boolean, can be either "true" or "false"
integer|An integer number
float|A floating point number
js|A javascript

Regardless of its type, an attribute value is always set through a string value. This string is then automatically converted to a value of the correct type.

An attribute can have a default value, that is set before the interface is ready.
It can also have a set of valid values.