/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import cc.sferalabs.sfera.apps.webapp.WebApp;
import cc.sferalabs.sfera.events.BaseEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class InterfaceUpdateEvent extends BaseEvent {

	/**
	 * @param interfaceName
	 */
	public InterfaceUpdateEvent(String interfaceName) {
		super(WebApp.getInstance(), "interface." + interfaceName + ".update");
	}

	@Override
	public Long getValue() {
		return getTimestamp();
	}

}
