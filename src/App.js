import "./App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Authenticate from "./pages/authenticate/Authenticate";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import Navbar from "./components/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";

function App() {
  const { authIsReady, user } = useAuthContext();

  return (
    <div className="App">
      {authIsReady && (
        <BrowserRouter>
          <div className="container">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/authenticate" element={user ? <Navigate to="/" /> : <Authenticate />} />
            </Routes>
          </div>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
