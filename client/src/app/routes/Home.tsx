import { useEffect, useState } from "react";
import { api } from "@/api/axios";
import { Link } from "react-router"; // Make sure this is react-router-dom, not 'react-router'

function Home() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const findMe = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user");
      }
    };

    findMe();
  }, []);

  return (
    <div>
      <h2>I am:</h2>
      {user ? (
        <pre className="text-green-300">{JSON.stringify(user, null, 2)}</pre>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Loading...</p>
      )}
      <br />
      <br />
      <div className="flex justify-center gap-8">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard/docs">Dashboard</Link>
      </div>
    </div>
  );
}

export default Home;
