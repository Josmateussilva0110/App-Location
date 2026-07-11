import { useEffect, useState } from "react";

import { getDeviceId } from "@/services/deviceId";

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getDeviceId().then((id) => {
      if (mounted) setDeviceId(id);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return deviceId;
}
