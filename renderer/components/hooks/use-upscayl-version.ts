import { useState, useEffect } from "react";

const useUpscaylVersion = () => {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const upscaylVersion = navigator?.userAgent?.match(
      /Upscayl\/([\d\.]+\d+)/,
    )?.[1];
    setVersion(upscaylVersion);
  }, []);

  return version;
};

export default useUpscaylVersion;
