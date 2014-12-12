package cc.sferalabs.sfera.drivers.webapp;

import java.net.ServerSocket;
import java.util.concurrent.ArrayBlockingQueue;

public class HttpSocketListner extends SocketListner {

	public HttpSocketListner(WebServer webServer, int port,
			ArrayBlockingQueue<Connection> connectionsQ) throws Exception {
		super(webServer, "http", connectionsQ);
		webServer.getLogger().debug("creating http soket on port " + port);
		this.serverSocket = new ServerSocket(port);
	}
}
