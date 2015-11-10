package cc.sferalabs.sfera.apps.webapp;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.UnavailableException;

import org.eclipse.jetty.server.Request;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class ManagerCacheServletHolder extends WebAppServletHolder {

	static final ManagerCacheServletHolder INSTANCE = new ManagerCacheServletHolder();

	/**
	 * 
	 */
	protected ManagerCacheServletHolder() {
		super(Cache.CACHE_ROOT.toString());
	}

	@Override
	public void handle(Request baseRequest, ServletRequest request, ServletResponse response)
			throws ServletException, UnavailableException, IOException {
		redirectIfNotInRoles(baseRequest, request, response, "admin");
	}
}
