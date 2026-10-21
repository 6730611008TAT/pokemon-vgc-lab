// Recommendations are editorial heuristics, not tournament usage statistics.
const TEAM_MOVE_GUIDES={
 incineroar:['Fake Out','Flare Blitz','Knock Off','Parting Shot'],
 rillaboom:['Fake Out','Grassy Glide','Wood Hammer','U-turn'],
 amoonguss:['Spore','Rage Powder','Pollen Puff','Protect'],
 tornadus:['Tailwind','Bleakwind Storm','Taunt','Protect'],
 whimsicott:['Tailwind','Moonblast','Encore','Protect'],
 gholdengo:['Make It Rain','Shadow Ball','Nasty Plot','Protect'],
 fluttermane:['Moonblast','Shadow Ball','Dazzling Gleam','Protect'],
 urshifurapidstrike:['Surging Strikes','Close Combat','Aqua Jet','Protect'],
 urshifu:['Wicked Blow','Close Combat','Sucker Punch','Protect'],
 pelipper:['Tailwind','Hurricane','Weather Ball','Protect'],
 farigiraf:['Trick Room','Psychic','Helping Hand','Protect'],
 torkoal:['Eruption','Heat Wave','Earth Power','Protect'],
 ironhands:['Fake Out','Drain Punch','Wild Charge','Protect'],
 garchomp:['Stomping Tantrum','Dragon Claw','Rock Slide','Protect'],
 kingambit:['Kowtow Cleave','Sucker Punch','Iron Head','Protect']
};
const SIMPLE_ATTACKS=['Flamethrower','Heat Wave','Fire Punch','Waterfall','Surf','Scald','Liquidation','Hydro Pump','Energy Ball','Leaf Blade','Giga Drain','Seed Bomb','Thunderbolt','Thunder Punch','Volt Switch','Ice Beam','Ice Spinner','Ice Punch','Drain Punch','Aura Sphere','Close Combat','Sludge Bomb','Poison Jab','Earth Power','Stomping Tantrum','Air Slash','Hurricane','Psychic','Psyshock','Bug Buzz','X-Scissor','Power Gem','Rock Slide','Shadow Ball','Shadow Claw','Dragon Pulse','Dragon Claw','Dark Pulse','Knock Off','Crunch','Flash Cannon','Iron Head','Moonblast','Play Rough','Dazzling Gleam','Hyper Voice','Body Slam','Tri Attack','Return'];
function moveRecommendation(slot,move){
 if(!slot?.pokemon)return '';
 const p=slot.pokemon,id=move.id,physical=p.baseStats.atk>=p.baseStats.spa;
 if((slot.item==='Assault Vest'||['Choice Band','Choice Specs','Choice Scarf'].includes(slot.item))&&move.category==='Status')return '';
 if(slot.moves.filter(Boolean).some(m=>m!==move.name&&m==='Trick Room')&&id==='tailwind')return '';
 if(slot.moves.filter(Boolean).some(m=>m!==move.name&&m==='Tailwind')&&id==='trickroom')return '';
 const curated=TEAM_MOVE_GUIDES[p.id]||[];
 if(curated.includes(move.name))return id==='protect'?'ช่วยหลบดาเมจหนึ่งเทิร์นขณะเพื่อนลงมือ':id==='fakeout'?'ช่วยสร้างจังหวะให้เพื่อนในเทิร์นแรกที่ลงสนาม':id==='tailwind'?'ช่วยคุมความเร็วของทั้งทีม':id==='trickroom'?'เป็นทางเลือกสำหรับแผนทีมช้า ควรดูความเร็วเพื่อนด้วย':'เป็นตัวเลือกเริ่มต้นสำหรับบทบาทของโปเกมอนตัวนี้';
 if(id==='protect')return 'ป้องกันตัวเพื่อให้เพื่อนร่วมทีมมีจังหวะลงมือ';
 if(SIMPLE_ATTACKS.includes(move.name)&&p.types.includes(move.type)&&((physical&&move.category==='Physical')||(!physical&&move.category==='Special')))return 'ท่าตรงธาตุและใช้ด้านโจมตีที่เด่นของตัวนี้';
 return '';
}
function itemRecommendation(slot,item){
 if(!slot?.pokemon)return '';
 const p=slot.pokemon,chosen=slot.moves.filter(Boolean),status=chosen.some(name=>MOVE_BY_ID[dexId(name)]?.category==='Status');
 if(p.requiredItem)return item.name===p.requiredItem?'ไอเทมที่ร่างนี้ต้องถือ':'';
 if(p.id==='ogerpon'&&item.name!=='Sitrus Berry')return '';
 if(item.name==='Assault Vest')return chosen.length===4&&!status?'ชุดที่เลือกมีแต่ท่าโจมตี จึงใช้เสื้อเกราะพิเศษได้':'';
 if(['Choice Band','Choice Specs','Choice Scarf'].includes(item.name)){
  if(status||chosen.length<4)return '';
  if(item.name==='Choice Band'&&chosen.every(n=>MOVE_BY_ID[dexId(n)]?.category==='Physical'))return 'ชุดท่าเป็นกายภาพทั้งหมด แต่ต้องยอมล็อกท่า';
  if(item.name==='Choice Specs'&&chosen.every(n=>MOVE_BY_ID[dexId(n)]?.category==='Special'))return 'ชุดท่าเป็นพิเศษทั้งหมด แต่ต้องยอมล็อกท่า';
  return '';
 }
 if(item.name==='Sitrus Berry')return 'ตัวเลือกเริ่มต้นสำหรับฟื้นพลังเมื่อเหลือไม่เกินครึ่ง';
 if(item.name==='Focus Sash'&&p.baseStats.hp+Math.min(p.baseStats.def,p.baseStats.spd)<150)return 'ช่วยตัวที่รับการโจมตีไม่เก่งรอดหนึ่งครั้งเมื่อพลังเต็ม';
 if(item.name==='Leftovers'&&p.baseStats.hp+Math.max(p.baseStats.def,p.baseStats.spd)>=180)return 'เหมาะเป็นทางเลือกให้ตัวรับที่ต้องการอยู่สนามหลายเทิร์น';
 return '';
}
function natureRecommendation(slot,nature,teamHasTrickRoom=false){
 if(!slot?.pokemon)return '';
 const p=slot.pokemon,moves=slot.moves.filter(Boolean).map(n=>MOVE_BY_ID[dexId(n)]).filter(Boolean);
 const physical=moves.some(m=>m.category==='Physical'),special=moves.some(m=>m.category==='Special');
 const slowPlan=slot.moves.includes('Trick Room')||(teamHasTrickRoom&&p.baseStats.spe<=60);
 const selected=moves.length>0;
 let side=physical&&special?'mixed':physical?'physical':special?'special':selected?'support':p.baseStats.atk>=p.baseStats.spa?'physical':'special';
 const basis=selected?'ตามชุดท่าที่เลือก':'ตามค่าสเตตัสพื้นฐาน ยังไม่ได้เลือกท่า';
 if(slowPlan){
  if((side==='physical'||side==='mixed')&&nature.name==='Brave')return 'เพิ่มพลังโจมตี ลดความเร็ว เหมาะเป็นตัวเลือกสำหรับแผน Trick Room · '+basis;
  if((side==='special'||side==='mixed')&&nature.name==='Quiet')return 'เพิ่มพลังโจมตีพิเศษ ลดความเร็ว เหมาะเป็นตัวเลือกสำหรับแผน Trick Room · '+basis;
  if(side==='support'&&nature.name==='Relaxed')return 'เพิ่มพลังป้องกัน ลดความเร็ว สำหรับตัวสนับสนุนในแผน Trick Room';
  if(side==='support'&&nature.name==='Sassy')return 'เพิ่มพลังป้องกันพิเศษ ลดความเร็ว สำหรับตัวสนับสนุนในแผน Trick Room';
  return '';
 }
 if(side==='mixed'){
  if(p.baseStats.spe>=70&&nature.name==='Hasty')return 'เพิ่มความเร็วโดยไม่ลดพลังโจมตีทั้งสองด้าน แต่แลกกับพลังป้องกันที่ลดลง';
  if(p.baseStats.spe>=70&&nature.name==='Naive')return 'เพิ่มความเร็วโดยไม่ลดพลังโจมตีทั้งสองด้าน แต่แลกกับพลังป้องกันพิเศษที่ลดลง';
  return '';
 }
 if(side==='support'){
  if(nature.name==='Bold')return 'เพิ่มพลังป้องกัน แลกพลังโจมตี เพราะชุดที่เลือกไม่มีท่าโจมตี';
  if(nature.name==='Calm')return 'เพิ่มพลังป้องกันพิเศษ แลกพลังโจมตี เพราะชุดที่เลือกไม่มีท่าโจมตี';
  if(p.baseStats.spe>=80&&nature.name==='Timid')return 'เพิ่มความเร็วเพื่อช่วยให้ใช้ท่าสนับสนุนก่อน โดยลดพลังโจมตีที่ไม่ได้ใช้';
  return '';
 }
 if(side==='physical'){
  if(nature.name==='Adamant')return 'เพิ่มพลังโจมตีกายภาพ แลกพลังโจมตีพิเศษที่ชุดนี้ไม่เน้น · '+basis;
  if(p.baseStats.spe>=70&&nature.name==='Jolly')return 'เพิ่มความเร็ว แลกพลังโจมตีพิเศษที่ชุดนี้ไม่เน้น · '+basis;
 }else{
  if(nature.name==='Modest')return 'เพิ่มพลังโจมตีพิเศษ แลกพลังโจมตีกายภาพที่ชุดนี้ไม่เน้น · '+basis;
  if(p.baseStats.spe>=70&&nature.name==='Timid')return 'เพิ่มความเร็ว แลกพลังโจมตีกายภาพที่ชุดนี้ไม่เน้น · '+basis;
 }
 return '';
}
