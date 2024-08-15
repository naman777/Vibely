import React, { useCallback, useEffect } from 'react'
import { useSocket } from '../Hooks/useSocket';
import { usePeer } from '../Hooks/Peer';
import ReactPlayer from 'react-player';

const Room = () => {

    const {socket} = useSocket();
    const [otherUser, setOtherUser] = React.useState<string>("");
    const [mystream, setMystream] = React.useState<MediaStream | null>(null);
    const {peer,createOffer,createAnswer,setRemoteAnswer,sendStream,remoteStream} = usePeer();


    useEffect(() => {
        socket.on("user-joined", handleNewUserJoined);
        socket.on("incomming-call", handleIncommingCall);
        socket.on("call-accepted", handleCallAccepted);

        return () => {
            socket.off("user-joined", handleNewUserJoined);
            socket.off("incomming-call", handleIncommingCall);
            socket.off("call-accepted", handleCallAccepted);
        }
    }, [socket]);

    const handleIncommingCall = useCallback(
        async (data:any) => {
            const {offer,from} = data;
            const answer = await createAnswer(offer);
            setOtherUser(from);
            socket.emit("call-accepted",{name:from,answer});
        },[peer,socket]
    );

    const handleNewUserJoined = useCallback( 
        async (data:any) => {
            const {name} = data;
            setOtherUser(name);
            const offer = await createOffer();
            socket.emit("call-user",{offer,name});
        },
    [createOffer,socket]);

    const handleCallAccepted = useCallback(
        async (data:any) => {
            const {answer} = data;
            await setRemoteAnswer(answer);
            sendStream(mystream!);
        },
        [setRemoteAnswer]
    );

    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        setMystream(stream);
    },[])


    useEffect(() => {
        getUserMediaStream();
    },[getUserMediaStream]);

    const handleNegotiationNeeded = useCallback(async () => {
        if (mystream) {
            await sendStream(mystream);
            const localOffer = await createOffer();
            socket.emit("call-user", { offer: localOffer, name: otherUser });
        }
    }, [mystream, sendStream, createOffer, otherUser, socket]);

    useEffect(() => {
        peer.addEventListener("negotiationneeded",handleNegotiationNeeded );

        return () => {
            peer.removeEventListener("negotiationneeded",handleNegotiationNeeded);
        }
    },[mystream,sendStream]);


  return (
    <div className='min-h-screen bg-gray-900 p-4 flex flex-col'>
            <div className='flex-1 flex flex-col md:flex-row gap-5'>
                {/* Remote Stream Section */}
                <div className='flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-lg md:w-3/4'>
                    <h2 className='text-white text-2xl font-bold mb-2'>You are connected to:</h2>
                    <p className='text-white text-xl mb-4'>{otherUser}</p>
                    <div className='relative w-full h-0' style={{ paddingTop: '50%' }}>
                        <ReactPlayer
                            url={remoteStream !}
                            playing
                            width='100%'
                            height='100%'
                            className='absolute top-0 left-0 rounded-lg border border-gray-700'
                        />
                    </div>
                </div>

                {/* Local Stream Section */}
                <div className='flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-lg md:w-1/4 justify-center'>
                    <h2 className='text-white text-2xl font-bold mb-2'>Your Stream:</h2>
                    <div className='w-full mb-4'>
                        <ReactPlayer
                            url={mystream !}
                            playing
                            muted
                            width='100%'
                            height='auto'
                            className='rounded-lg border border-gray-700'
                        />
                    </div>
                    <button
                        onClick={() => mystream && sendStream(mystream)}
                        className=' w-full px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-md text-white'
                    >
                        Send My Stream
                    </button>
                </div>
            </div>
        </div>
  )
}

export default Room
