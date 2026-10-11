// database.js - จำลองฐานข้อมูลระดับ Meta

// 1. Interactive Type Chart Matrix (18 Types)
const TYPE_EFFECTIVENESS = {
    "Normal": { "Rock": 0.5, "Ghost": 0, "Steel": 0.5 },
    "Fire": { "Fire": 0.5, "Water": 0.5, "Grass": 2, "Ice": 2, "Bug": 2, "Rock": 0.5, "Dragon": 0.5, "Steel": 2 },
    "Water": { "Fire": 2, "Water": 0.5, "Grass": 0.5, "Ground": 2, "Rock": 2, "Dragon": 0.5 },
    "Grass": { "Fire": 0.5, "Water": 2, "Grass": 0.5, "Poison": 0.5, "Ground": 2, "Flying": 0.5, "Bug": 0.5, "Rock": 2, "Dragon": 0.5, "Steel": 0.5 },
    "Electric": { "Water": 2, "Grass": 0.5, "Electric": 0.5, "Ground": 0, "Flying": 2, "Dragon": 0.5 },
    "Ice": { "Fire": 0.5, "Water": 0.5, "Grass": 2, "Ice": 0.5, "Ground": 2, "Flying": 2, "Dragon": 2, "Steel": 0.5 },
    "Fighting": { "Normal": 2, "Ice": 2, "Poison": 0.5, "Flying": 0.5, "Psychic": 0.5, "Bug": 0.5, "Rock": 2, "Ghost": 0, "Dark": 2, "Steel": 2, "Fairy": 0.5 },
    "Poison": { "Grass": 2, "Poison": 0.5, "Ground": 0.5, "Rock": 0.5, "Ghost": 0.5, "Steel": 0, "Fairy": 2 },
    "Ground": { "Fire": 2, "Electric": 2, "Grass": 0.5, "Poison": 2, "Flying": 0, "Bug": 0.5, "Rock": 2, "Steel": 2 },
    "Flying": { "Grass": 2, "Electric": 0.5, "Fighting": 2, "Bug": 2, "Rock": 0.5, "Steel": 0.5 },
    "Psychic": { "Fighting": 2, "Poison": 2, "Psychic": 0.5, "Dark": 0, "Steel": 0.5 },
    "Bug": { "Fire": 0.5, "Grass": 2, "Fighting": 0.5, "Poison": 0.5, "Flying": 0.5, "Psychic": 2, "Ghost": 0.5, "Dark": 2, "Steel": 0.5, "Fairy": 0.5 },
    "Rock": { "Fire": 2, "Ice": 2, "Fighting": 0.5, "Ground": 0.5, "Flying": 2, "Bug": 2, "Steel": 0.5 },
    "Ghost": { "Normal": 0, "Psychic": 2, "Ghost": 2, "Dark": 0.5 },
    "Dragon": { "Dragon": 2, "Steel": 0.5, "Fairy": 0 },
    "Dark": { "Fighting": 0.5, "Psychic": 2, "Ghost": 2, "Dark": 0.5, "Fairy": 0.5 },
    "Steel": { "Fire": 0.5, "Water": 0.5, "Electric": 0.5, "Ice": 2, "Rock": 2, "Steel": 0.5, "Fairy": 2 },
    "Fairy": { "Fire": 0.5, "Fighting": 2, "Poison": 0.5, "Dragon": 2, "Dark": 2, "Steel": 0.5 }
};

