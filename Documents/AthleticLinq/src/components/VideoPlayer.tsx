"use client";

import { useState } from "react";

interface VideoPlayerProps {
  url: string;
  poster?: string;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return m?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}

// MediaError codes
// 1 = MEDIA_ERR_ABORTED    – user aborted
// 2 = MEDIA_ERR_NETWORK    – network error (transient, don't show permanent error)
// 3 = MEDIA_ERR_DECODE     – codec can't decode
// 4 = MEDIA_ERR_SRC_NOT_SUPPORTED – format not supported

export default function VideoPlayer({ url, poster }: VideoPlayerProps) {
  const [videoError, setVideoError] = useState(false);
  const [networkRetry, setNetworkRetry] = useState(false);

  if (!url) return null;

  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Athlete profile video"
      />
    );
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?badge=0`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Athlete profile video"
      />
    );
  }

  // Direct video file — uploaded to Supabase Storage
  if (videoError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/90 px-6 text-center">
        <svg className="w-10 h-10 text-earth/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-white/80 text-sm font-medium">Video format not supported</p>
        <p className="text-white/50 text-xs leading-relaxed">
          Try removing this video and uploading a fresh recording — the new upload will be saved in the correct format automatically.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-semibold text-coral border border-coral/40 px-4 py-2 rounded-full hover:bg-coral hover:text-white transition-colors"
        >
          Open video file ↗
        </a>
      </div>
    );
  }

  if (networkRetry) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/90 px-6 text-center">
        <p className="text-white/70 text-sm">Having trouble loading the video</p>
        <button
          onClick={() => setNetworkRetry(false)}
          className="text-xs font-semibold text-coral border border-coral/40 px-4 py-2 rounded-full hover:bg-coral hover:text-white transition-colors"
        >
          Tap to retry
        </button>
      </div>
    );
  }

  function handleError(e: React.SyntheticEvent<HTMLVideoElement>) {
    const code = (e.currentTarget.error?.code) ?? 0;
    if (code === 3 || code === 4) {
      // Genuine decode/format failure — show permanent error
      setVideoError(true);
    } else if (code === 2) {
      // Network error — offer a retry instead of a permanent error message
      setNetworkRetry(true);
    }
    // code 1 = user aborted, code 0 = unknown — ignore silently
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      key={url}
      src={url}
      controls
      playsInline
      preload="metadata"
      poster={poster || undefined}
      className="absolute inset-0 w-full h-full object-cover"
      onError={handleError}
    />
  );
}
