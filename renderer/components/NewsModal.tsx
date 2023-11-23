import React from "react";

export const NewsModal = ({ show, setShow, news }) => {
  console.log("🚀 => file: NewsModal.tsx:4 => news:", news);

  return (
    <dialog className={`modal ${show && "modal-open"}`}>
      <div className="modal-box flex flex-col text-center items-center gap-4">
        <button onClick={() => setShow(false)}>Don't show again</button>
        <button
          className="absolute top-2 right-4 btn btn-circle"
          onClick={() => setShow(false)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24">
            <rect
              x="0"
              y="0"
              width="24"
              height="24"
              fill="none"
              stroke="none"
            />
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.5"
              d="m8.464 15.535l7.072-7.07m-7.072 0l7.072 7.07"
            />
          </svg>
        </button>

        <div className="h-80">
          <h2 className="text-2xl font-bold text-center">{news.title}</h2>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShow(false)}>close</button>
      </form>
    </dialog>
  );
};
