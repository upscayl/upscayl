import Image from "next/image";
import Link from "next/link";

export const UpscaylCloudModal = ({ show, setShow }) => {
  return (
    <dialog className={`modal ${show && "modal-open"}`}>
      <div className="modal-box flex flex-col text-center items-center gap-4">
        <p className="badge badge-neutral text-xs">Coming soon!</p>
        <p className="text-2xl font-semibold">Introducing Upscayl Cloud!</p>
        <p className="w-9/12 font-medium text-lg">
          No more hardware issues, quality compromises or long loading times!
        </p>

        <div className="flex flex-col gap-2 text-start">
          <p>🌐 Upscayl anywhere, anytime, any device</p>
          <p>☁️ No Graphics Card or hardware required</p>
          <p>👩 Face Enhancement</p>
          <p>🦋 10+ models to choose from</p>
          <p>🏎 5x faster than Upscayl Desktop</p>
          <p>🎞 Video Upscaling</p>
          <p>💰 Commercial Usage</p>
          <p>😴 Upscayl while you sleep</p>
        </div>

        <Link href="https://www.upscayl.org/join" target="_blank">
          <button className="bg-success text-success-content rounded-2xl px-4 py-2">
            Join the waitlist
          </button>
        </Link>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShow(false)}>close</button>
      </form>
    </dialog>
  );
};
