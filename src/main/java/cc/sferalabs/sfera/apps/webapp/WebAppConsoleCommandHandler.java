/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import cc.sferalabs.sfera.console.ConsoleCommandHandler;
import cc.sferalabs.sfera.console.ConsoleSession;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebAppConsoleCommandHandler implements ConsoleCommandHandler {

	static final WebAppConsoleCommandHandler INSTANCE = new WebAppConsoleCommandHandler();

	/**
	 * 
	 */
	private WebAppConsoleCommandHandler() {
	}
	
	@Override
	public String getKey() {
		return "webapp";
	}

	@Override
	public String accept(String cmd, ConsoleSession session) {
		switch (cmd) {
		case "rebuild":
			Cache.buildCache();
			return "Done";

		default:
			return "Unkown command";
		}
	}

}
