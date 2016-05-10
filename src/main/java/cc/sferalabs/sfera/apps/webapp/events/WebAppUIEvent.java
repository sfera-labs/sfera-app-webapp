/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import javax.servlet.http.HttpServletRequest;

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

}
