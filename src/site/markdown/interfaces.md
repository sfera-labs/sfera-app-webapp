# Interfaces

Interfaces are the main way for the end user to interact with Sfera and control the connected systems.

You can create as many interfaces as you need. Different interfaces can provide different layouts for different devices (mobile, desktop, touch panel...), or they can give access to different parts of the system, or they can provide different restrictions for different users, or simply an alternate look and feel. 

Each interface has its own directory located under _webapp/interfaces/_. Here you can create a new directory for each interface that will contain all the interface resources, as explained in the following.     
Once the interface is created, it will be accessible at the URL `http://<server_address>:<port>/<interface_directory_name>`.

Here is an example of the file structure for an interface:

    <sfera_installation_dir>/
    ├── sfera.jar
    ├── ...
    └── webapp/
        ├── interfaces/
        |   └── helloworld/
        |   |   ├── index.xml
        |   |   ├── assets/
        |   |   |   ├── my-logo.png
        |   |   |   ├── background.png
        |   |   |   └── no-cache/
        |   |   |   |   └── my-picture.jpg
        |   |   ├── my-code.js
        |   |   ├── my-other-code.js
        |   |   └── style.css
        └── cache/
            └── ...

Whenever a file inside the _webapp/interfaces/_ directory is modified, the Web App will rebuild the interfaces. The resulting files that will be served by the Web server are placed under _webapp/cache/_; do not manually modify the content of these files since they will be overwritten by the app.

The main file defining the structure of an interface is `index.xml`; see the following paragraphs for details.   

All the static resources used in the interface (e.g. images) shall be placed inside `assets` (or any sub-directory). They will be copied as-is in the generated cache and (unless disabled in the [configuration](configuration.html)) included in the HTML5 cache manifest. If, for any reason, you need a resource not to be cached, place it into `assets/no-cache`.

Any JavaScript file ('.js' extension) found in the interface directory will be included in the client code of the interface. Check [Client-side scripting](client-scripting.html) for more details.

You can also add a `style.css` file to define custom CSS classes used by [components](components.html) in your interface.

In the above case the generated interface will be served at `http://192.168.1.100/helloworld` (with some assumptions on IP address and port configuration).

## The interface index.xml

The interface index file is a standard XML file where each node represents a [component](components.html). Each component can have attributes that define its appearance and behavior.
Here's a simple example:

**_/webapp/interfaces/helloworld/index.xml_**

    <interface skin="default" title="Hello World" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Hello" on-click="alert('hello world')" />
        </page>
    </interface>

which will produce an interface with a single button that when pressed runs a JavaScript code that opens an alert popup.

![interface-hello-world](images/interfaces/ex_hello.png)

In this example we have three components:

* `interface`: the main component and also the root node of the XML file. It contains all the other components. It has the following attributes:
    * `skin`: defines the look and feel of the interface
    * `title`: visible in the browser's title bar
    * `width` and `height`: size of the area where components appear
* `page`: defines a view. Interfaces are structured in multiple pages, using components (like buttons) or scripts to navigate between them. It has the following attributes:
    * `id`: every component can have an id to address it in scripts or server-side code. This page has id "page:home" which is the default page that will be opened when the interface is loaded.
    * `title`: visible in the browser's title bar along with the interface's name
* `button`: a clickable element that executes a JavaScript. Has the following attributes:
    * `x` and `y`: coordinates in pixels to define its position
    * `width` and `height`: size of the button in pixels
    * `label`: text that appears on the button
    * `on-click`: a JavaScript that is executed when the button is clicked
    
## Navigation

In this example we have two pages and we use buttons to navigate between them.    
Since navigating to a page will also change the browser's URL (while not refreshing the page) the browser's back and forward buttons will work as well.

**_/webapp/interfaces/navi/index.xml_**

    <interface skin="default" title="Navigation" width="420" height="270" >
        <page id="page:home" title="Homepage">
            <button x="130" y="40" width="160" height="60" label="Page 2" on-click="page('page:page2')" />
            <button x="130" y="150" width="160" height="60" label="Logout" on-click="logout()" />
        </page>
        <page id="page:page2" title="Page 2">
            <button x="130" y="40" width="160" height="60" label="Home page" on-click="page('page:home')" />
        </page>
    </interface>

Here we can see how each button calls the predefined function "page" passing the target page's id as parameter. 
On the first page we also have a button that logs the user out.    

See [Client-side scripting](client-scripting.html) for a description of all the predefined functions and how to use them.

![interface-navigation-1](images/interfaces/ex_navi_1.png)

![interface-navigation-2](images/interfaces/ex_navi_2.png)
