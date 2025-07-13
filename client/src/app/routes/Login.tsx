import { LoginUser } from "@/api/auth";
import { LoginSchema, type LoginSchemaType } from "@/validations/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = (data: LoginSchemaType) => {
    LoginUser(data);
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} placeholder="Email" />
      <p>{errors.email?.message}</p>

      <input {...register("password")} type="password" placeholder="Password" />
      <p>{errors.password?.message}</p>
      <button type="submit">Login</button>
    </form>
  );
}
