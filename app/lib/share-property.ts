import { Linking, Platform, Share } from "react-native";
import { copyToClipboard } from "./copy-to-clipboard";
import { getSiteUrl, propertyDetailPath } from "../constants/seo";

/** Builds the absolute, shareable URL for a property detail page. */
export function getPropertyShareUrl(id: string | number): string {
  const base = getSiteUrl();
  const path = propertyDetailPath(id);
  if (base) return `${base}${path}`;
  // No configured site URL — fall back to the current browser URL on web.
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.href) {
    return window.location.href;
  }
  return path;
}

export function shareToFacebook(url: string): void {
  Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

export async function shareToMessenger(url: string): Promise<void> {
  if (Platform.OS !== "web") {
    const deepLink = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
    const canOpen = await Linking.canOpenURL(deepLink).catch(() => false);
    if (canOpen) {
      Linking.openURL(deepLink);
      return;
    }
  }
  // Web (Messenger send dialog needs an app id we don't have) and devices
  // without the Messenger app fall back to the Facebook share dialog.
  Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

/**
 * Instagram has no public web intent for sharing an arbitrary link, so we copy
 * the URL to the clipboard and open Instagram for the user to paste it.
 */
export async function shareToInstagram(url: string): Promise<void> {
  await copyToClipboard(url);
  const target = Platform.OS === "web" ? "https://www.instagram.com/" : "instagram://app";
  const canOpen = Platform.OS === "web" ? true : await Linking.canOpenURL(target).catch(() => false);
  Linking.openURL(canOpen ? target : "https://www.instagram.com/");
}

/** Opens the OS-native share sheet (mobile only). Returns false if unavailable. */
export async function shareViaNative(url: string, title?: string): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    await Share.share({ message: title ? `${title}\n${url}` : url, url, title });
    return true;
  } catch {
    return false;
  }
}
