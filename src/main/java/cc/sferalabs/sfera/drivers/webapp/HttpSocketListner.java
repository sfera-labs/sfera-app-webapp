package cc.sferalabs.sfera.drivers.webapp;

import java.net.ServerSocket;
import java.util.concurrent.ArrayBlockingQueue;

public class HttpSocketListner extends SocketListner {

	/**
	 * 
	 * @param webApp
	 * @param port
	 * @param connectionsQ
	 * @throws Exception
	 */
	public HttpSocketListner(WebApp webApp, int port,
			ArrayBlockingQueue<Connection> connectionsQ) throws Exception {
		super(webApp, "http", connectionsQ);
		logger.debug("Creating http soket on port {}", port);
		this.serverSocket = new ServerSocket(port);
	}
}