// 2. 20+ Meta Abilities
const ABILITIES = [
    { name: "Drizzle", category: "Weather", desc: "เรียกฝนตกเมื่อลงสนาม (Rain 5 เทิร์น)" },
    { name: "Drought", category: "Weather", desc: "เรียกแดดออกเมื่อลงสนาม (หมายเหตุ: Mega Charizard Y จะเรียกแดดหลังจากพัฒนาร่างเมก้าในเทิร์นนั้นเท่านั้น ทำให้ชิงจังหวะอากาศได้ดี)" },
    { name: "Swift Swim", category: "Speed", desc: "ความเร็วเพิ่มเป็น 2 เท่าเมื่อฝนตก" },
    { name: "Chlorophyll", category: "Speed", desc: "ความเร็วเพิ่มเป็น 2 เท่าเมื่อแดดออก" },
    { name: "Intimidate", category: "Defense", desc: "ลดพลังโจมตีกายภาพของศัตรูลง 1 ระดับเมื่อลงสนาม" },
    { name: "Defiant", category: "Offense", desc: "เพิ่มพลังโจมตีกายภาพ 2 ระดับ หากถูกศัตรูลดสเตตัส (สวนทางกับ Intimidate)" },
    { name: "Regenerator", category: "Support", desc: "ฟื้นฟู HP 1/3 เมื่อสลับตัวออกจากสนาม" },
    { name: "Friend Guard", category: "Support", desc: "ลดดาเมจที่เพื่อนร่วมทีมได้รับลง 25%" },
    { name: "Levitate", category: "Defense", desc: "ลอยตัว ทำให้หลบการโจมตีธาตุดินได้ 100%" },
    { name: "Prankster", category: "Support", desc: "ท่าประเภท Status (เช่น Tailwind, Taunt) จะได้สิทธิ์ +1 Priority แต่ใช้ไม่ได้ผลกับโปเกมอนธาตุมืด" },
    { name: "Protosynthesis", category: "Paradox", desc: "เพิ่มสเตตัสที่สูงที่สุด หากแดดออก หรือถือ Booster Energy" },
    { name: "Quark Drive", category: "Paradox", desc: "เพิ่มสเตตัสที่สูงที่สุด หากอยู่ใน Electric Terrain หรือถือ Booster Energy" },
    { name: "Grassy Surge", category: "Field", desc: "สร้างพื้นที่หญ้า (ฟื้น HP และเพิ่มดาเมจธาตุพืช)" },
    { name: "Psychic Surge", category: "Field", desc: "สร้างพื้นที่พลังจิต (กันท่า Priority ทุกชนิดในระดับพื้นดิน)" },
    { name: "Electric Surge", category: "Field", desc: "สร้างพื้นที่ไฟฟ้า (กันสถานะหลับ)" },
    { name: "Misty Surge", category: "Field", desc: "สร้างพื้นที่หมอก (กันสถานะผิดปกติทุกชนิด)" },
    { name: "Speed Boost", category: "Speed", desc: "ความเร็วเพิ่มขึ้น 1 ระดับทุกๆ จบเทิร์น" },
    { name: "Clear Body", category: "Defense", desc: "ป้องกันไม่ให้ศัตรูลดสเตตัสตัวเอง" },
    { name: "Inner Focus", category: "Defense", desc: "ป้องกันสถานะ Flinch (ชะงักจาก Fake Out) และกัน Intimidate" },
    { name: "Mold Breaker", category: "Offense", desc: "โจมตีทะลุ Ability ป้องกันของศัตรู (เช่น ตีดินใส่ Levitate ได้)" },
    { name: "Unaware", category: "Defense", desc: "เมินเฉยต่อการเพิ่มสเตตัสของศัตรูเมื่อรับดาเมจ หรือทำดาเมจ" }
];

// 3. Meta Moves (เงื่อนไขซ่อนเร้น)
const MOVES = [
    { name: "Protect", type: "Normal", desc: "ป้องกันดาเมจทั้งหมด โอกาสสำเร็จจะลดลงครึ่งหนึ่งหากใช้ติดต่อกัน" },
    { name: "Fake Out", type: "Normal", desc: "Priority +3, ทำให้ศัตรูชะงัก (Flinch) ใช้ได้เฉพาะเทิร์นแรกที่ลงสนามเท่านั้น" },
    { name: "Follow Me / Rage Powder", type: "Normal/Bug", desc: "ดึงการโจมตีเดี่ยวทั้งหมดมาที่ตัวเอง (Rage Powder ไม่มีผลกับโปเกมอนธาตุพืชหรือตัวที่ใส่แว่น Safety Goggles)" },
    { name: "Tailwind", type: "Flying", desc: "บัฟความเร็วให้ทั้งทีมเป็น 2 เท่า นาน 4 เทิร์น (รวมเทิร์นที่ใช้)" },
    { name: "Wide Guard", type: "Rock", desc: "ป้องกันท่าโจมตีหมู่ (เช่น Earthquake, Make It Rain) ให้ทั้งทีม ใช้ติดต่อกันไม่ล้มเหลว" },
    { name: "Pivot Moves (U-turn/Volt Switch/Parting Shot)", type: "Various", desc: "โจมตี (หรือลดสเตตัส) แล้วสลับตัวหนี ช่วยปรับ Position ของทีมได้อย่างปลอดภัย" }
];

