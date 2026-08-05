"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ClickableProductImage,
  ProductImageLightbox,
  type GalleryImage,
} from "@/components/products/ProductImageLightbox";

type Ctx = {
  openSrc: (src: string) => void;
  images: GalleryImage[];
};

const LightboxContext = createContext<Ctx | null>(null);

export function ProductLightboxScope({
  images,
  children,
}: {
  images: GalleryImage[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const openSrc = useCallback(
    (src: string) => {
      const i = images.findIndex((img) => img.src === src);
      setIndex(i >= 0 ? i : 0);
    },
    [images],
  );

  const value = useMemo(() => ({ openSrc, images }), [openSrc, images]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <ProductImageLightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </LightboxContext.Provider>
  );
}

export function useProductLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useProductLightbox must be used within ProductLightboxScope");
  }
  return ctx;
}

export function ZoomImage({
  src,
  alt,
  className,
  rounded,
  sizes,
  priority,
  showZoomHint = true,
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  sizes?: string;
  priority?: boolean;
  showZoomHint?: boolean;
}) {
  const { openSrc } = useProductLightbox();
  return (
    <ClickableProductImage
      src={src}
      alt={alt}
      onOpen={() => openSrc(src)}
      className={className}
      rounded={rounded}
      sizes={sizes}
      priority={priority}
      showZoomHint={showZoomHint}
    />
  );
}
