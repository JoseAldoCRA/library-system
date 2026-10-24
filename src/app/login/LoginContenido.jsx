import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../page.module.css";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className={styles.fondoLogin}>
      <Link href="/" className={styles.volverCatalogo}>
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      <LoginForm />
    </main>
  );
}