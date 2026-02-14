export type StickerAsset = {
  id: string;
  imageSrc: string;
  alt: string;
  phrase: string;
};

const STICKER_ASSETS: StickerAsset[] = [
  {
    id: "done",
    imageSrc: "/images/winx/done.webp",
    alt: "Winx done sticker",
    phrase: "Все трекеры закрыты. Идеальный день.",
  },
  {
    id: "middle",
    imageSrc: "/images/winx/middle.webp",
    alt: "Winx middle sticker",
    phrase: "Хороший прогресс. Осталось немного.",
  },
  {
    id: "low",
    imageSrc: "/images/winx/low.webp",
    alt: "Winx low sticker",
    phrase: "Начни с одного шага. Все получится.",
  },
];

const LEGACY_ID_MAP: Record<string, string> = {
  "spark-heart": "done",
  "pink-star": "middle",
  strawberry: "middle",
  tulip: "middle",
  cool_man: "middle",
  shy: "middle",
  help: "low",
};

export function getStickerByTrackers(completedTrackers: number): StickerAsset {
  if (completedTrackers >= 4) {
    return STICKER_ASSETS.find((sticker) => sticker.id === "done") ?? STICKER_ASSETS[0];
  }

  if (completedTrackers === 0) {
    return STICKER_ASSETS.find((sticker) => sticker.id === "low") ?? STICKER_ASSETS[0];
  }

  return STICKER_ASSETS.find((sticker) => sticker.id === "middle") ?? STICKER_ASSETS[0];
}

export function getStickerById(stickerId: string | undefined): StickerAsset | null {
  if (!stickerId) {
    return null;
  }

  const normalized = LEGACY_ID_MAP[stickerId] ?? stickerId;
  return STICKER_ASSETS.find((sticker) => sticker.id === normalized) ?? null;
}
