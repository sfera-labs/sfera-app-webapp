# Interfaces

Interfaces are the main way for the end user to access the system's functionalities.
They are located under the  directory.    
Each interface has its own directory located under /webapp/interfaces and is defined by an index.xml file.

## The interface index.xml

The interface index fle is a standard XML fle where each node represents a component. Each component can have attributes that defnes its appearance and behavior.
Here's a simple example:

_/webapp/interfaces/example1/index.xml_

    <interface skin="default" title="Example 1" width="420" height="270" >
        <page id="page:homepage" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Hello" on-click="alert('hello world')" />
        </page>
    </interface>

which will produce an interface with a single button that when pressed opens a javascript alert.

![interface-hello-world](images/interface-hello-world.png)

In this example we have three components:

* `interface`: the main component and also the root node of the xml fle. It contains all the other components. It has the following attributes:
    * `skin`: defines the look and feel of the interface
    * `title`: visible in the browser's title bar
    * `width` and `height`: size of the area where components appear
* `page`: defines a view. Interfaces are structured in multiple pages, using components (like buttons) or scripts to navigate between them. It has the following attributes:
    * `id`: each component can have an id to identify it univocally. This page has id “page:homepage” which is the default page that will be opened when the interface is loaded.
    * `title`: visible in the browser's title bar along with the interface's name
* `button`: a clickable button that executes a javascript. Has the following attributes:
    * `x` and `y`: coordinates in pixels to define the position
    * `width` and `height`: size of the button in pixels
    * `label`: text that appears on the button
    * `on-click`: a javascript that is executed when the button is clicked
    
## Navigation

In this example we have two pages and we use buttons to navigate between them.    
Since navigating to a page will also change the browser's URL (while not refreshing the page) the browser's back and forward buttons will work as well.

_/webapp/interfaces/example3/index.xml_

    <interface skin="default" title="Example 3" width="420" height="270" >
        <page id="page:homepage" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Page 2" on-click="page('page:page2')" />
            <button x="130" y="150" width="160" height="60" label="Logout" on-click="logout()" />
        </page>
        <page id="page:page2" title="Page 2">
            <button x="130" y="40" width="160" height="60" label="Home page" on-click="page('page:homepage')" />
        </page>
    </interface>

Here we can see how each button calls the predefined function "page" passing the target page's id as parameter.     
On the first page we also have a button that logs the user out.    

![interface-navigation-1](images/interface-navigation-1.png)

![interface-navigation-2](images/interface-navigation-2.png)

