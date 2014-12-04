package cc.sferalabs.sfera.drivers.webserver;

import cc.sferalabs.sfera.events.Node;

public class GUINode implements Node {
	
	public static final GUINode INSTANCE = new GUINode();
	
	/**
	 * Private constructor for singleton instance
	 */
	private GUINode() {}

	/**
	 * 
	 */
	public String getId() {
		return "gui";
	}
}
