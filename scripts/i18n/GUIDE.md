# Translation brief — Chang Tee website (ช่างตี๋ ผ้าม่าน)

Input: `scripts/i18n/source.json` — array of `{ "id": "s0", "th": "<Thai source>" }`.
Output: `scripts/i18n/out/<locale>.json` — one JSON object `{ "<id>": "<translation>" }` with **every id**.

Chang Tee is a Bangkok curtain and blind company (own factory, free on-site measuring, installation).
Strings are website copy: product names, portfolio job titles, short summaries, FAQ answers, review quotes, video titles, UI labels.

## Hard rules

1. Translate **from Thai** into the target language. Output must contain **no Thai script** at all.
2. Brand: ช่างตี๋ / ช่างตี๋ ผ้าม่าน → **Chang Tee** (Latin, every language). "Changtee Phaman" stays as written.
3. Keep unchanged: LINE ID `@chang-tee`, phone numbers, URLs, prices with ฿ (write ฿ amounts as-is, e.g. `1,500฿`), sizes, product codes, English words already in the source (Sunscreen, Zebra, Blackout, Somfy, Wi‑Fi, KMITL, CPRAM, YouTube, PVC, Brochure, Japandi…).
4. Keep placeholders exactly: `{n}`, `{title}`, `{name}`. Keep symbols: `→`, `—`, `·`, `+`, `“ ”`.
5. Thai place, shop, project and people names → romanize in Latin letters (Rama 2, Bang Khae, Bangkok, Nonthaburi, Khlong Sam Wa, Lat Krabang, Don Mueang, Chatuchak, Chon Buri, Nakhon Nayok, Nakhon Pathom, Pathum Thani, Buriram, Ang Thong, Thai Raman Road, Sam Wa Tawan Tok, Bangkok 10510). Translate the common noun around them (บ้าน = house, คอนโด = condo, สำนักงาน = office, โรงพยาบาล = hospital…).
   - Well-known names: สุกี้ตี๋น้อย = Sukishi Teenoi → write "Teenoi Suki"; บาร์บีคิวพลาซ่า = Bar B Q Plaza; การไฟฟ้าส่วนภูมิภาค = PEA (Provincial Electricity Authority); กรมทางหลวง = Department of Highways; ราชวิทยาลัยจุฬาภรณ์ = Chulabhorn Royal Academy; สวนจิตรลดา = Suan Chitralada; ซีพีแรม = CPRAM; สนามบินดอนเมือง = Don Mueang Airport; สนามช้างอารีนา = Chang Arena.
