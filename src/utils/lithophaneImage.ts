// Client-side photo handling for the /lithophane request form.
// The photo is downscaled in the browser before upload: 2000px on the long
// edge is more than a lithophane needs, and it keeps uploads small on mobile data.

export const MAX_EDGE = 2000;
export const JPEG_QUALITY = 0.85;
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
export const MESSAGE_MAX = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

/** Scale (width, height) down so the longest edge is at most `max`. Never upscales. */
export function fitWithin(width: number, height: number, max = MAX_EDGE) {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** 4404019 -> "4.2 MB", 696320 -> "680 KB" */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error message for files we refuse before even trying, or null. */
export function validateImageFile(file: { type: string; size: number }) {
  // Some phones report HEIC with an empty type; let decode decide for those
  if (file.type && !file.type.startsWith("image/")) {
    return "That file isn't an image. Please choose a photo.";
  }
  if (file.size > MAX_INPUT_BYTES) {
    return `That photo is ${formatBytes(file.size)}. Please choose one under 25 MB.`;
  }
  return null;
}

type Decoded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function decode(file: File): Promise<Decoded> {
  // createImageBitmap applies EXIF rotation, so portrait phone photos stay upright
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Fall through to <img>, which some browsers decode more formats with
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => {},
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Downscale to MAX_EDGE and re-encode as JPEG. Throws if the browser can't
 * read the image (e.g. HEIC on desktop Chrome).
 */
export async function compressImage(file: File): Promise<Blob> {
  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new Error("We couldn't read that photo. Please try a JPG or PNG.");
  }

  try {
    const { width, height } = fitWithin(decoded.width, decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    // JPEG has no transparency; without this, transparent PNG areas turn black
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("encode failed");

    // A small JPEG can come out bigger after re-encoding; keep the original then
    const alreadySmallJpeg =
      file.type === "image/jpeg" &&
      decoded.width <= MAX_EDGE &&
      decoded.height <= MAX_EDGE &&
      file.size <= blob.size;
    return alreadySmallJpeg ? file : blob;
  } catch {
    throw new Error(
      "We couldn't process that photo. Please try a different one.",
    );
  } finally {
    decoded.close();
  }
}
