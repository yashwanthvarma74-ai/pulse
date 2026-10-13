import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        Developed by{' '}
        <a href="https://github.com/yashwanthvarma74-ai" rel="noreferrer">
          Yashwanth Varma
        </a>
      </p>
    </footer>
  );
}
