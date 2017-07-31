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

/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import javax.servlet.http.HttpServletRequest;

import cc.sferalabs.sfera.access.User;
import cc.sferalabs.sfera.ui.UIEvent;
import cc.sferalabs.sfera.web.api.WebApiEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebAppUIEvent extends UIEvent {

	private final WebApiEvent webApiEvent;

	/**
	 * 
	 * @param id
	 *            event ID
	 * @param webApiEvent
	 *            Web API event that triggered this event
	 */
	public WebAppUIEvent(String id, WebApiEvent webApiEvent) {
		super(id, webApiEvent.getValue(), webApiEvent.getConnectionId());
		this.webApiEvent = webApiEvent;
	}

	@Override
	public String getValue() {
		return (String) super.getValue();
	}

	/**
	 * @return the HTTP request associated with this event
	 */
	public HttpServletRequest getHttpRequest() {
		return webApiEvent.getHttpRequest();
	}
	
	/**
	 * Returns the user associated with this event.
	 * 
	 * @return the user
	 */
	public User getUser() {
		return webApiEvent.getUser();
	}

}
