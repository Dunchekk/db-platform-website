import M_Input from "@/components/molecules/M_Input/M_Input";
import A_Button from "@/components/atoms/A_Button/A_Button";
import cls from "@/admin/AdminLoginForm/AdminLoginForm.module.css";
import { check, login, logout } from "@/shared/api/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/auth.store";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";

const AdminLoginForm = () => {
  const [password, setPassword] = useState("");
  const [email, setLogin] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success" | "default">(
    "default"
  );
  const showToast = (
    message: string,
    type: "error" | "success" | "default"
  ) => {
    setToast(message);
    setToastType(type);
  };

  const setIsAuth = useAuth((state) => state.setIsAuth);
  const setToken = useAuth((state) => state.setToken);
  const navigate = useNavigate();

  useEffect(() => {
    check()
      .then(() => {
        setIsAuth(true);
        showToast("успешно авторизованы", "success");
      })
      .catch((e) => {
        setIsAuth(false);
        showToast(`${"требуется авторизация: " + e.message}`, "error");
      });
  }, [setIsAuth]);

  const isAuth = useAuth((state) => state.isAuth);

  const loginIn = async () => {
    try {
      const response = await login(email.trim(), password.trim());
      console.log(response);

      setToken(response.token);
      setIsAuth(true);
      showToast("успешно авторизованы", "success");
      setPassword("");
      setLogin("");
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        showToast(`${"требуется авторизация: " + err.message}`, "error");
      }
    }
  };

  const loginOut = async () => {
    setToken(null);
    setIsAuth(false);
    logout();
    showToast("успешно разлогинились", "success");
    setPassword("");
    setLogin("");
    navigate("/");
  };

  return (
    <div className={cls.admin}>
      <form>
        <M_Input
          placeholder="логин*"
          value={email}
          required
          type="email"
          onChange={(e) => setLogin(e.target.value)}
          className={cls.input}
        />
        <M_Input
          placeholder="пароль*"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className={cls.input}
        />
        <div className={cls.buttons}>
          <A_Button disabled={isAuth} type="button" onClick={() => loginIn()}>
            войти
          </A_Button>
          <A_Button disabled={!isAuth} type="button" onClick={() => loginOut()}>
            выйти
          </A_Button>
        </div>
      </form>
      {toast ? (
        <A_Toast
          type={toastType}
          message={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
};

export default AdminLoginForm;
