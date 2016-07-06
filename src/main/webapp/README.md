# Sfera WebApp

The Sfera Web App is a fully customizable and expandable framework based on HTML5, CSS3 and JavaScript that enables you to easily create Web user interfaces to interact with your Sfera system through any Web browser.

You can create custom interfaces by simply placing components such as buttons, images, input fields, etc. using a simple XML format and link them with events or other actions to be triggered on the server.
For more advanced applications you can easily add your own JavaScript code and link it to action on components or events from the Sfera server.
If that’s still not enough for your project you can create custom components with their own look and behaviors, custom skins for your interfaces and overwrite the design and functionalities of standard components.

Moreover, it provides a Web-based development environment, the Web IDE or wIDE, to browse and edit files on the server and to interact with Sfera’s console.

* **Visit:** [Sfera Labs website](https://sferalabs.cc) and [Sfera website](https://sferalabs.cc/sfera)
* **Learn:** [Documentation](https://sfera.sferalabs.cc/docs)

## Building

[Grunt](http://gruntjs.com) automates the building of the client part of the WebApp.

To install Grunt see [http://gruntjs.com/installing-grunt](http://gruntjs.com/installing-grunt).

The following Grunt plugins are needed:
* [grunt-contrib-copy](https://www.npmjs.com/package/grunt-contrib-copy)
* [grunt-contrib-concat](https://www.npmjs.com/package/grunt-contrib-concat)
* [grunt-contrib-sass](https://www.npmjs.com/package/grunt-sass)
* [grunt-contrib-clean](https://www.npmjs.com/package/grunt-contrib-clean)
* [grunt-contrib-uglify](https://www.npmjs.com/package/grunt-contrib-uglify)
* [grunt-execute](https://www.npmjs.com/package/grunt-execute)


The tasks:

* 'grunt compile': compiles the whole project and moves files into the build directory (src/main/resources/webapp).
* 'grunt doc': generates the markdown documentation for all components, which integrates information from the actual JavaScript structure of the objects with the user written documentation. The files are copied to src/site/markdown, ready to be built.
