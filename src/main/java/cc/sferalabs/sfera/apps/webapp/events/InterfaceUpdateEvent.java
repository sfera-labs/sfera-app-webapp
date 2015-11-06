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

	private final long value;

	/**
	 * 
	 * @param interfaceName
	 * @param timestamp
	 */
	public InterfaceUpdateEvent(String interfaceName, long timestamp) {
		super(WebApp.getInstance(), "interface." + interfaceName + ".update");
		this.value = timestamp;
	}

	@Override
	public Long getValue() {
		return value;
	}

}
