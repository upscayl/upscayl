import { useState, useEffect, useRef } from "react";

const Home = () => {
  useEffect(() => {
    // send(command, payload)
    window.electron.send("sendMessage", { message: "Hello!" });
  }, []);
  return (
    <div className="h-screen w-screen bg-neutral-900">
      <div>
        <input />
      </div>
    </div>
  );
};

export default Home;
