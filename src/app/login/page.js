
import styles from "../page.module.css";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className={styles.fondoLogin}>
      <LoginForm />
    </main>
  );
}
