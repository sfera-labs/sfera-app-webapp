package cc.sferalabs.sfera.apps.webapp.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public abstract class WebAppServletHolder extends ServletHolder {

	private static final Logger logger = LoggerFactory.getLogger(WebAppServletHolder.class);

	/**
	 * 
	 */
	protected WebAppServletHolder(String resourceBase) {
		super(DefaultServlet.class);
		setInitParameter("dirAllowed", "false");
		setInitParameter("cacheControl", "must-revalidate,no-cache,no-store,private,max-age=0");
		setInitParameter("resourceBase", resourceBase);
	}

	/**
	 * 
	 * @param baseRequest
	 * @param request
	 * @param response
	 * @param roles
	 * @throws IOException
	 * @throws ServletException
	 * @throws UnavailableException
	 */
	protected void redirectIfNotInRoles(Request baseRequest, ServletRequest request,
			ServletResponse response, String... roles)
					throws UnavailableException, ServletException, IOException {
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse resp = (HttpServletResponse) response;

		for (String role : roles) {
			if (req.isUserInRole(role)) {
				super.handle(baseRequest, request, response);
				return;
			}
		}

		String basePath = req.getServletPath();
		String uri = req.getRequestURI();
		logger.warn("Unauthorized request: {}", uri);
		if (uri.equals(basePath) || uri.equals(basePath + "/")) {
			logger.debug("Redirecting to login...");
			resp.setStatus(HttpServletResponse.SC_TEMPORARY_REDIRECT);
			resp.setHeader("Location", basePath + "/login/");
			return;
		}

		resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
	}
}
