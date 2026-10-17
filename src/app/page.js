import styles from "./page.module.css";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className={styles.fondoLogin}>
      <LoginForm />
    </main>
  );
}