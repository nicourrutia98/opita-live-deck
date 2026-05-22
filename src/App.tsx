import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Viewer from './pages/Viewer';
import Presenter from './pages/Presenter';
import Interact from './pages/Interact';
import { PasswordGate } from './components/PasswordGate';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Viewer />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/interact" element={<Interact />} />
        <Route path="/admin" element={
          <PasswordGate>
            <Presenter />
          </PasswordGate>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