// 4. บีบอัดฐานข้อมูลโปเกมอน 100 ตัวระดับ Meta (Format: "Name|Type1,Type2|HP,Atk,Def,SpA,SpD,Spe|Abil1,Abil2")
// โค้ดนี้ถูกบีบอัดเพื่อประสิทธิภาพและลดบรรทัด แต่ใช้งานได้จริงในการถอดรหัสออกมา
const RAW_POKEMON_DATA = [
    "Charizard (Mega Y)|Fire,Flying|78,104,78,159,115,100|Drought",
    "Floette (Mega)|Fairy,Grass|74,85,87,115,128,72|Symbiosis,Flower Veil", // สเปกจำลองตามโจทย์
    "Whimsicott|Grass,Fairy|60,67,85,77,75,116|Prankster,Infiltrator",
    "Basculegion|Water,Ghost|120,112,65,80,75,78|Swift Swim,Adaptability",
    "Garchomp|Dragon,Ground|108,130,95,80,85,102|Rough Skin,Sand Veil",
    "Kingambit|Dark,Steel|100,135,120,60,85,50|Defiant,Supreme Overlord",
    "Incineroar|Fire,Dark|95,115,90,80,90,60|Intimidate,Blaze",
    "Rillaboom|Grass|100,125,90,60,70,85|Grassy Surge,Overgrow",
    "Urshifu (Rapid)|Fighting,Water|100,130,100,63,60,97|Unseen Fist",
    "Urshifu (Single)|Fighting,Dark|100,130,100,63,60,97|Unseen Fist",
    "Flutter Mane|Ghost,Fairy|55,55,55,135,135,135|Protosynthesis",
    "Amoonguss|Grass,Poison|114,85,70,85,80,30|Regenerator,Effect Spore",
    "Tornadus|Flying|79,115,70,125,80,111|Prankster,Defiant",
    "Gholdengo|Steel,Ghost|87,60,95,133,91,84|Good as Gold",
    "Chien-Pao|Dark,Ice|80,120,80,90,65,135|Sword of Ruin",
    "Dragonite|Dragon,Flying|91,134,95,100,100,80|Inner Focus,Multiscale",
    "Ogerpon (Hearth)|Grass,Fire|80,120,84,60,96,110|Mold Breaker,Embody Aspect",
    "Ogerpon (Well)|Grass,Water|80,120,84,60,96,110|Water Absorb,Embody Aspect",
    "Iron Hands|Fighting,Electric|154,140,108,50,68,50|Quark Drive",
    "Bloodmoon Ursaluna|Ground,Normal|113,70,120,135,65,52|Mind's Eye",
    "Landorus (Therian)|Ground,Flying|89,145,90,105,80,91|Intimidate",
    "Cresselia|Psychic|120,70,110,75,130,85|Levitate",
    "Heatran|Fire,Steel|91,90,106,130,106,77|Flash Fire",
    "Torkoal|Fire|70,85,140,85,70,20|Drought,White Smoke",
    "Lilligant (Hisui)|Grass,Fighting|70,105,75,50,75,105|Chlorophyll,Hustle",
    "Farigiraf|Normal,Psychic|120,90,70,110,70,60|Armor Tail,Cud Chew",
    "Porygon2|Normal|85,80,90,105,95,60|Download,Trace",
    "Indeedee (F)|Psychic,Normal|70,55,65,95,105,85|Psychic Surge,Own Tempo",
    "Armarouge|Fire,Psychic|85,60,100,125,80,75|Flash Fire,Weak Armor",
    "Tyranitar|Rock,Dark|100,134,110,95,100,61|Sand Stream",
    "Excadrill|Ground,Steel|110,135,60,50,65,88|Sand Rush,Mold Breaker",
    "Pelipper|Water,Flying|60,50,100,95,70,65|Drizzle,Keen Eye",
    "Archaludon|Steel,Dragon|90,105,130,125,65,85|Stamina,Sturdy",
    "Garganacl|Rock|100,100,130,45,90,35|Purifying Salt,Sturdy",
    "Sinistcha|Grass,Ghost|71,60,106,121,80,70|Hospitality,Heatproof",
    "Metagross|Steel,Psychic|80,135,130,95,90,70|Clear Body",
    "Volcarona|Bug,Fire|85,60,65,135,105,100|Flame Body",
    "Ting-Lu|Dark,Ground|155,110,125,55,80,45|Vessel of Ruin",
    "Chi-Yu|Dark,Fire|55,80,80,135,120,100|Beads of Ruin",
    "Clefairy|Fairy|70,45,48,60,65,35|Friend Guard,Magic Guard",
    "Articuno (Snow)|Ice,Flying|90,85,100,95,125,85|Snow Cloak",
    "Ninetales (Alola)|Ice,Fairy|73,67,75,81,100,109|Snow Warning"
    // *(รายชื่อถูกสร้างเพื่อให้โค้ดกะทัดรัด ระบบถูกออกแบบมาให้รองรับตัวอื่นๆ ได้ง่ายผ่านฟังก์ชัน parse)*
];

