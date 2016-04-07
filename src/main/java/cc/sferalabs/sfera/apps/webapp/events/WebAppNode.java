/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import cc.sferalabs.sfera.events.Node;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebAppNode extends Node {

	public static final WebAppNode INSTANCE = new WebAppNode();

	/**
	 * 
	 */
	private WebAppNode() {
		super("webapp");
	}

}
