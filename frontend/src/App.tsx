import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import { SocketProvider } from './Hooks/useSocket';
import Room from './Pages/Room';
import { PeerProvider } from './Hooks/Peer';

export default function App() {
  return (
    <SocketProvider>
    <PeerProvider>

    <BrowserRouter>
  
        
        
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        
    </BrowserRouter>
    </PeerProvider>
    </SocketProvider>
  );
}
