package cc.sferalabs.sfera.drivers.webapp;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ArrayBlockingQueue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import cc.sferalabs.sfera.core.Task;

public abstract class SocketListner extends Task {

	private final WebServer webServer;
	private final ArrayBlockingQueue<Connection> connectionsQ;
	private final String protocolName;
	protected ServerSocket serverSocket;

	protected final Logger logger;

	public SocketListner(WebServer webServer, String protocolName,
			ArrayBlockingQueue<Connection> connectionsQ) throws Exception {
		super(webServer.getId() + ":SocketListner:" + protocolName);
		this.webServer = webServer;
		this.protocolName = protocolName;
		this.connectionsQ = connectionsQ;
		this.logger = LogManager.getLogger(getClass().getName() + "."
				+ webServer.getId());
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

			webServer.quit();
		}
	}

	public void close() {
		try {
			serverSocket.close();
		} catch (Exception e) {
		}
	}

}
