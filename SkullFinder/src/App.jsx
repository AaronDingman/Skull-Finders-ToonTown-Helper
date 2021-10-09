import styles from "./App.module.css";
import BoardHtml from "./components/board.jsx"

function App() {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div> 💀 SKULL FINDER 💀</div>
        <BoardHtml/>
      </header>
    </div>
  );
}

export default App;