6. Customer names like คุณมิ้นท์ → "Khun Mint" style in en; in other languages use the local polite form + Latin name is fine (e.g. "Mint"). Sales staff เชลล์ตุ่น / เซลล์โส / เชลล์โจ้ / เชลล์เฟิร์น / เชลล์ฝัน → the word for "Sales" in the target language + Latin name (Tun, So, Jo, Fern, Fhan). Example en: "Sales · Tun".
7. Dates: none in these strings. Units: ชม. = hours, ตร.เมตร = sq m (use the target language's normal unit word or `m²`).
8. Review quotes (customer voice) — translate naturally, keep the casual friendly tone, drop Thai polite particles (ค่ะ/ครับ).
9. Short labels stay short (tile names, buttons). Keep sentence count roughly the same as the source.

## Glossary (use consistently)

| ไทย | en | my | lo | km | zh-Hans | zh-Hant |
|---|---|---|---|---|---|---|
| ผ้าม่าน | curtains | လိုက်ကာ | ຜ້າມ່ານ | វាំងនន | 窗帘 | 窗簾 |
| ม่านม้วน | roller blinds | လိပ်ကာ | ມ່ານມ້ວນ | វាំងននរមូរ | 卷帘 | 捲簾 |
| มู่ลี่ / มู่ลี่ไม้ / มู่ลี่อลูมิเนียม | blinds / wooden blinds / aluminium blinds | ဘလိုင်း / သစ်သားဘလိုင်း / အလူမီနီယံဘလိုင်း | ມູ່ລີ່ / ມູ່ລີ່ໄມ້ / ມູ່ລີ່ອາລູມິນຽມ | វាំងននបន្ទះ / វាំងននបន្ទះឈើ / វាំងននបន្ទះអាលុយមីញ៉ូម | 百叶帘 / 木百叶 / 铝百叶 | 百葉簾 / 木百葉 / 鋁百葉 |
| ม่านปรับแสง | vertical blinds | ဒေါင်လိုက်ဘလိုင်း | ມ່ານປັບແສງ | វាំងននបញ្ឈរ | 垂直帘 | 垂直簾 |
| ฉากกั้นห้อง | room partition | အခန်းကန့် | ຝາກັ້ນຫ້ອງ | ជញ្ជាំងខណ្ឌ | 隔断 | 隔間 |
| ม่านพิมพ์ลาย / ผ้าพิมพ์ลาย | printed curtains / printed fabric | ပုံနှိပ်လိုက်ကာ / ပုံနှိပ်ပိတ်စ | ຜ້າມ່ານພິມລາຍ / ຜ້າພິມລາຍ | វាំងននបោះពុម្ព / ក្រណាត់បោះពុម្ព | 印花窗帘 / 印花布 | 印花窗簾 / 印花布 |
| วอลเปเปอร์ | wallpaper | နံရံကပ်စက္ကူ | ວໍເປເປີ | ក្រដាសបិទជញ្ជាំង | 壁纸 | 壁紙 |
| ม่านจีบ | pinch-pleat curtains | အခေါက်လိုက်ကာ | ຜ້າມ່ານຈີບ | វាំងននជីប | 韩褶窗帘 | 韓褶窗簾 |
| ม่านลอน / ม่านลอนเทป | wave curtains | လှိုင်းလိုက်ကာ | ຜ້າມ່ານລອນ | វាំងននរលក | 蛇形帘 | 蛇形簾 |
| ม่านตาไก่ | eyelet curtains | ကွင်းပေါက်လိုက်ကာ | ຜ້າມ່ານຕາໄກ່ | វាំងននរង្វង់ដែក | 打孔窗帘 | 打孔窗簾 |
| ม่านพับ | roman blinds | ခေါက်လိုက်ကာ | ມ່ານພັບ | វាំងននបត់ | 罗马帘 | 羅馬簾 |
| ม่านญี่ปุ่น | noren (Japanese door curtain) | ဂျပန်တံခါးလိုက်ကာ (noren) | ຜ້າມ່ານຍີ່ປຸ່ນ (noren) | វាំងននជប៉ុន (noren) | 日式门帘 | 日式門簾 |
| ม่านไฟฟ้า / มอเตอร์ | motorized curtains / motor | လျှပ်စစ်လိုက်ကာ / မော်တာ | ຜ້າມ່ານໄຟຟ້າ / ມໍເຕີ | វាំងននអគ្គិសនី / ម៉ូទ័រ | 电动窗帘 / 电机 | 電動窗簾 / 馬達 |
| ม่านม้วนภายนอก / ม่านรางซิป | outdoor roller blinds / zip-track blinds | | | | 户外卷帘 / 拉链轨道帘 | 戶外捲簾 / 拉鍊軌道簾 |
| ม่านริ้ว PVC | PVC strip curtain | PVC အစင်းလိုက်ကာ | ຜ້າມ່ານເສັ້ນ PVC | វាំងននបន្ទះ PVC | PVC软门帘 | PVC軟門簾 |
| วัดหน้างาน (ฟรี) | (free) on-site measuring | (အခမဲ့) နေရာတွင် တိုင်းတာ | ວັດໜ້າງານ (ຟຣີ) | វាស់ទីតាំង (ឥតគិតថ្លៃ) | (免费)上门测量 | (免費)到府丈量 |
| ใบเสนอราคา | quotation | ဈေးနှုန်း | ໃບສະເໜີລາຄາ | សម្រង់តម្លៃ | 报价 | 報價 |
| โรงงาน | factory | စက်ရုံ | ໂຮງງານ | រោងចក្រ | 工厂 | 工廠 |
| โชว์รูม | showroom | ပြခန်း | ໂຊຣູມ | បន្ទប់តាំងបង្ហាញ | 展厅 | 展示間 |
| ผลงาน / ผลงานติดตั้ง | our work / installations | လက်ရာ | ຜົນງານ | ស្នាដៃ | 案例 | 案例 |
| แคตตาล็อก | catalogue | ကတ်တလောက် | ແຄັດຕາລັອກ | កាតាឡុក | 目录 | 型錄 |
| รับประกัน | warranty | အာမခံ | ຮັບປະກັນ | ធានា | 保修 | 保固 |

Chinese: write zh-Hant separately for Taiwan readers (到府丈量, 保固, 型錄, 馬達, 隔間) — do not just convert characters.
Burmese/Lao/Khmer: Latin digits are fine (keep the same digits as the source).

## Self-check before finishing

Run in the repo root (PowerShell):

```
node -e "const s=require('./scripts/i18n/source.json');const o=require('./scripts/i18n/out/<locale>.json');const miss=s.filter(x=>!o[x.id]);const thai=Object.values(o).filter(v=>/[\u0E00-\u0E7F]/.test(v));const ph=s.filter(x=>o[x.id]&&(x.th.match(/\{\w+\}/g)||[]).some(p=>!o[x.id].includes(p)));console.log(s.length,Object.keys(o).length,'missing',miss.length,'thai',thai.length,'placeholders',ph.length)"
```

All three counts must be 0.
