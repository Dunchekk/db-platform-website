import M_Input from "@/components/molecules/M_Input/M_Input";
import A_Button from "@/components/atoms/A_Button/A_Button";
import cls from "@/admin/AdminLoginForm/AdminLoginForm.module.css";
import { login, logout } from "@/shared/api/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/auth.store";

const AdminLoginForm = () => {
  const [password, setPassword] = useState("");
  const [email, setLogin] = useState("");
  const setIsAuth = useAuth((state) => state.setIsAuth);
  const setToken = useAuth((state) => state.setToken);
  const navigate = useNavigate();

  const loginIn = async () => {
    try {
      const response = await login(email, password);
      console.log(response);

      setToken(response.token);
      setIsAuth(true);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const loginOut = async () => {
    setToken(null);
    setIsAuth(false);
    logout();
    navigate("/");
  };

  return (
    <div className={cls.admin}>
      <M_Input
        placeholder="логин"
        value={email}
        type="email"
        onChange={(e) => setLogin(e.target.value)}
        className={cls.input}
      />
      <M_Input
        placeholder="пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className={cls.input}
      />
      <A_Button onClick={() => loginIn()}>войти</A_Button>
      <A_Button onClick={() => loginOut()}>выйти</A_Button>
    </div>
  );
};

export default AdminLoginForm;
