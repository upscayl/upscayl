import { useState } from "react";
import { waitlistCollection } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const nameRegex = /^[A-Za-z\s.'-]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const UpscaylCloudModal = ({ show, setShow }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <dialog className={`modal ${show && "modal-open"}`}>
      <div className="modal-box flex flex-col text-center items-center gap-4">
        <p className="badge badge-neutral text-xs">Coming soon!</p>
        <p className="text-2xl font-semibold">Introducing Upscayl Cloud!</p>
        <p className="w-9/12 font-medium text-lg">
          No more errors, hardware issues, quality compromises or long loading
          times!
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

        <form
          className="flex flex-col items-center gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              name &&
              email &&
              nameRegex.test(name) &&
              emailRegex.test(email)
            ) {
              try {
                await setDoc(doc(waitlistCollection, email), {
                  name,
                  email,
                });
              } catch (error) {
                alert("Error joining the waitlist. Please try again...");
                return;
              }
              setName("");
              setEmail("");
              alert(
                "Thank you for joining the waitlist! We will notify you when Upscayl Cloud is ready for you."
              );
            } else {
              alert("Please fill in all the fields correctly.");
            }
          }}>
          <div className="gap-2 flex">
            <input
              type="text"
              className="input input-bordered"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className="input input-bordered"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-success text-success-content rounded-2xl px-4 py-2">
            Join the waitlist
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShow(false)}>close</button>
      </form>
    </dialog>
  );
};
