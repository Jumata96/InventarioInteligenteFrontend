import { api } from "./client";

export async function authLogin(payload) {
  const { data } = await api.post("/api/Auth/login", payload);
  console.log({data_authLogin: data}); 
  return data; // espera { token: "..." }
}
