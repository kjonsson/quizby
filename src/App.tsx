import { useState } from "react";
import Game from "./Game";

const App = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isPlaying) {
    return (
      <div className="flex h-full  min-h-full w-full flex-col items-center justify-center bg-gray-800 px-4">
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