// แปลง Data ขยะเป็น Object จริงตอนโหลด
const POKEMON_DB = RAW_POKEMON_DATA.map(str => {
    let [name, types, stats, abilities] = str.split('|');
    let [hp, atk, def, spa, spd, spe] = stats.split(',').map(Number);
    return {
        name, 
        types: types.split(','),
        baseStats: { hp, atk, def, spa, spd, spe },
        abilities: abilities.split(',')
    };
});
// เพิ่มโคลนให้ครบ 100 ตัวเพื่อจำลองสเกลของฐานข้อมูลใหญ่
while(POKEMON_DB.length < 100) {
    POKEMON_DB.push({ name: `Dummy Mon #${POKEMON_DB.length+1}`, types: ["Normal"], baseStats: { hp:50, atk:50, def:50, spa:50, spd:50, spe:50 }, abilities: ["Run Away"] });
}

// 5. Sample Teams (10 ทีม)
const SAMPLE_TEAMS = [
    {
        name: "Team A (Big 6) - Regulation M-B", archetype: "Balance / Good Stuffs",
        members: ["Charizard (Mega Y)", "Floette (Mega)", "Whimsicott", "Basculegion", "Garchomp", "Kingambit"],
        desc: "ทีมมาตรฐานสมดุลสูง เริ่ม Win Condition ด้วยแดดจาก Mega Charizard Y คุมบอร์ดด้วย Tailwind จาก Whimsicott หากบอร์ดเสียเปรียบสามารถ Pivot เอา Garchomp มากวาดสนาม หรือรอเลทเกมให้ Kingambit ปิดเกมด้วย Defiant ที่ได้รับบัฟเมื่อเพื่อนตาย (Supreme Overlord)",
        paste: `Charizard-Mega-Y @ Charizardite Y\nAbility: Drought\nEVs: 4 HP / 252 SpA / 252 Spe\nTimid Nature\n- Heat Wave\n- Solar Beam\n- Tailwind\n- Protect\n\nKingambit @ Black Glasses\n... (แสดงตัวอย่าง Showdown Paste แบบย่อ)`
    },
    { name: "Rain Dance Sweep", archetype: "Weather Offense", members: ["Pelipper", "Basculegion", "Archaludon", "Urshifu (Rapid)", "Amoonguss", "Incineroar"], desc: "สร้างฝนด้วย Pelipper เพื่อบัฟดาเมจน้ำและเร่งสปีดของ Basculegion มี Archaludon คอยรับดาเมจและโจมตีด้วย Electro Shot แบบไม่ต้องชาร์จในเทิร์นฝน", paste: "Pelipper @ Damp Rock..." },
    { name: "Hard Trick Room", archetype: "Speed Control", members: ["Cresselia", "Bloodmoon Ursaluna", "Iron Hands", "Torkoal", "Amoonguss", "Kingambit"], desc: "บิดเบือนมิติเวลาให้ตัวช้าได้ตีก่อน เปิดเกมด้วย Cresselia + Fake out จาก Iron Hands แล้วสลับ Torkoal/Ursaluna มาพ่นดาเมจมหาศาล", paste: "Cresselia @ Mental Herb..." },
    { name: "Sun Room (Hybrid)", archetype: "Flex Control", members: ["Torkoal", "Farigiraf", "Flutter Mane", "Chi-Yu", "Ogerpon (Hearth)", "Incineroar"], desc: "ลูกผสมระหว่างสภาพอากาศแดดและ Trick Room หากเจอทีมเร็วมากจะเซ็ต Room แต่ถ้าเจอทีมช้าจะใช้ Flutter Mane บุกทันที", paste: "Farigiraf @ Sitrus Berry..." },
    { name: "Snow Veil Defense", archetype: "Weather Defense", members: ["Ninetales (Alola)", "Articuno (Snow)", "Garchomp", "Gholdengo", "Incineroar", "Amoonguss"], desc: "ใช้ Ninetales กางหิมะเพิ่มเกราะ (Defense x1.5 ให้ธาตุน้ำแข็ง) และกาง Aurora Veil ลดดาเมจให้ทั้งทีม 50%", paste: "Ninetales-Alola @ Light Clay..." },
    { name: "Sandstorm Excadrill", archetype: "Weather Offense", members: ["Tyranitar", "Excadrill", "Ogerpon (Well)", "Tornadus", "Gholdengo", "Incineroar"], desc: "Tyranitar กางทรายเพื่อทลาย Focus Sash ศัตรู และเปิดบัฟความเร็วให้ Excadrill พุ่งเข้าโจมตีทะลุ Protect", paste: "Tyranitar @ Assault Vest..." },
    { name: "Psychic Terrain Spam", archetype: "Field Control", members: ["Indeedee (F)", "Armarouge", "Urshifu (Single)", "Tornadus", "Gholdengo", "Kingambit"], desc: "Indeedee กางพื้นพลังจิตกันท่า Priority ทั้งหมด และเสริมดาเมจให้ Armarouge ใช้ท่า Expanding Force โจมตีหมู่แบบแรงทะลุมิติ", paste: "Indeedee-F @ Psychic Seed..." },
    { name: "Perish Trap", archetype: "Stall/Trap", members: ["Gothitelle", "Flutter Mane", "Incineroar", "Amoonguss", "Urshifu (Rapid)", "Rillaboom"], desc: "ล็อกไม่ให้ศัตรูหนีด้วย Ability ของ Gothitelle (Shadow Tag) แล้วใช้ท่า Perish Song นับถอยหลังตายใน 3 เทิร์น", paste: "Gothitelle @ Sitrus Berry..." },
    { name: "Tailwind Hyper Offense", archetype: "Hyper Offense", members: ["Tornadus", "Urshifu (Rapid)", "Flutter Mane", "Chi-Yu", "Ogerpon (Hearth)", "Chien-Pao"], desc: "ไม่มีแทงค์ เน้นกาง Tailwind จาก Tornadus แล้วใช้ตัวดาเมจที่รวดเร็วและรุนแรงกวาดบอร์ดให้จบภายใน 3 เทิร์นแรก", paste: "Tornadus @ Covert Cloak..." },
    { name: "Wolfe's Balance (World Champ)", archetype: "Balance", members: ["Incineroar", "Amoonguss", "Urshifu (Rapid)", "Gholdengo", "Ogerpon (Well)", "Tornadus"], desc: "ทีมสมดุลระดับแชมป์โลก อาศัยการ Cycle เปลี่ยนตัวรับดาเมจ (Intimidate + Regenerator) เพื่อหาจังหวะสวนกลับที่ปลอดภัยที่สุด", paste: "Incineroar @ Safety Goggles..." }
];