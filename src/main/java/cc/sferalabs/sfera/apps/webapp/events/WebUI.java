/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import javax.servlet.http.HttpServletRequest;

import cc.sferalabs.sfera.access.User;
import cc.sferalabs.sfera.http.api.HttpApiEvent;
import cc.sferalabs.sfera.http.api.HttpRemoteNode;
import cc.sferalabs.sfera.ui.UI;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebUI extends UI {

	private final HttpServletRequest httpRequest;
	private final User user;

	/**
	 * @param httpEvent
	 */
	public WebUI(HttpApiEvent httpEvent) {
		HttpRemoteNode remote = httpEvent.getSource();
		this.httpRequest = remote.getHttpRequest();
		this.user = remote.getUser();
	}

	/**
	 * @return the user
	 */
	public User getUser() {
		return user;
	}

	/**
	 * @return the httpRequest
	 */
	public HttpServletRequest getHttpRequest() {
		return httpRequest;
	}
}
