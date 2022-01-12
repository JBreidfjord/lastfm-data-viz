import "./App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Authenticate from "./pages/authenticate/Authenticate";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import Navbar from "./components/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";
import { useState } from "react";

function App() {
  const { authIsReady, user } = useAuthContext();
  const [scrobbleData, setScrobbleData] = useState({ scrobbles: [], user: null });
  const [showNav, setShowNav] = useState(true);

  return (
    <div className="App">
      {authIsReady && (
        <BrowserRouter>
          <div className="container">
            {showNav && <Navbar dataUser={scrobbleData.user} />}
            <Routes>
              <Route
                path="/"
                element={<Home setScrobbleData={setScrobbleData} scrobbleData={scrobbleData} />}
              />
              <Route
                path="/dashboard"
                element={
                  scrobbleData.user ? (
                    <Dashboard scrobbleData={scrobbleData} setShowNav={setShowNav} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route path="/authenticate" element={user ? <Navigate to="/" /> : <Authenticate />} />
            </Routes>
          </div>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
