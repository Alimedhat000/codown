import { useNavigate } from 'react-router';

import { Head } from '@/components/ui/seo';
import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate(paths.app.home.getHref());
    } else {
      navigate(paths.auth.login.getHref());
    }
  };

  return (
    <>
      <Head description="Welcome to Codown" />
      <p>Showcasing Best Way to Write MarkDown</p>
      <button
        onClick={handleStart}
        className=" bg-green-400 text-white p-2 rounded hover:bg-green-500 transition-colors"
      >
        Get Started Now
      </button>
    </>
  );
}
