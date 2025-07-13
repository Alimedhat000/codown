import { Link } from "react-router";

function Home() {
  return (
    <div>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;
