declare global {
  interface Window {
    CONFIG?: Record<string, string>;
  }
}

export function getAppUrl(): string {
  //let appUrl = window.CONFIG?.APP_URL || process.env.APP_URL;

 // if (import.meta.env.DEV) {
 //   return appUrl || "http://localhost:3000";
  //}

  return `${window.location.protocol}//${window.location.host}`;
}

export function getBackendUrl(): string {
  return getAppUrl() + "/api";
}

export function getCollaborationUrl(): string {
  const COLLAB_PATH = "/collab";
  const url = process.env.APP_URL || getAppUrl();

  const wsProtocol = url.startsWith("https") ? "wss" : "ws";
  return `${wsProtocol}://${url.split("://")[1]}${COLLAB_PATH}`;
}

export function getAvatarUrl(avatarUrl: string) {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl?.startsWith("http")) {
    return avatarUrl;
  }

  return getBackendUrl() + "/attachments/img/avatar/" + avatarUrl;
}

export function getSpaceUrl(spaceSlug: string) {
  return "/s/" + spaceSlug;
}

export function getFileUrl(src: string) {
  return src?.startsWith("/files/") ? getBackendUrl() + src : src;
}
