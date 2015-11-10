/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.sferalabs.sfera.core.services.console.ConsoleCommandHandler;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebAppConsoleCommandHandler implements ConsoleCommandHandler {

	private static final Logger logger = LoggerFactory.getLogger(WebAppConsoleCommandHandler.class);

	static final WebAppConsoleCommandHandler INSTANCE = new WebAppConsoleCommandHandler();

	/**
	 * 
	 */
	private WebAppConsoleCommandHandler() {
	}

	@Override
	public void accept(String cmd) {
		switch (cmd) {
		case "rebuild":
			Cache.buildCache();
			break;

		default:
			logger.warn("Unkown command");
			break;
		}
	}

	@Override
	public String[] getHelp() {
		return new String[] { "rebuild" };
	}

}
