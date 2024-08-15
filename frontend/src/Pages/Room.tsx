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
    <div className='text-white text-2xl font-extrabold'>
        <button onClick={()=> sendStream(mystream)}>send my stream</button>
        <ReactPlayer url={mystream!} playing muted />
        <h2>U are conneted to</h2>
        {otherUser}
        <ReactPlayer url={remoteStream!} playing />
    </div>
  )
}

export default Room
