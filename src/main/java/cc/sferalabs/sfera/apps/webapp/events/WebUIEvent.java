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

	private final HttpApiEvent httpEvent;
	private RemoteUi remoteUi;

	/**
	 * 
	 * @param id
	 * @param httpEvent
	 */
	public WebUIEvent(String id, HttpApiEvent httpEvent) {
		super(id, httpEvent.getValue());
		this.httpEvent = httpEvent;
	}

	@Override
	public String getValue() {
		return (String) super.getValue();
	}

	/**
	 * @return
	 */
	public synchronized RemoteUi getRemoteUi() {
		if (remoteUi == null) {
			remoteUi = new RemoteUi();
		}
		return remoteUi;
	}

	/**
	 * @param result
	 * @throws IOException
	 */
	public void reply(Object result) throws IOException {
		httpEvent.reply(result);
	}

}
