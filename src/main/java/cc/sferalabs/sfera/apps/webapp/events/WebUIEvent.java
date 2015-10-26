/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import java.io.IOException;

import cc.sferalabs.sfera.http.api.HttpApiEvent;
import cc.sferalabs.sfera.ui.UI;
import cc.sferalabs.sfera.ui.UIEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebUIEvent extends UIEvent {

	private final HttpApiEvent httpEvent;

	/**
	 * 
	 * @param id
	 * @param httpEvent
	 */
	public WebUIEvent(String id, HttpApiEvent httpEvent) {
		super(UI.getInstance(), id);
		this.httpEvent = httpEvent;
	}

	@Override
	public String getValue() {
		return httpEvent.getValue();
	}

	/**
	 * 
	 * @return
	 */
	public String getSessionId() {
		return httpEvent.getSource().getHttpRequest().getSession().getId();
	}

	/**
	 * @param result
	 * @throws IOException
	 */
	public void reply(Object result) throws IOException {
		httpEvent.reply(result);
	}

}
