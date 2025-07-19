import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Dashboard from "./routes/Dashboard";
import DocumentPage from "./routes/DocumentPages";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/docs" element={<Dashboard />} />
          <Route path="/dashboard/docs/:id" element={<DocumentPage />} />

          {/* Fallback Route */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
