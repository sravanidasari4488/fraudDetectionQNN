import { createContext, useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import AuthContext from "../context/AuthProvider";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { isLoggedIn, token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      socketRef.current = io("http://localhost:3001", {
        auth: {
          token,
        },
      });

      socketRef.current.on("connect", () => {
        setConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        setConnected(false);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [isLoggedIn, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };

