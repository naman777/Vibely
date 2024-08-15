import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../Components/Spinner';
import { useSocket } from '../Hooks/useSocket';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [roomId, setRoomId] = useState<string>("");

    const {socket,isConnected} = useSocket();

    const handleJoinedRoom = useCallback( ({roomId}:{
        roomId:string
    }) => {
        navigate(`/room/${roomId}`);
    },[navigate]);

    useEffect(() => {
        socket.on("joined-room", handleJoinedRoom);
        
        return () => {
            socket.off("joined-room");
        } 
        
    }, [socket,handleJoinedRoom]);
    
    

    const handleJoinRoom = () => {
        if (name && roomId) {
            socket.emit("join-room", { name, roomId });
        }
        else {
            alert("Please enter your name and room ID to join a room.");
        }
    } 

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-white ">
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Vibely</h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto">
          Seamless and secure video calling for everyone. Whether it's for work, study, or catching up with loved ones, Vibely brings people together with just a click. Connecting People!!!
        </p>
      </div>

      <div className="w-[500px] max-w-4xl ">
        {/* Join Room Section */}
        <div className="p-6 rounded-lg shadow-lg flex flex-col items-center justify-center ">
          <h2 className="text-2xl font-semibold mb-4">Create/Join Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
          />
          <button
            className="w-full px-4 py-2 mb-4 bg-blue-600 hover:bg-blue-800 rounded-lg shadow-md"
            onClick={handleJoinRoom}
          >
            Create/Join Room
          </button>
        </div>
      </div>
      {!isConnected && (<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Spinner />
    </div>)}
    </div>
  )
};

export default Home;
