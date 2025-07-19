import { api } from "@/api/axios";
import { useAuth } from "@/context/auth";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>{user ? `Hi there ${user.username}!` : <p>Please Sign In</p>}</h2>
      <br />
      <br />
      <div className="flex justify-center gap-8">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard/docs">Dashboard</Link>
            <form onSubmit={handleSubmit(onSubmit)}>
              <button type="submit">Log Out</button>
            </form>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
