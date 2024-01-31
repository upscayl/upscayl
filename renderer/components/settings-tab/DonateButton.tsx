import React from "react";
export function DonateButton({}) {
  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <p>If you like what we do :)</p>
      <a
        href="https://buymeacoffee.com/fossisthefuture"
        target="_blank"
        className="btn-primary btn">
        DONATE
      </a>
    </div>
  );
}
