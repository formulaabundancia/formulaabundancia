"use client";

import { useState } from "react";
import Image from "next/image";

export function AppLogo({ size = 28 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        ⏳
      </span>
    );
  }

  return (
    <Image
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
