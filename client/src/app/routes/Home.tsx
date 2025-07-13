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
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Loading...</p>
      )}

      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;
