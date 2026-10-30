import styles from "./StatusMessage.module.css";

export function StatusMessage({ children }) {
  return (
    <main>
      <section className={styles.section}>
        <h1 className="thumb-title">{children}</h1>
      </section>
    </main>
  );
}

export function PreparingMessage() {
  return <StatusMessage>준비 중 입니다.</StatusMessage>;
}
