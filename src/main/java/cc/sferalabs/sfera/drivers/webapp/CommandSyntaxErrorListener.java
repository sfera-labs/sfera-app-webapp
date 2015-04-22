package cc.sferalabs.sfera.drivers.webapp;

import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;

public class CommandSyntaxErrorListener extends BaseErrorListener {

	private String error = null;

	@Override
	public void syntaxError(Recognizer<?, ?> recognizer,
			Object offendingSymbol, int line, int charPositionInLine,
			String msg, RecognitionException e) {
		error = msg;
	}

	/**
	 * 
	 * @return
	 */
	public String getError() {
		return error;
	}
}
