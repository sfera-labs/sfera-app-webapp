/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import cc.sferalabs.sfera.console.ConsoleCommandHandler;

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
	public String accept(String cmd) {
		switch (cmd) {
		case "rebuild":
			Cache.buildCache();
			return "Done";

		default:
			return "Unkown command";
		}
	}

	@Override
	public String[] getHelp() {
		return new String[] { "rebuild" };
	}

}
