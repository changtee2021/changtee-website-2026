/**
 * Demo seed helper for local/dev content shape.
 * After migration is applied, extend this to insert via Supabase service role.
 *
 * Usage: npm run seed
 */

const demo = {
  portfolio: [
    {
      slug: "teenoi-roller-blinds",
      title: "ม่านม้วนเครือสุกี้ตี๋น้อย",
      place_tags: ["ร้านอาหาร"],
      product_tags: ["ม่านม้วน"],
      project_tags: ["Teenoi"],
    },
    {
      slug: "don-mueang-airport",
      title: "ม่านม้วนสนามบินดอนเมือง",
      place_tags: ["องค์กร"],
      product_tags: ["ม่านม้วน"],
      project_tags: ["Airport"],
    },
  ],
  posts: [
    {
      slug: "curtain-care",
      title: "การดูแลผ้าม่านอย่างถูกวิธี",
      excerpt: "เคล็ดลับยืดอายุผ้าม่านและคงความสวย",
    },
    {
      slug: "pvc-partition-save-energy",
      title: "ฉากกั้นห้องช่วยประหยัดค่าไฟได้จริงหรือไม่?",
      excerpt: "อธิบายการกั้นแอร์และเลือกฉากให้เหมาะงาน",
    },
  ],
  reviews: [
    {
      customer_name: "คุณแพร",
      rating: 5,
      body: "วัดเร็ว ติดตั้งตรงเวลา งานเนี๊ยบ",
    },
  ],
};

console.log("Chang Tee seed demo payload");
console.log(JSON.stringify(demo, null, 2));
console.log("\nNext: wire this script to Supabase service role after env is set.");
