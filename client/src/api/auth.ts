import type {
  LoginSchemaType,
  RegisterSchemaType,
} from "@/validations/authSchemas";

import { api } from "./axios";

export const RegisterUser = async (
  data: RegisterSchemaType
): Promise<boolean> => {
  try {
    await api.post("/auth/register", data);
    return true;
  } catch (err) {
    console.error("Registration error:", err);
    return false;
  }
};

export const LoginUser = async (data: LoginSchemaType) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};
