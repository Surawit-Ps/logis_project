import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import SubmitClaim from "./pages/SubmitClaim";
import ClaimDetail from "./pages/ClaimDetail";
import FuelClaimHome from "./pages/Home";
import "./App.css";

const { Content } = Layout;

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {isAuthenticated && <Navbar />}
        <Content>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<FuelClaimHome />} />
            <Route
              path="/dashboard"
              element={
                
                  <Dashboard />
               
              }
            />
            <Route
              path="/trip"
              element={
               
                  <CreateTrip />
                
              }
            />
            <Route
              path="/submit-claim"
              element={
              
                  <SubmitClaim />
                
              }
            />
            <Route
              path="/claim/:claimId"
              element={
                
                  <ClaimDetail />
                
              }
            />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
        
