package cc.sferalabs.sfera.apps.webapp.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;

import org.eclipse.jetty.server.Request;

public class AuthInterfaceCacheServletHolder extends InterfaceCacheServletHolder {

	public static final AuthInterfaceCacheServletHolder INSTANCE = new AuthInterfaceCacheServletHolder();

	@Override
	public void handle(Request baseRequest, ServletRequest request, ServletResponse response)
			throws ServletException, UnavailableException, IOException {
		HttpServletRequest req = (HttpServletRequest) request;
		String basePath = req.getServletPath();
		String interfaceName = basePath.substring(1);
		redirectIfNotInRoles(baseRequest, request, response, "admin", "webapp." + interfaceName);
	}

}
