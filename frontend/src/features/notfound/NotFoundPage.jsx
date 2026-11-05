import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import "./NotFoundPage.css";

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];



const INITIAL_BOARD = [
  null, null, null,
  null, "O", null,
  null, null, null,
];

function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) {
    return "draw";
  }
  return null;
}


function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);
  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let move = null;
  const boardCopy = [...board];

  for (let i = 0; i < 9; i++) {
    if (boardCopy[i] === null) {
      boardCopy[i] = "O";
      const score = minimax(boardCopy, 0, false);
      boardCopy[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

export function NotFoundPage() {
  const { setActivePage } = useAppContext();

  const [board, setBoard] = useState(Array(9).fill(null));
  const [score, setScore] = useState({ ai: 0, player: 0 });
  const [winner, setWinner] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleCellClick = (index) => {
    if (board[index] || winner || isAiThinking) return;


    const newBoard = [...board];
    newBoard[index] = "X";

    const outcome = checkWinner(newBoard);
    if (outcome) {
      setBoard(newBoard);
      setWinner(outcome);
      if (outcome === "X") {
        setScore((s) => ({ ...s, player: s.player + 1 }));
      }
      return;
    }

    setBoard(newBoard);
    setIsAiThinking(true);


    setTimeout(() => {
      setBoard((currentBoard) => {
        const aiIndex = getBestMove(currentBoard);
        if (aiIndex === undefined || aiIndex === null) {
          setIsAiThinking(false);
          return currentBoard;
        }

        const nextBoard = [...currentBoard];
        nextBoard[aiIndex] = "O";
        const aiOutcome = checkWinner(nextBoard);
        if (aiOutcome) {
          setWinner(aiOutcome);
          if (aiOutcome === "O") {
            setScore((s) => ({ ...s, ai: s.ai + 1 }));
          }
        }
        setIsAiThinking(false);
        return nextBoard;
      });
    }, 280);
  };

  const handleResetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsAiThinking(false);
  };

  return (
    <main className="not-found-container" aria-label="404 Page Not Found with Tic Tac Toe Game">
      <div className="not-found-heading-block">
        <h1 className="not-found-title">
          You lost the page.
          <br />
          You'll lose this game, too.
        </h1>
        <div className="not-found-scoreboard">
          <span>
            OPPONENT <strong>{score.ai}</strong>
          </span>
          ·
          <span>
            YOU <strong>{score.player}</strong>
          </span>
        </div>
      </div>


      <div className="not-found-stage">
        <div className="not-found-numeral" aria-hidden="true">
          4
        </div>

        <div className="ttt-grid" role="grid" aria-label="Tic Tac Toe 3x3 board">
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={`ttt-cell ${idx === 4 && cell === null ? "ttt-cell-center" : ""}`}
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell || winner || isAiThinking)}
              aria-label={`Cell ${idx + 1}, ${cell ? `filled with ${cell}` : "empty"}`}
              type="button"
            >
              {cell === "X" && <span className="ttt-mark-x">✕</span>}
              {cell === "O" && <span className="ttt-mark-o">○</span>}
              {cell === null && idx === 4 && (
                <span className="ttt-placeholder-symbol" title="DevRhythm Code & Music">
                  &lt;/&gt;
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="not-found-numeral" aria-hidden="true">
          4
        </div>
      </div>


      <div className={`ttt-status-text ${winner ? "winner" : ""}`}>
        {winner === "X" && "Impressive. You won this round!"}
        {winner === "O" && "Told you so. Better luck next game."}
        {winner === "draw" && "A tie! No one loses this time."}
        {!winner && (isAiThinking ? "Opponent thinking..." : "Your turn (You: ✕)")}
      </div>


      <div className="not-found-actions">
        <button className="bracket-btn" onClick={handleResetGame} type="button">
          [ LOSE AGAIN ]
        </button>
        <button
          className="bracket-btn"
          onClick={() => setActivePage("overview")}
          type="button"
        >
          [ TAKE ME HOME ]
        </button>
      </div>
    </main>
  );
}
