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
				if (name.endsWith("client.custom_intro.js")) {
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
			res = (Map<String, String>) invocable.invokeFunction("compile", "code.js", files, null);
		} catch (NoSuchMethodException e) {
			throw new RuntimeException(e);
		}

		Files.write(dir.resolve("code.js"), res.get("output").getBytes(StandardCharsets.UTF_8));
		Files.write(dir.resolve("code.js.map"), res.get("map").getBytes(StandardCharsets.UTF_8));
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
