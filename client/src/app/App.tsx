import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Fallback Route */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
