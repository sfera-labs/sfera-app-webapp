/*-
 * +======================================================================+
 * Sfera Web App
 * ---
 * Copyright (C) 2015 - 2016 Sfera Labs S.r.l.
 * ---
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * -======================================================================-
 */

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
