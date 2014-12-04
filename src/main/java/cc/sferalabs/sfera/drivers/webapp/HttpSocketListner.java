package cc.sferalabs.sfera.drivers.webapp;

import java.net.ServerSocket;
import java.util.concurrent.ArrayBlockingQueue;

public class HttpSocketListner extends SocketListner {

	public HttpSocketListner(WebServer webServer, int port,
			ArrayBlockingQueue<Connection> connectionsQ) throws Exception {
		super(webServer, "http", connectionsQ);
		this.serverSocket = new ServerSocket(port);
	}
}
