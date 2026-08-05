import Image from "next/image";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";

export function ClientsLogos() {
  return (
    <HomePanel tone="clear">
      <div className="px-1 py-2 sm:px-2 sm:py-4">
        <Reveal>
          <Image
            src="/images/home/clients-logos.webp"
            alt="ลูกค้าองค์กรที่ไว้วางใจช่างตี๋"
            width={1390}
            height={684}
            unoptimized
            className="mx-auto h-auto w-full max-w-5xl object-contain"
          />
        </Reveal>
      </div>
    </HomePanel>
  );
}
