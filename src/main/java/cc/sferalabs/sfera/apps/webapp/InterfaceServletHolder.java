package cc.sferalabs.sfera.apps.webapp;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.jetty.server.Request;

public class InterfaceServletHolder extends WebappServletHolder {

	static final InterfaceServletHolder INSTANCE = new InterfaceServletHolder();
	private final static Logger logger = LogManager.getLogger();

	@Override
	public void handle(Request baseRequest, ServletRequest request,
			ServletResponse response) throws ServletException,
			UnavailableException, IOException {
		HttpServletRequest req = (HttpServletRequest) request;
		String basePath = req.getServletPath();
		String interfaceName = basePath.substring(1);
		if (req.isUserInRole("admin")
				|| req.isUserInRole("webapp." + interfaceName)) {
			super.handle(baseRequest, request, response);
			return;
		}

		HttpServletResponse resp = (HttpServletResponse) response;
		String uri = req.getRequestURI();
		logger.warn("Unauthorized interface request: {}", uri);
		if (uri.equals(basePath) || uri.equals(basePath + "/")) {
			logger.debug("Redirecting to login...");
			resp.setStatus(HttpServletResponse.SC_TEMPORARY_REDIRECT);
			resp.setHeader("Location", basePath + "/login/");
			return;
		}

		resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
	}
}
