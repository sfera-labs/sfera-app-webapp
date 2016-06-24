/*-
 * +======================================================================+
 * Sfera Web App
 * ---
 * Copyright (C) 2015 - 2016 Sfera Labs S.r.l.
 * ---
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * -======================================================================-
 */

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
