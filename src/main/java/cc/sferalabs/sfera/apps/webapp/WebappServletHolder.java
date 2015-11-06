/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletHolder;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebappServletHolder extends ServletHolder {
	
	static final WebappServletHolder INSTANCE = new WebappServletHolder();
	
	/**
	 * 
	 */
	protected WebappServletHolder() {
		super(DefaultServlet.class);
		setInitParameter("resourceBase", WebApp.ROOT.toString());
		setInitParameter("dirAllowed", "false");
	}

}
