import React, { useCallback, useEffect, useMemo } from 'react'

const PeerContext = React.createContext<any>(null);

export const usePeer = () => {
    return React.useContext(PeerContext);
};

export const PeerProvider = (props: any) => {

    const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);


    const peer = useMemo(() => {
        return new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478"
                    ]
                }
            ]
        });
    }, []);

    const createOffer = async () => {
        if (!peer) {
            throw new Error("Peer connection is not initialized.");
        }
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async (offer: RTCSessionDescriptionInit) => {
        if (!peer) {
            throw new Error("Peer connection is not initialized.");
        }
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (!peer) {
            throw new Error("Peer connection is not initialized.");
        }
        await peer.setRemoteDescription(answer);
    }

    const sendStream = async (stream: MediaStream) => {
        if (!stream) {
            console.error("Stream is null or undefined.");
            return;
        }
    
        if (peer.signalingState !== "stable") {
            console.warn("Peer connection is not in a stable state.");
            return;
        }
    
        const tracks = stream.getTracks();
    
        tracks.forEach(track => {
            const existingSender = peer.getSenders().find(sender => sender.track === track);
    
            if (!existingSender) {
                peer.addTrack(track, stream);
            }
        });
    }
    
    
    const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
        console.log("Got remote stream");
        const stream = event.streams[0];
        setRemoteStream(stream);
    }, []);

    

    useEffect(() => {
        peer.addEventListener("track", handleTrackEvent);
        
        return () => {
            peer.removeEventListener("track", handleTrackEvent);
            
        }
    },[peer,handleTrackEvent]);

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAnswer,sendStream,remoteStream }}>
            {props.children}
        </PeerContext.Provider>
    );
};
