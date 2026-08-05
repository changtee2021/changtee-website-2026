export type ProductCertificate = {
  id: string;
  title: string;
  code: string;
  issuer: string;
  thumbSrc: string;
  fullSrc: string;
  note: string;
};

const CERT = "/images/products/certificates";

/** Mock certificates — replace files under /public/images/products/certificates later */
export const PRODUCT_CERTIFICATES: ProductCertificate[] = [
  {
    id: "iso-quality",
    title: "มาตรฐานคุณภาพงานผลิต",
    code: "CT-QC-2026",
    issuer: "ช่างตี๋ ผ้าม่าน (โม๊ก)",
    thumbSrc: `${CERT}/iso-quality.png`,
    fullSrc: `${CERT}/iso-quality.png`,
    note: "เอกสารตัวอย่างสำหรับแสดงบนเว็บ — จะอัปโหลดใบรับรองจริงภายหลัง",
  },
  {
    id: "fire-retardant",
    title: "ผ้าทนไฟ / Fire Retardant (ตัวอย่าง)",
    code: "CT-FR-MOCK",
    issuer: "Lab Mock Certificate",
    thumbSrc: `${CERT}/fire-retardant.png`,
    fullSrc: `${CERT}/fire-retardant.png`,
    note: "ใช้กับงานที่ระบุสเปกผ้าทนไฟ — ไฟล์จริงจะแนบตามรุ่นผ้าที่เลือก",
  },
  {
    id: "install-warranty",
    title: "การรับประกันงานติดตั้ง",
    code: "CT-INSTALL-1Y",
    issuer: "บริษัท ช่างตี๋ ผ้าม่าน จำกัด",
    thumbSrc: `${CERT}/install-warranty.png`,
    fullSrc: `${CERT}/install-warranty.png`,
    note: "ตัวอย่างใบรับประกันติดตั้ง 1 ปี ตามเงื่อนไขมาตรฐานของช่างตี๋",
  },
  {
    id: "material-safety",
    title: "ความปลอดภัยวัสดุ (ตัวอย่าง)",
    code: "CT-MSDS-MOCK",
    issuer: "Material Safety Mock",
    thumbSrc: `${CERT}/material-safety.png`,
    fullSrc: `${CERT}/material-safety.png`,
    note: "เอกสารตัวอย่างด้านความปลอดภัยวัสดุ — รออัปไฟล์จริง",
  },
];

/** Which certs to show by category (all get core set for now) */
export function certificatesForCategory(categorySlug: string): ProductCertificate[] {
  if (categorySlug === "outdoor-factory" || categorySlug === "service") {
    return PRODUCT_CERTIFICATES.filter((c) =>
      ["iso-quality", "install-warranty", "material-safety"].includes(c.id),
    );
  }
  if (categorySlug === "hospital" || categorySlug === "curtain") {
    return PRODUCT_CERTIFICATES;
  }
  return PRODUCT_CERTIFICATES;
}
