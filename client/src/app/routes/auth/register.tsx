import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { RegisterUser } from '@/api/auth';
import {
  RegisterSchema,
  type RegisterSchemaType,
} from '@/validations/authSchemas';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({ resolver: zodResolver(RegisterSchema) });

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterSchemaType) => {
    const success = await RegisterUser(data);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      <p>{errors.email?.message}</p>

      <input {...register('username')} placeholder="Username" />
      <p>{errors.username?.message}</p>

      <input {...register('password')} type="password" placeholder="Password" />
      <p>{errors.password?.message}</p>

      <input {...register('fullName')} placeholder="Full Name" />
      <button type="submit">Register</button>
    </form>
  );
}
