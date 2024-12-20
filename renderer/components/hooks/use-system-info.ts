import { useEffect, useState } from "react";

const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<Awaited<
    ReturnType<typeof window.electron.getSystemInfo>
  > | null>(null);

  useEffect(() => {
    const getSystemInfo = async () => {
      const systemInfo = await window.electron.getSystemInfo();
      setSystemInfo(systemInfo);
    };
    getSystemInfo();
  }, []);
  return { systemInfo };
};

export default useSystemInfo;
