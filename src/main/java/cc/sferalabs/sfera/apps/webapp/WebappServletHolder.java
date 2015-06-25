package cc.sferalabs.sfera.apps.webapp;

import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletHolder;

public class WebappServletHolder extends ServletHolder {

	static final WebappServletHolder INSTANCE = new WebappServletHolder();

	/**
	 * 
	 */
	protected WebappServletHolder() {
		super(DefaultServlet.class);
		setInitParameter("resourceBase", InterfaceCache.CACHE_ROOT.toString());
		setInitParameter("dirAllowed", "false");
	}
}
