import cls from "@/admin/Admin.module.css";
import Q_Cursor from "@/components/Q_Cursor/Q_Cursor";
import AboutLayer from "@/layers/AboutLayer/AboutLayer";
import AdminLoginForm from "./AdminLoginForm/AdminLoginForm";

export default function Admin() {
  return (
    <div className={cls.wrapper}>
      <AboutLayer />
      <AdminLoginForm />
      <Q_Cursor />
    </div>
  );
}
