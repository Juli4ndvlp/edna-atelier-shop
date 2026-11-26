"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[84px_1fr]">
      <div className="order-2 flex min-w-0 gap-2.5 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={`relative aspect-[3/4] w-18 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-20 ${i === active
              ? "border-volt shadow-md"
              : "border-white/70 opacity-75 hover:opacity-100"
              }`}
            aria-label={`Ver imagen ${i + 1} de ${alt}`}
          >
            <Image src={src} alt="" fill sizes="84px" className="object-cover" />
          </button>
        ))}
      </div>

      <div className="glass-card order-1 relative aspect-[3/4] overflow-hidden rounded-3xl p-1.5 md:order-2">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image
            src={images[active]}
            alt={alt}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover transition duration-500"
          />
        </div>
      </div>
    </div>
  );
}
