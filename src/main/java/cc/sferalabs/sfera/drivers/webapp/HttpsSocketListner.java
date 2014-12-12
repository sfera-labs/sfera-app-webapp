package cc.sferalabs.sfera.drivers.webapp;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.util.concurrent.ArrayBlockingQueue;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;

public class HttpsSocketListner extends SocketListner {
	
	private static final String KEYSTORE_PATH = "data/webapp/sfera.keys";

	public HttpsSocketListner(WebServer webServer, int port,
			ArrayBlockingQueue<Connection> connectionsQ, String sslPassword)
			throws Exception {
		super(webServer, "https", connectionsQ);
		webServer.getLogger().debug("creating https soket on port " + port);
		SSLContext context = SSLContext.getInstance("SSLv3");
		KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
		KeyStore ks = KeyStore.getInstance("JKS");
		char[] kspwd = sslPassword.toCharArray();
		ks.load(Files.newInputStream(Paths.get(KEYSTORE_PATH)), kspwd);
		kmf.init(ks, kspwd);
		context.init(kmf.getKeyManagers(), null, null);
		SSLServerSocketFactory ssf = context.getServerSocketFactory();
		this.serverSocket = (SSLServerSocket) ssf.createServerSocket(port);
	}
}