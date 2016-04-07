/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import javax.servlet.http.HttpServletRequest;

import cc.sferalabs.sfera.http.api.RemoteApiEvent;
import cc.sferalabs.sfera.ui.UIEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebAppUIEvent extends UIEvent {

	private final RemoteApiEvent httpEvent;

	/**
	 * 
	 * @param id
	 * @param httpEvent
	 */
	public WebAppUIEvent(String id, RemoteApiEvent httpEvent) {
		super(id, httpEvent.getValue(), httpEvent.getConnectionId());
		this.httpEvent = httpEvent;
	}

	@Override
	public String getValue() {
		return (String) super.getValue();
	}

	/**
	 * @return
	 */
	public HttpServletRequest getHttpRequest() {
		return httpEvent.getHttpRequest();
	}

}
