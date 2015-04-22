package cc.sferalabs.sfera.drivers.webapp;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleBindings;

import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import cc.sferalabs.sfera.drivers.Driver;
import cc.sferalabs.sfera.drivers.Drivers;
import cc.sferalabs.sfera.drivers.webapp.access.Token;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarLexer;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarParser;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarParser.ParameterContext;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarParser.ParamsListContext;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarParser.SubNodeContext;
import cc.sferalabs.sfera.script.parser.SferaScriptGrammarParser.TerminalNodeContext;

public abstract class CommandExecutor {

	private final static Logger logger = LogManager.getLogger();

	private static final ScriptEngine scriptEngine = new ScriptEngineManager()
			.getEngineByName("nashorn");

	/**
	 * 
	 * @param token
	 * @param query
	 * @return
	 */
	public static String command(Token token, Map<String, String> query) {
		logger.info("Command request: " + query + " User: "
				+ token.getUser().getUsername());

		for (Entry<String, String> command : query.entrySet()) {
			try {
				String commandName = command.getKey();
				String commandValue = command.getValue();

				CommandSyntaxErrorListener commandErrorListener = new CommandSyntaxErrorListener();

				SferaScriptGrammarParser parser = getParser(commandName,
						commandErrorListener);
				TerminalNodeContext commandContext = parser.terminalNode();
				String error = commandErrorListener.getError();
				if (error != null) {
					throw new Exception("Command syntax error: " + error);
				}

				String driverName = commandContext.NodeId().getText();
				Driver driver = Drivers.getDriver(driverName);

				if (driver == null) {
					throw new Exception("Driver '" + driverName + "' not found");
				}

				String commandScript = commandName;
				if (commandValue != null) {
					parser = getParser(commandValue, commandErrorListener);
					parser.paramsList();
					error = commandErrorListener.getError();
					if (error != null) {
						throw new Exception("Command value syntax error: "
								+ error);
					}
					commandScript += "=" + commandValue;

				} else if (!commandScript.endsWith(")")) {
					commandScript += "()";
				}

				Bindings bindings = new SimpleBindings();
				bindings.put(driverName, driver);
				scriptEngine.eval(commandScript, bindings);

			} catch (Exception e) {
				logger.warn("Error executing command '" + command + "'", e);
			}
		}

		// TODO return response
		return null;
	}

	/**
	 * 
	 * @param token
	 * @param query
	 * @return
	 */
	public static String commandUsingReflection(Token token,
			Map<String, String> query) {
		logger.info("Command request: " + query + " User: "
				+ token.getUser().getUsername());

		for (Entry<String, String> command : query.entrySet()) {
			try {
				String commandName = command.getKey();
				String commandValue = command.getValue();

				CommandSyntaxErrorListener commandErrorListener = new CommandSyntaxErrorListener();

				SferaScriptGrammarParser parser = getParser(commandName,
						commandErrorListener);
				TerminalNodeContext commandContext = parser.terminalNode();
				String error = commandErrorListener.getError();
				if (error != null) {
					throw new Exception("Command syntax error: " + error);
				}

				ParamsListContext valueContext;
				if (commandValue == null) {
					valueContext = null;
				} else {
					parser = getParser(commandValue, commandErrorListener);
					valueContext = parser.paramsList();
					error = commandErrorListener.getError();
					if (error != null) {
						throw new Exception("Command value syntax error: "
								+ error);
					}
				}

				String driverName = commandContext.NodeId().getText();
				List<SubNodeContext> methods = commandContext.subNode();
				Object currentNode = Drivers.getDriver(driverName);

				if (currentNode == null) {
					throw new Exception("Driver '" + driverName + "' not found");
				}

				for (int i = 0; i < methods.size(); i++) {
					SubNodeContext methodCall = methods.get(i);
					String methodName = methodCall.NodeId().getText();
					ParamsListContext paramsList = methodCall.parameters() == null ? null
							: methodCall.parameters().paramsList();
					if (i == methods.size() - 1 && valueContext != null) {
						if (paramsList != null) {
							throw new Exception(
									"Both value and parameters on last method cannot be used");
						}
						paramsList = valueContext;
					}
					if (paramsList != null) {
						Object[] params = getParameters(paramsList);
						Method method = getSuitableMethod(currentNode,
								methodName, params);
						currentNode = method.invoke(currentNode, params);

					} else {
						Method method = currentNode.getClass().getMethod(
								methodName);
						currentNode = method.invoke(currentNode);
					}
				}

			} catch (Exception e) {
				logger.warn("Error executing command '" + command + "'", e);
			}
		}

		// TODO return response
		return null;
	}

	/**
	 * 
	 * @param obj
	 * @param methodName
	 * @param params
	 * @return
	 * @throws NoSuchMethodException
	 */
	private static Method getSuitableMethod(Object obj, String methodName,
			Object[] params) throws NoSuchMethodException {
		for (Method method : obj.getClass().getMethods()) {

			System.out.println("\n-----");
			System.out.println(method);

			if (methodName.equals(method.getName())) {
				Class<?>[] parameterTypes = method.getParameterTypes();

				if (parameterTypes.length == params.length) {
					boolean match = true;
					for (int i = 0; i < parameterTypes.length; i++) {

						Class<?> typeToMatch = params[i].getClass();
						if (typeToMatch == Integer.class) {
							typeToMatch = int.class;
						} else if (typeToMatch == Double.class) {
							typeToMatch = double.class;
						}

						System.out.println(typeToMatch);
						System.out.println(parameterTypes[i]);

						if (!parameterTypes[i].isAssignableFrom(typeToMatch)) {
							match = false;
							break;
						}
					}

					if (match) {
						return method;
					}
				}
			}
		}

		throw new NoSuchMethodException();

		// TODO create methods cache
	}

	/**
	 * 
	 * @param input
	 * @param commandSyntaxErrorListener
	 * @return
	 */
	private static SferaScriptGrammarParser getParser(String input,
			CommandSyntaxErrorListener commandSyntaxErrorListener) {
		SferaScriptGrammarLexer lexer = new SferaScriptGrammarLexer(
				new ANTLRInputStream(input));
		CommonTokenStream tokens = new CommonTokenStream(lexer);
		SferaScriptGrammarParser parser = new SferaScriptGrammarParser(tokens);

		lexer.removeErrorListeners();
		lexer.addErrorListener(commandSyntaxErrorListener);
		parser.removeErrorListeners();
		parser.addErrorListener(commandSyntaxErrorListener);

		return parser;
	}

	/**
	 * 
	 * @param paramsListContext
	 * @return
	 */
	private static Object[] getParameters(ParamsListContext paramsListContext) {
		List<ParameterContext> parameters = paramsListContext.parameter();
		Object[] ret = new Object[parameters.size()];
		for (int i = 0; i < parameters.size(); i++) {
			ParameterContext parameter = parameters.get(i);
			if (parameter.StringLiteral() != null) {
				String text = parameter.StringLiteral().getText();
				// removing quotes
				ret[i] = text.substring(1, text.length() - 1);

			} else if (parameter.BooleanLiteral() != null) {
				ret[i] = Boolean.parseBoolean(parameter.BooleanLiteral()
						.getText());

			} else if (parameter.NumberLiteral() != null) {
				String num = parameter.NumberLiteral().getText();
				try {
					ret[i] = Integer.parseInt(num);
				} catch (NumberFormatException e) {
					ret[i] = Double.parseDouble(num);
				}
			}
		}

		return ret;
	}

}
