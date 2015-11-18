/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.Result;
import com.google.javascript.jscomp.SourceFile;




/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public abstract class JavaScriptClosureBuilder {

	static synchronized void build(List<String> fileNames, Path dir) throws IOException {
		List<SourceFile> inputs = new ArrayList<>();
		for (String fileName : fileNames) {
			SourceFile sf = new SourceFile(fileName) {
				
				@Override
				public String getCode() throws IOException {
					return getContent(fileName);
				}
			};
			inputs.add(sf);
		}
		List<SourceFile> externs = Collections.emptyList();

		CompilerOptions options = new CompilerOptions();
		CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);

		Compiler compiler = new Compiler();
		Result result = compiler.compile(externs, inputs, options);

		if (result.success) {
			System.out.println("-------------------");
			System.out.println(result.sourceMap);
			System.out.println("-------------------");
			System.out.println(compiler.toSource());
			System.out.println("-------------------");
			
			//Files.write(dir.resolve("code.js"), compiler.toSource().getBytes(StandardCharsets.UTF_8));
			
		} else {
			for (JSError e : result.errors) {
				System.err.println(e);
			}
		}
	}

	/**
	 * @param fileName
	 * @return
	 * @throws IOException 
	 * @throws NoSuchFileException 
	 */
	private static String getContent(String fileName) throws NoSuchFileException, IOException {
		Path filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(fileName));
		return new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
	}

	
}
