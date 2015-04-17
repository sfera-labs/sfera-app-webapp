package cc.sferalabs.sfera.drivers.webapp;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ArrayBlockingQueue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import cc.sferalabs.sfera.core.Task;

public abstract class SocketListner extends Task {

	private final WebApp webApp;
	private final ArrayBlockingQueue<Connection> connectionsQ;
	private final String protocolName;
	protected ServerSocket serverSocket;

	protected final Logger logger;

	/**
	 * 
	 * @param webApp
	 * @param protocolName
	 * @param connectionsQ
	 * @throws Exception
	 */
	public SocketListner(WebApp webApp, String protocolName,
			ArrayBlockingQueue<Connection> connectionsQ) throws Exception {
		super(webApp.getId() + ":SocketListner:" + protocolName);
		this.webApp = webApp;
		this.protocolName = protocolName;
		this.connectionsQ = connectionsQ;
		this.logger = LogManager.getLogger(getClass().getName() + "."
				+ webApp.getId());
	}

	@Override
	public void execute() {
		logger.info("Accepting connections on port {}",
				serverSocket.getLocalPort());
		Socket s = null;
		try {
			while (true) {
				s = serverSocket.accept();
				Connection c = new Connection(s, protocolName);
				if (!connectionsQ.offer(c)) {
					logger.warn("Too many connections");
				}
			}
		} catch (IOException e) {
			logger.error("Error accepting connection", e);
			if (s != null) {
				try {
					s.close();
				} catch (IOException ioe) {
				}
			}

			webApp.quit();
		}
	}

	/**
	 * 
	 */
	public void close() {
		try {
			serverSocket.close();
		} catch (Exception e) {
		}
	}

}
