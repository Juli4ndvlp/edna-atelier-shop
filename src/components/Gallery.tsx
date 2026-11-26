"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaItem } from "@/lib/media";

type Props = {
  images: string[];
  media?: MediaItem[];
  alt: string;
};

export function Gallery({ images, media, alt }: Props) {
  const items: MediaItem[] =
    media && media.length > 0
      ? media
      : images.map((src, index) => ({
          kind: "image",
          src,
          alt: index === 0 ? alt : `${alt} vista ${index + 1}`,
        }));

  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[84px_1fr]">
      <div className="order-2 flex min-w-0 gap-2.5 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
        {items.map((item, i) => {
          const thumbSrc = item.kind === "video" ? item.poster : item.src;
          return (
            <button
              key={`${item.kind}-${thumbSrc}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-current={i === active ? "true" : undefined}
              className={`relative aspect-[3/4] w-18 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-20 ${
                i === active
                  ? "border-ink ring-2 ring-volt"
                  : "border-ink/30 opacity-90 hover:opacity-100"
              }`}
              aria-label={
                item.kind === "video"
                  ? `Ver video ${i + 1} de ${alt}`
                  : `Ver imagen ${i + 1} de ${alt}`
              }
            >
              <Image src={thumbSrc} alt="" fill sizes="84px" className="object-cover" />
              {item.kind === "video" && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1.5 right-1.5 rounded bg-ink/90 px-1.5 py-0.5 text-[10px] font-bold text-volt"
                >
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="glass-card order-1 relative aspect-[3/4] overflow-hidden rounded-xl p-1.5 md:order-2">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-surface-muted">
          {current?.kind === "video" ? (
            <video
              key={current.src}
              controls
              playsInline
              muted
              loop
              preload="metadata"
              poster={current.poster}
              aria-label={current.alt ?? alt}
              className="h-full w-full object-cover"
            >
              {current.webmSrc && <source src={current.webmSrc} type="video/webm" />}
              <source src={current.src} type="video/mp4" />
            </video>
          ) : current ? (
            <Image
              src={current.src}
              alt={current.alt ?? alt}
              fill
              priority={active === 0}
              fetchPriority={active === 0 ? "high" : "auto"}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover transition duration-500"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
