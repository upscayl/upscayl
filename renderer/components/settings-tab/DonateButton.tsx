import React from "react";
export function DonateButton({}) {
  return (
    <div className="mt-auto flex flex-col items-center justify-center gap-2 text-sm font-medium">
      <p>If you like what we do :)</p>
      <a href="https://buymeacoffee.com/fossisthefuture" target="_blank">
        <button className="btn-primary btn">Donate</button>
      </a>
    </div>
  );
}
