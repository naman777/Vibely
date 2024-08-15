import React, { useMemo, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext<any>(null);

export const SocketProvider = (props: any) => {
  const [isConnected, setIsConnected] = useState(false);

  const socket = useMemo(() => {
    const socketInstance = io("https://vibely-sk98.onrender.com", {
      transports: ["websocket"], 
      reconnectionAttempts: 5,   
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    return socketInstance;
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return React.useContext(SocketContext);
};
