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

import javax.script.Compilable;
import javax.script.CompiledScript;
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
public class JavaScriptBuilder2 {

	private static CompiledScript builder;

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
	static synchronized void build(List<String> fileNames, Path dir)
			throws ScriptException, IOException {
		if (builder == null) {
			System.err.println("init");
			init();
		}

		List<JsFile> files = new ArrayList<>();
		for (String name : fileNames) {
			files.add(new JsFile(name));
		}

		System.err.println("start");
		long start = System.currentTimeMillis();
		builder.getEngine().put("files", files);
		@SuppressWarnings("unchecked")
		Map<String, String> res = (Map<String, String>) builder.eval();
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
		load(engine, "source-map.js");
		load(engine, "uglify.js");
		load(engine, "compile.js");
		Compilable compilable = (Compilable) engine;
		builder = compilable.compile("compile('code.js', files, '');");
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
		try (InputStream in = JavaScriptBuilder2.class.getClassLoader()
				.getResourceAsStream("webapp/build/" + script);
				InputStreamReader reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
			engine.eval(reader);
		}
	}

}
