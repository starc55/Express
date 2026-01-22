import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Home from "./pages/HomePage";
import CompanyDetail from "./components/common/CompanyDetail";
import "./App.css";

function App(): React.ReactElement {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:id" element={<CompanyDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
