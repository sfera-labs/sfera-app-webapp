/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

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
	 *            interface name
	 * @param timestamp
	 *            update timestamp
	 */
	public InterfaceUpdateEvent(String interfaceName, long timestamp) {
		super(WebAppNode.INSTANCE, "interface." + interfaceName + ".update", timestamp);
	}

}
