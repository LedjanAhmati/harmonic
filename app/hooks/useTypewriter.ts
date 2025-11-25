import { useState, useEffect } from "react";

export function useTypewriter(fullText: string, speedMs: number = 15): string {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!fullText) {
      setDisplayedText("");
      return;
    }

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [fullText, speedMs]);

  return displayedText;
}
