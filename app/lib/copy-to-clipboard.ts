import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

export async function copyToClipboard(text: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    if (typeof document !== "undefined") {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return;
    }
  }
  await Clipboard.setStringAsync(text);
}
