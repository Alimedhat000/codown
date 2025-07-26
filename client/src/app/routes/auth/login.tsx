import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import { LoginSchema, type LoginSchemaType } from '@/lib/auth';
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });

  const { login } = useAuth();

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const res = await api.post('/auth/login', data);
      const { accessToken, user } = res.data;
      login(accessToken, user);
      navigate(`${redirectTo ? `${redirectTo}` : paths.app.home.getHref()}`, {
        replace: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      <p>{errors.email?.message}</p>

      <input {...register('password')} type="password" placeholder="Password" />
      <p>{errors.password?.message}</p>
      <button type="submit">Login</button>
    </form>
  );
}
