# Components

Components are elements that together make an [interface](interfaces.html).
A component can be a visible and interactive element, or simply extend the interface's functionalities.
Each component is added to the interface's _index.xml_ file as an XML node and can have several attributes that specify its appearance or behavior.

All components have an `id` attribute that is used to address them in client or server-side code. Different components can have the same id.

## Attributes

A component's attribute value can be set in two ways:

* from the component definition in the index.xml file: this is the initial value. Attributes on the index.xml files are written in dash-delimited style (ex. text-align="center").
* from your custom logic, to dynamically change the value. You can do this both in your [client scripts](client-scripting.html) as well as from your [server-side logic](server-programming.html). In this case, attributes are written using camel case style (ex. textAlign="center"). 

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

### Dynamic values: mustache

An attribute value can update dynamically thanks to the use of _mustache_ variables.

A mustache variable, written as `{{node}}` will substitute in real time the value of a node. 

Ex.:
{{mydriver.mynode}}