/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import java.io.IOException;

import cc.sferalabs.sfera.http.api.HttpApiEvent;
import cc.sferalabs.sfera.ui.UIEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebUIEvent extends UIEvent {

	private final String value;

	/**
	 * 
	 * @param id
	 * @param httpEvent
	 */
	public WebUIEvent(String id, HttpApiEvent httpEvent) {
		super(new WebUI(httpEvent), id);
		this.value = httpEvent.getValue();
	}

	@Override
	public WebUI getSource() {
		return (WebUI) super.getSource();
	}

	@Override
	public String getValue() {
		return value;
	}

	/**
	 * 
	 * @return
	 */
	public String getSessionId() {
		return getSource().getRemote().getHttpRequest().getSession().getId();
	}

	/**
	 * @param result
	 * @throws IOException
	 */
	public void reply(Object result) throws IOException {
		getSource().getRemote().reply(result);
	}

}
