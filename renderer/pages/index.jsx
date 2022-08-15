import { useState, useEffect, useRef } from "react";
import { checkBox } from "../public/checkbox";
import { useTheme } from "next-themes";

const Home = () => {
  const { theme, setTheme } = useTheme();

  const programRef = useRef(null);
  const iconRef = useRef(null);

  const [loadedProgram, setLoadedProgram] = useState(false);
  const [loadedIcon, setLoadedIcon] = useState(false);
  const [customExec, setCustomExec] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [error, setError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [version, setVersion] = useState("");
  const [input, setInput] = useState({
    name: "",
    comment: "",
    exec: "",
    icon: "",
    terminal: false,
  });

  console.log(darkMode);

  // Fetch app version
  useEffect(() => {
    setVersion(navigator.userAgent.match(/DeskCut\/([\d\.]+\d+)/)[1]);
  }, []);

  // Fetching update
  useEffect(async () => {
    const updateJson = await fetch(
      "https://nayamamarshe.github.io/api/deskcut.json",
      {
        method: "GET",
      }
    ).then((res) => res.json());
    if (updateJson) {
      if (
        updateJson.version >
        navigator.userAgent.match(/DeskCut\/([\d\.]+\d+)/)[1]
      ) {
        const confirmText = "Update available! Download now?";
        if (confirm(confirmText) == true) {
          window.open(
            "https://github.com/NayamAmarshe/DeskCut/releases/",
            "_blank"
          );
        }
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, exec, icon } = input;
    const isValid = Object.values({ name, exec, icon }).every(Boolean);

    if (!isValid) {
      alert("Please enter the values correctly");
    } else {
      window.electron.message(input);
      alert("Shortcut Successfully Created!");
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-gray-800">
      {/* Heading */}
      <h1 className="pt-5 text-2xl font-bold text-slate-600 dark:text-slate-100">
        DeskCut
      </h1>
      <p className="pb-2 text-sm leading-tight text-slate-400">
        Shortcut Creator
      </p>

      <div className="animate absolute top-2 right-2 hover:scale-125 ">
        <button
          className="outline-none"
          onClick={() => {
            setDarkMode(!darkMode);
            setTheme(darkMode ? "dark" : "light");
            console.log(theme);
          }}
        >
          {darkMode ? "🌞" : "🌚"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex w-96 flex-col gap-5 p-5">
        {/* Text Inputs */}
        <input
          type="text"
          name="name"
          placeholder="App Name"
          value={input.name}
          onChange={(e) =>
            setInput({
              ...input,
              name: e.target.value.replace(/[^A-Z0-9]+/gi, " "),
            })
          }
        />
        <input
          type="text"
          name="comment"
          placeholder="App Description"
          value={input.comment}
          onChange={(e) => setInput({ ...input, comment: e.target.value })}
        />

        {/* Terminal Checkbox */}
        <button
          type="button"
          className={`${terminal ? "checkbox-on" : "checkbox-off"} checkbox-bg`}
          onClick={() => {
            setTerminal(!terminal);
            setInput({ ...input, terminal: !input.terminal });
          }}
        >
          <p className="flex-grow">Run in Terminal</p>
          {!terminal ? (
            <svg
              className="align- text-xl"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7,5C5.897,5,5,5.897,5,7v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V7c0-1.103-0.897-2-2-2H7z M7,17V7h10l0.002,10H7z"></path>
            </svg>
          ) : (
            <svg
              className="text-xl "
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 9H15V15H9z"></path>
              <path d="M19,17V7c0-1.103-0.897-2-2-2H7C5.897,5,5,5.897,5,7v10c0,1.103,0.897,2,2,2h10C18.103,19,19,18.103,19,17z M7,7h10 l0.002,10H7V7z"></path>
            </svg>
          )}
        </button>

        {/* Custom Exec Checkbox */}
        <button
          type="button"
          className={`${
            customExec ? "checkbox-on" : "checkbox-off"
          } checkbox-bg animate`}
          onClick={() => setCustomExec(!customExec)}
        >
          <p className="flex-grow">Use Custom Icon & Command</p>

          {!customExec ? (
            <div>
              <svg
                className="text-xl"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7,5C5.897,5,5,5.897,5,7v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V7c0-1.103-0.897-2-2-2H7z M7,17V7h10l0.002,10H7z"></path>
              </svg>
            </div>
          ) : (
            <div>
              <svg
                className="text-xl"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 9H15V15H9z"></path>
                <path d="M19,17V7c0-1.103-0.897-2-2-2H7C5.897,5,5,5.897,5,7v10c0,1.103,0.897,2,2,2h10C18.103,19,19,18.103,19,17z M7,7h10 l0.002,10H7V7z"></path>
              </svg>
            </div>
          )}
        </button>

        {/* Choose File Buttons */}
        <div className="animate flex flex-col gap-5">
          {/* Custom Exec Input */}
          {customExec ? (
            <input
              type="text"
              name="exec"
              placeholder="Exec Command"
              value={input.exec}
              onChange={(e) => setInput({ ...input, exec: e.target.value })}
            />
          ) : (
            <button
              type="button"
              onClick={() => programRef.current.click()}
              className="picker flex flex-col items-center justify-center"
            >
              {/* Program Picker */}
              <p>Choose Program</p>
              {loadedProgram && (
                <p className="mt-2 w-80 truncate rounded-lg bg-red-300 p-1 text-slate-700">
                  {programRef?.current?.files[0]?.name}
                </p>
              )}
            </button>
          )}
          {/* Icon Button */}
          {customExec ? (
            <input
              type="text"
              name="Icon"
              placeholder="Icon Image Path"
              value={input.icon}
              onChange={(e) => setInput({ ...input, icon: e.target.value })}
            />
          ) : (
            <button
              type="button"
              onClick={() => iconRef.current.click()}
              className="picker flex flex-col items-center justify-center"
            >
              {/* Program Picker */}
              <p>Choose Icon</p>
              {loadedIcon && (
                <p className="mt-2 w-80 truncate rounded-lg bg-red-300 p-1 text-slate-700">
                  {iconRef?.current?.files[0]?.name}
                </p>
              )}
            </button>
          )}
        </div>

        {/* File Picker */}
        <input
          type="file"
          name="programFile"
          ref={programRef}
          className="hidden"
          onChange={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(programRef.current);
            setInput({ ...input, exec: programRef?.current?.files[0]?.path });
            if (programRef?.current?.files[0]?.path) {
              setLoadedProgram(true);
            } else {
              setLoadedProgram(false);
            }
          }}
        />
        <input
          type="file"
          name="iconFile"
          ref={iconRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(iconRef.current);
            setInput({ ...input, icon: iconRef?.current?.files[0]?.path });
            if (iconRef?.current?.files[0]?.path) {
              setLoadedIcon(true);
            } else {
              setLoadedIcon(false);
            }
          }}
        />

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>

      <p className="absolute bottom-0 text-slate-200 dark:text-slate-700">
        v{version}
      </p>
    </div>
  );
};

export default Home;
