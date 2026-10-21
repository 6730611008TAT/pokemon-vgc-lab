// คำศัพท์ไทยเพื่อช่วยอ่าน ไม่ใช่ชื่อแปลทางการของเกม
const THAI_TYPES={Normal:'ปกติ',Fire:'ไฟ',Water:'น้ำ',Grass:'พืช',Electric:'ไฟฟ้า',Ice:'น้ำแข็ง',Fighting:'ต่อสู้',Poison:'พิษ',Ground:'ดิน',Flying:'บิน',Psychic:'พลังจิต',Bug:'แมลง',Rock:'หิน',Ghost:'ผี',Dragon:'มังกร',Dark:'มืด',Steel:'เหล็ก',Fairy:'นางฟ้า',Stellar:'สเตลลาร์'};
const THAI_STATS={hp:'พลังชีวิต',atk:'พลังโจมตี',def:'พลังป้องกัน',spa:'พลังโจมตีพิเศษ',spd:'พลังป้องกันพิเศษ',spe:'ความเร็ว'};
const THAI_CATEGORIES={Physical:'โจมตีกายภาพ',Special:'โจมตีพิเศษ',Status:'ท่าสถานะ / สนับสนุน'};
const THAI_GLOSSARY={
 ev:{title:'EV — ค่าจากการฝึก',text:'แต้มที่ใช้เสริมค่าสเตตัส เลือกลงให้ตรงบทบาท เช่น เพิ่มความเร็วหรือพลังชีวิต แต่ละค่าใส่ได้ไม่เกิน 252 แต้ม รวมทั้งตัวไม่เกิน 510 แต้ม ที่เลเวล 50 บางแต้มยังไม่ทำให้ตัวเลขเพิ่มทันที ดูค่าสเตตัสจริงประกอบด้วย'},
 iv:{title:'IV — ค่าประจำตัว',text:'ค่าตั้งแต่ 0 ถึง 31 ของแต่ละค่าสเตตัส โดยทั่วไปค่า 31 ช่วยให้ค่านั้นสูงขึ้น บางแผนอาจเลือกความเร็ว 0 เพื่อใช้ Trick Room หรือพลังโจมตี 0 เพื่อลดความเสียหายจาก Foul Play เมื่อไม่ใช้ท่ากายภาพ'},
 nature:{title:'Nature — นิสัย',text:'นิสัยส่วนใหญ่เพิ่มค่าสเตตัสหนึ่งอย่าง 10% และลดอีกอย่าง 10% โดยไม่เปลี่ยนพลังชีวิต เช่น Timid เพิ่มความเร็วแต่ลดพลังโจมตี บางนิสัยไม่มีผลเพิ่มหรือลด เลือกให้ตรงชนิดท่าที่ใช้'},
 tera:{title:'Tera — เปลี่ยนธาตุระหว่างต่อสู้',text:'ใน Scarlet / Violet หนึ่งทีมใช้เทราสทัลได้หนึ่งครั้งต่อการต่อสู้ เปลี่ยนธาตุป้องกันเป็น Tera Type ที่เลือก และมีผลต่อโบนัสท่าโจมตีด้วย Stellar กับบางร่างมีกลไกพิเศษ ตารางนี้ช่วยดูธาตุป้องกัน ไม่ใช่เครื่องคำนวณดาเมจทั้งหมด'},
 ability:{title:'Ability — ความสามารถประจำตัว',text:'ความสามารถที่ทำงานตามเงื่อนไขของมัน ไม่ได้เลือกกดแทนท่าโจมตี บางตัวเลือกได้หลายความสามารถ แต่ใช้พร้อมกันได้ตามกติกาของเกม อ่านว่าเกิดผลกับผู้ใช้ เพื่อน หรือคู่ต่อสู้ให้ชัด'},
 item:{title:'ไอเทมถือ',text:'ของที่ให้โปเกมอนถือได้ตัวละหนึ่งชิ้น บางชิ้นทำงานต่อเนื่อง บางชิ้นใช้แล้วหมดไป และบางชิ้นมีข้อเสีย เช่น ล็อกท่าหรือทำให้ติดสถานะ กติกาบางชุดห้ามทีมถือไอเทมชื่อซ้ำกัน'},
 moves:{title:'ท่าโจมตีและท่าสถานะ',text:'โปเกมอนหนึ่งตัวจัดท่าได้สูงสุด 4 ท่า ท่ากายภาพใช้พลังโจมตี ส่วนท่าพิเศษใช้พลังโจมตีพิเศษตามกลไกปกติ ท่าสถานะอาจป้องกัน เพิ่มพลัง หรือช่วยเพื่อนแทนการทำดาเมจโดยตรง บางท่ามีข้อยกเว้น'},
 stats:{title:'อ่านค่าสเตตัส',text:'พลังชีวิต: รับดาเมจได้เท่าไร · พลังโจมตี/ป้องกัน: ใช้กับท่ากายภาพ · พลังโจมตีพิเศษ/ป้องกันพิเศษ: ใช้กับท่าพิเศษ · ความเร็ว: ช่วยกำหนดว่าใครลงมือก่อน แต่ลำดับความสำคัญของท่าและ Trick Room อาจเปลี่ยนลำดับได้'},
 priority:{title:'ลำดับก่อน — Priority',text:'บางท่าได้ลงมือก่อนท่าทั่วไป แม้ผู้ใช้จะช้ากว่า เช่น Fake Out ถ้าท่ามีลำดับความสำคัญเท่ากันจึงค่อยเปรียบเทียบความเร็ว การเพิ่มความเร็วอย่างเดียวไม่ได้ทำให้แซงท่าที่มีลำดับก่อนสูงกว่าเสมอ'},
 stages:{title:'ระดับเพิ่มหรือลดค่าสเตตัส',text:'บัฟและดีบัฟระหว่างต่อสู้มีระดับตั้งแต่ -6 ถึง +6 สำหรับพลังโจมตี ป้องกัน พลังพิเศษ และความเร็ว ระดับ +1 ปกติเป็น 1.5 เท่า และ +2 เป็น 2 เท่าของค่าเดิม การสลับออกมักล้างระดับเหล่านี้ ความแม่นยำและการหลบใช้สัดส่วนต่างออกไป'},
 stab:{title:'STAB — โบนัสท่าตรงธาตุ',text:'โดยทั่วไป ท่าที่มีธาตุเดียวกับผู้ใช้ทำดาเมจเพิ่มเป็น 1.5 เท่า เช่น ตัวธาตุไฟใช้ท่าไฟ Ability และ Tera บางแบบทำให้โบนัสนี้เปลี่ยนไป'},
 targeting:{title:'ใครได้รับผลของท่า',text:'ผู้ใช้ คือโปเกมอนที่ใช้ท่าหรือมีความสามารถนั้น · เป้าหมาย คือตัวที่ท่าเล็ง · เพื่อนร่วมทีม คือตัวฝ่ายเดียวกัน · รอบข้าง อาจรวมเพื่อนด้วย อ่านเป้าหมายก่อนใช้ท่าโจมตีหมู่เสมอ'}
};
function thaiEntry(kind,name){
 const entry=THAI_TEXT[kind]?.[dexId(name)];
 return entry || {title:'',effect:'ยังไม่มีคำอธิบายภาษาไทยของรายการนี้',use:'เปิดดูข้อมูลต้นฉบับเพื่อตรวจรายละเอียด',limit:'อย่าอนุมานผลจากชื่ออย่างเดียว',reviewed:false};
}
function thaiName(kind,name){const entry=thaiEntry(kind,name);return entry.title?name+' — '+entry.title:name;}
function thaiOption(kind,name){
 const entry=thaiEntry(kind,name);const short=entry.title || (entry.effect.length>58?entry.effect.slice(0,58)+'…':entry.effect);return name+' — '+short;
}
function thaiMoveTag(name){
 const m=MOVE_BY_ID[dexId(name)];if(!m)return '';
 const id=m.id;
 if(['tailwind','trickroom','icywind','electroweb','thunderwave','scaryface','stringshot','bulldoze','lowsweep','quash','afteryou'].includes(id))return 'คุมความเร็ว / ลำดับ';
 if(['protect','detect','wideguard','quickguard','spikyshield','kingsshield','banefulbunker','burningbulwark','silktrap','obstruct','matblock','endure'].includes(id))return 'ป้องกัน';
 if(['followme','ragepowder','helpinghand','lifedew','healpulse','aromaticmist','coaching','decorate','allyswitch','healingwish','lunarblessing','lunardance'].includes(id))return 'ช่วยเพื่อน';
 return m.category==='Status'?'ตั้งแผน / รบกวน':'โจมตี';
}
function useThaiInterface(){
 const {ref,watch,computed}=Vue;const beginnerMode=ref(true),helpTopic=ref('');
 try{const saved=localStorage.getItem('vgc-lab-beginner');if(saved!==null)beginnerMode.value=saved!=='false';}catch{}
 watch(beginnerMode,value=>{try{localStorage.setItem('vgc-lab-beginner',String(value));}catch{}});
 const helpContent=computed(()=>THAI_GLOSSARY[helpTopic.value]||null);
 const typeLabel=type=>THAI_TYPES[type]?THAI_TYPES[type]+' ('+type+')':type;
 const statLabel=stat=>THAI_STATS[stat]||stat;
 const categoryLabel=category=>THAI_CATEGORIES[category]||category;
 const natureLabel=n=>n.name+(n.plus?' · เพิ่ม'+statLabel(n.plus)+' ลด'+statLabel(n.minus):' · ไม่เพิ่มหรือลด');
 return {beginnerMode,helpTopic,helpContent,glossary:THAI_GLOSSARY,typeLabel,statLabel,categoryLabel,natureLabel,thaiEntry,thaiName,thaiOption,thaiMoveTag};
}
