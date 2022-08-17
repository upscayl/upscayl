import { useState, useEffect, useRef } from "react";

const Home = () => {
  const [imagePath, SetImagePath] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // send(command, payload)
    window.electron.send("sendMessage", { message: "Hello!" });
    setLoaded(true);

    window.electron.on("output", (_, data) => {
      if (data.length > 0 && data.length < 10) console.log(data);
    });

    window.electron.on("done", (_, data) => {
      console.log("DONE!");
    });
  }, []);

  const imageHandler = async () => {
    var path = await window.electron.send("open");
    SetImagePath(path);
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-neutral-900">
      <div className="flex h-screen w-96 flex-col bg-neutral-800 p-5">
        <h1 className="text-3xl font-bold text-neutral-50">Upscayl</h1>
        <div className="mt-10">
          <p className="mb-2 font-medium text-neutral-100">Step 1</p>
          <button className="rounded-lg bg-sky-400 p-3" onClick={imageHandler}>
            Select Image
          </button>
        </div>
        <div className="mt-10">
          <p className="mb-2 font-medium text-neutral-100">Step 2</p>
          <p className="mb-1 text-neutral-300">Select Scale Factor:</p>
          <div className="flex flex-row gap-2">
            <button className="rounded-lg bg-red-400 p-3">2x</button>
            <button className="rounded-lg bg-red-400 p-3">4x</button>
            <button className="rounded-lg bg-red-400 p-3">6x</button>
          </div>
        </div>
        <div className="mt-10">
          <p className="mb-2 font-medium text-neutral-100">Step 3</p>
          <button className="rounded-lg bg-violet-400 p-3">
            Set Output Folder
          </button>
        </div>
        <div className="mt-10">
          <p className="mb-2 font-medium text-neutral-100">Step 4</p>
          <button className="rounded-lg bg-green-400 p-3">Upscayl</button>
        </div>
      </div>
      <div className="flex h-screen w-full flex-col items-center justify-center p-5">
        <p className="text-lg font-medium text-neutral-400">
          Select an Image to Upscale
        </p>
      </div>
    </div>
  );
};

export default Home;
