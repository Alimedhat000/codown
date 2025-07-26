import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';

function Home() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Hi there {user?.username}!</h2>
      <br />
      <br />
      <div className="flex justify-center gap-8">
        <div>
          <Link to={paths.app.dashboard.getHref()}>Dashboard</Link>
          <form onSubmit={handleSubmit(onSubmit)}>
            <button type="submit">Log Out</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
