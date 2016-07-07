# Sfera WebApp Client

This directory contains the sources of the Sfera WebApp Client.

These are built and then used as resources served from the Sfera http server.

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


# Sfera WebApp Client

This directory contains the sources of the Sfera WebApp Client.

These are built and then used as resources served from the Sfera http server.

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

## Icon Set

Default icon set: [https://github.com/Keyamoon/IcoMoon-Free](IcoMoon Free) from [https://icomoon.io](icomoon.io).
Released under the CC BY 4.0 license.
