/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
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
		public final String code;

		private JsFile(String name) throws NoSuchFileException, IOException {
			this.name = name;
			Path filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(name));
			this.code = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
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
			System.err.println("init");
			init();
		}

		List<JsFile> files = new ArrayList<>();
		for (String name : fileNames) {
			files.add(new JsFile(name));
		}

		System.err.println("start");
		long start = System.currentTimeMillis();
		Map<String, String> res;
		try {
			res = (Map<String, String>) invocable.invokeFunction("compile", "code.js", files, "");
		} catch (NoSuchMethodException e) {
			throw new RuntimeException(e);
		}
		System.err.println("t: " + (System.currentTimeMillis() - start));

		Files.write(dir.resolve("code.js"), res.get("output").getBytes());
		Files.write(dir.resolve("code.js.map"), res.get("map").getBytes());
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
