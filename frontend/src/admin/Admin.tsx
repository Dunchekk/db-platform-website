import cls from "@/admin/Admin.module.css";
import A_Cursor from "@/components/atoms/A_Cursor/A_Cursor";
import AboutLayer from "@/layers/AboutLayer/AboutLayer";
import AdminLoginForm from "./AdminLoginForm/AdminLoginForm";

export default function Admin() {
  return (
    <div className={cls.wrapper}>
      <AboutLayer />
      <AdminLoginForm />
      <A_Cursor />
    </div>
  );
}
