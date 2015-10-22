/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

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

	private HttpRemoteNode remote;

	/**
	 * @param httpEvent
	 */
	public WebUI(HttpApiEvent httpEvent) {
		this.remote = httpEvent.getSource();
	}

	/**
	 * @return the remote
	 */
	public HttpRemoteNode getRemote() {
		return remote;
	}

}
