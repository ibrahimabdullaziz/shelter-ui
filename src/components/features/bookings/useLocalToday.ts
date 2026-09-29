import { useEffect, useState } from "react";
import { getLocalDateToday } from "./bookingDateUtils";

export function useLocalToday() {
  const [today, setToday] = useState(getLocalDateToday);
  const refreshToday = () => setToday(getLocalDateToday());

  useEffect(() => {
    const refresh = () => setToday(getLocalDateToday());
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const intervalId = window.setInterval(refresh, 60_000);

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return { today, refreshToday };
}
