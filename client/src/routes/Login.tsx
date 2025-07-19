import { api } from "@/api/axios";
import { useAuth } from "@/context/auth";
import { LoginSchema, type LoginSchemaType } from "@/validations/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });

  const { login } = useAuth();

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const res = await api.post("/auth/login", data);
      const { accessToken, user } = res.data;
      login(accessToken, user);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
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
