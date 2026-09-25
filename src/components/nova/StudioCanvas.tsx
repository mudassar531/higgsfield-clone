"use client";

import NovaImage from "@/components/nova/NovaImage";
import { frameMeta } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

export default function StudioCanvas({
  image,
  loading,
}: {
  image: GenerationLike | null;
  loading: boolean;
}) {
  const frame = frameMeta(image?.aspect_ratio ?? "1:1");

  return (
    <div className="canvas-stage">
      <div className="flex h-full w-full items-center justify-center">
        {image ? (
          <div className={`relative flex max-h-full max-w-full items-center justify-center transition-opacity duration-150 ${loading ? "opacity-60" : "opacity-100"}`}>
            {loading && <div className="nova-scan" aria-hidden />}
            <NovaImage
              key={image.id}
              src={image.image_url}
              alt={image.prompt}
              width={frame.width}
              height={frame.height}
              sizes="(min-width: 1100px) 60vw, 100vw"
              priority
              className="nova-in max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-muted">No image yet.</p>
        )}
      </div>
    </div>
  );
}
