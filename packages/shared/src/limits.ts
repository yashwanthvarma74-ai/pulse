export const POST_MAX_LENGTH = 500;
export const MAX_MEDIA_PER_POST = 4;
export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_WIDTHS = [320, 640, 1280] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];

export const FEED_DEFAULT_PAGE_SIZE = 20;
export const FEED_MAX_PAGE_SIZE = 50;

export const COMMUNITY_NAME_MAX_LENGTH = 40;
export const COMMUNITY_DESCRIPTION_MAX_LENGTH = 200;
