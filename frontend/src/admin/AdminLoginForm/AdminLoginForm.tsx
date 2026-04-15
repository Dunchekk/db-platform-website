import M_Input from "@/components/M_Input/M_Input";
import Q_Button from "@/components/Q_Button/Q_Button";
import cls from "@/admin/AdminLoginForm/ AdminLoginForm.module.css";
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
      <Q_Button onClick={() => loginIn()}>войти</Q_Button>
      <Q_Button onClick={() => loginOut()}>выйти</Q_Button>
    </div>
  );
};

export default AdminLoginForm;
