/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import cc.sferalabs.sfera.apps.webapp.WebApp;
import cc.sferalabs.sfera.events.NumberEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class InterfaceUpdateEvent extends NumberEvent {

	/**
	 * 
	 * @param interfaceName
	 * @param timestamp
	 */
	public InterfaceUpdateEvent(String interfaceName, long timestamp) {
		super(WebApp.getInstance(), "interface." + interfaceName + ".update", timestamp);
	}

}
