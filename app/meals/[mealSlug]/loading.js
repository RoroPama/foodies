// components/Loading.js
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loading}>
        <h1>Chargement</h1>
        <p>
          Veuillez patienter<span className={styles.dots}></span>
        </p>
      </div>
    </div>
  );
}
