# Configuration

The configuration file for the Web App is located at `config/apps/WebApp.yml`.

Refer to the [JavaDoc page](apidocs/index.html) of the app for a complete list of available configuration parameters.

For most cases, you can leave the configuration file empty, i.e. use the default configuration.

## Access

To access the Web IDE the user requires the "admin" role. Admins are also able to access all the interfaces.

To grant a non-admin user access to an interface, add "webapp.&lt;interface_name&gt;" to his roles. For instance, a user with roles "webapp.home" and "webapp.hello" can access the interfaces "home" and "hello".

Refer to [Sfera's configuration](../../../sfera/configuration.html#Remote_access) for details on access roles. 
