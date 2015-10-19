/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

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
	public String getValue() {
		return value;
	}

}
