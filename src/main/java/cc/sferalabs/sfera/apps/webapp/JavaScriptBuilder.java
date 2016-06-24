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

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class JavaScriptBuilder {

	private static Invocable invocable;

	/**
	 *
	 */
	public static class JsFile {
		public final String name;
		public String content = "";

		private JsFile(String name) throws IOException {
			this.name = name;
		}

		private void addContentFrom(String file) throws IOException {
			Path filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(file));
			this.content += new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
		}
	}

	/**
	 *
	 * @param fileNames
	 * @param dir
	 * @throws ScriptException
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	static synchronized void build(List<String> fileNames, Path dir)
			throws ScriptException, IOException {
		if (invocable == null) {
			init();
		}

		List<JsFile> files = new ArrayList<>();
		JsFile customJs = null;
		for (String name : fileNames) {
			JsFile jsFile;
			if (customJs == null) {
				if (name.endsWith("custom_intro.js")) { // code/custom_intro.js
					jsFile = new JsFile("custom.js");
					customJs = jsFile;
				} else {
					jsFile = new JsFile(name);
				}
				jsFile.addContentFrom(name);
				files.add(jsFile);
			} else {
				customJs.addContentFrom(name);
			}
		}

		Map<String, String> res;
		try {
			res = (Map<String, String>) invocable.invokeFunction("compile", "interface.js", files,
					null);
		} catch (NoSuchMethodException e) {
			throw new RuntimeException(e);
		}

		Files.write(dir.resolve("interface.js"),
				res.get("output").getBytes(StandardCharsets.UTF_8));
		Files.write(dir.resolve("interface.js.map"),
				res.get("map").getBytes(StandardCharsets.UTF_8));
	}

	/**
	 *
	 * @throws ScriptException
	 * @throws IOException
	 */
	private static void init() throws ScriptException, IOException {
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
		load(engine, "uglify.js");
		invocable = (Invocable) engine;
	}

	/**
	 *
	 * @param engine
	 * @param script
	 * @throws ScriptException
	 * @throws IOException
	 */
	private static void load(ScriptEngine engine, String script)
			throws ScriptException, IOException {
		try (InputStream in = JavaScriptBuilder.class.getClassLoader()
				.getResourceAsStream("webapp/build/" + script);
				InputStreamReader reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
			engine.eval(reader);
		}
	}

}
