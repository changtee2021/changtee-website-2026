/** Content adapted from แผ่นพับช่างตี๋ 2026 */

export const aboutHero = {
  eyebrow: "เกี่ยวกับเรา",
  title: "ช่างม่านที่เข้าใจคุณ",
  lead:
    "เราเชื่อว่าผ้าม่านไม่ใช่แค่ของตกแต่ง แต่คือองค์ประกอบสำคัญที่สะท้อนตัวตนและไลฟ์สไตล์ของเจ้าของบ้าน",
  body:
    "ช่างตี๋ใส่ใจตั้งแต่ต้นทาง — รับฟังความต้องการ วิเคราะห์แสง ทิศทางลม และบรรยากาศของห้อง เพื่อออกแบบม่านที่สวยและใช้งานได้จริง เพราะสำหรับเรา งานที่ดีไม่ใช่แค่ติดตั้งเสร็จ แต่ต้องทำให้คุณรู้สึก “ใช่” ทุกครั้งที่มองเห็น",
  image: "/images/about/technician-hero.webp",
  imageAlt: "ช่างตี๋ ทีมติดตั้งผ้าม่านมืออาชีพ",
};

export const aboutValues = [
  {
    key: "QUICKLY",
    title: "เร็วทันใจ",
    desc: "สั่งวันนี้ เข้าติดตั้งเร็วสุด 1–2 วัน เพราะมีโรงงานผลิตและทีมช่างของเราเอง",
  },
  {
    key: "QUALITY",
    title: "คุมคุณภาพจากหลังบ้าน",
    desc: "ออกแบบ ปรึกษา ผลิต ติดตั้งครบในมาตรฐานเดียวกัน ตรวจงานก่อนส่งมอบทุกครั้ง",
  },
  {
    key: "PROFESSIONAL",
    title: "มืออาชีพ 10+ ปี",
    desc: "ประสบการณ์กว่า 10 ปี เข้าใจหน้างานจริง แปลความต้องการลูกค้าให้ออกมาเป็นผลงานที่ใช่",
  },
] as const;

export const aboutSegments = [
  {
    title: "บ้านและคอนโด",
    label: "HOME DECORATION",
    desc: "ม่านบ้าน คอนโด ห้องนอน ห้องนั่งเล่น — เลือกผ้าและแบบให้เข้ากับไลฟ์สไตล์",
    icon: "home" as const,
  },
  {
    title: "องค์กรและหน่วยงาน",
    label: "CORPORATE",
    desc: "ร้านอาหาร คาเฟ่ ออฟฟิศ หน่วยงานราชการ และสถานศึกษา — งานหลายสาขาประสานทีมเดียวจบ",
    icon: "building" as const,
  },
  {
    title: "งานออกแบบพิเศษ",
    label: "DESIGN PROJECT",
    desc: "โปรเจกต์นิทรรศการและงานคัสตอม เช่น AP × BKKDW2025 ม่านม้วนพิมพ์ลาย",
    icon: "pen" as const,
  },
] as const;

export const aboutClients = {
  title: "ลูกค้าที่ไว้วางใจเรา",
  image: "/images/about/clients-strip.webp",
};

export const aboutSmartMotor = {
  title: "Specialist · Smart Motor Blind",
  subtitle: "ม่านไฟฟ้าสมาร์ทโฮม รับประกันมอเตอร์ 5 ปี",
  image: "/images/about/smart-motor.webp",
  points: [
    "รองรับการติดตั้งสูงสุดถึง 10 เมตร",
    "สัญญาณรีโมทเสถียร ต่อเนื่องไร้สะดุด",
    "รองรับน้ำหนักได้มากถึง 24 กิโลกรัม",
  ],
  brands: "Somfy · Novo · Raex · Tuya · Mi Home · Google · Siri",
};

export const aboutOneStop = {
  title: "ONE STOP SERVICE",
  subtitle: "CURTAIN & BLINDS",
  body: "วัดหน้างานฟรี · ออกแบบ · ผลิตที่โรงงานเรา · ติดตั้งโดยช่างมืออาชีพ · รับประกันงานติดตั้ง 1 ปีเต็ม",
  image: "/images/about/installing.webp",
};

export const companyInquiryTypes = [
  "โปรเจกต์องค์กร / ติดตั้งหลายสาขา",
  "ขอข้อมูลบริษัท / Company Profile",
  "นัดเยี่ยมชมโรงงาน",
  "ร่วมงานกับเรา / สมัครงาน",
  "สนใจเป็นพาร์ทเนอร์ / ตัวแทน",
  "สื่อมวลชน / ประชาสัมพันธ์",
  "อื่นๆ",
] as const;
