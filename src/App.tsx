import { useState } from "react";
import Game from "./Game";

const App = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isPlaying) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div>TODO SET SETTINGS</div>
        <button
          onClick={() => {
            setIsPlaying(true);
          }}
        >
          Play game?
        </button>
      </div>
    );
  }

  return <Game />;
};

export default App;
