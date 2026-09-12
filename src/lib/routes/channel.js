export const CHANNEL_PATH_PREFIX = "/channel";

export function isChannelPath(pathname) {
  return (
    pathname === CHANNEL_PATH_PREFIX ||
    pathname.startsWith(`${CHANNEL_PATH_PREFIX}/`)
  );
}

export const CHANNEL_BACKGROUND_CLASS = "channelBackground";
