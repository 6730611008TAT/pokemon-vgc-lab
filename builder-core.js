const CATALOG_BY_ID = Object.fromEntries(CATALOG.pokemon.map(p => [p.id, p]));
const dexId = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const findPokemon = name => CATALOG_BY_ID[CATALOG.aliases[name] || dexId(name)] || null;
const MOVE_BY_ID = Object.fromEntries(CATALOG.moves.map(m => [m.id, m]));
const ITEM_BY_ID = Object.fromEntries(CATALOG.items.map(m => [m.id, m]));
const ABILITY_BY_ID = Object.fromEntries(CATALOG.abilities.map(m => [m.id, m]));
const STAT_KEYS = ['hp','atk','def','spa','spd','spe'];
const freshSlot = () => ({pokemon:null,evs:Object.fromEntries(STAT_KEYS.map(k=>[k,0])),ivs:Object.fromEntries(STAT_KEYS.map(k=>[k,31])),statPoints:Object.fromEntries(STAT_KEYS.map(k=>[k,0])),nature:'Timid',ability:'',item:'',teraType:'',moves:['','','',''],level:50,nickname:'',gender:'',shiny:false,happiness:255});
const RULE_PROFILES = [
 {id:'national',name:'National Dex Doubles · จัดทีมอิสระ',desc:'รวมหลายยุค ใช้ร่าง Mega ได้ ตรวจ Species / Item Clause และชุดข้อมูลพื้นฐาน ไม่ใช่ Regulation ทางการ'},
 {id:'sv',name:'Scarlet / Violet Doubles · พื้นฐาน',desc:'เฉพาะตัวและท่าที่มีข้อมูลใน SV ไม่มี Mega; ยังไม่กำหนดจำนวน Restricted'},
 {id:'regh',name:'SV Regulation H · ชุดย้อนหลัง 2024',desc:'ตัด Legendary, Mythical และ Paradox ออก ตรวจเบื้องต้น ไม่ใช่กติกาปัจจุบัน'}
];
function useTeamLibrary(teamSlots) {
 const {ref,computed,watch}=Vue;
 const storageKey='vgc-lab-teams-v2';
 const teamName=ref('ทีมของฉัน'),activeTeamId=ref(''),savedTeams=ref([]),saveStatus=ref('ยังไม่บันทึก'),ruleProfile=ref('national'),statMode=ref('vgc'),storageError=ref('');
 let switching=false;
 const newId=()=>globalThis.crypto?.randomUUID?.() || 'team-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 const snapshot=()=>JSON.parse(JSON.stringify(teamSlots.value));
 function hydrate(slots) {
  if(!Array.isArray(slots)||slots.length!==6)throw Error('ข้อมูลทีมไม่ครบ 6 ช่อง');
  return slots.map(s=>{
   const out=freshSlot(); if(!s||typeof s!=='object')throw Error('ข้อมูลช่องทีมเสียหาย');
   if(s.pokemon){out.pokemon=findPokemon(s.pokemon.name);if(!out.pokemon)throw Error('ไม่พบ '+s.pokemon.name);}
   for(const key of ['evs','ivs'])for(const stat of STAT_KEYS){const n=s[key]?.[stat];if(!Number.isInteger(n)||n<0||n>(key==='evs'?252:31))throw Error('ค่า '+key+' ไม่ถูกต้อง');out[key][stat]=n;}
   if(s.statPoints!==undefined){for(const stat of STAT_KEYS){const n=s.statPoints?.[stat];if(!Number.isInteger(n)||n<0||n>32)throw Error('Stat Points ไม่ถูกต้อง');out.statPoints[stat]=n;}if(Object.values(out.statPoints).reduce((a,b)=>a+b,0)>66)throw Error('Stat Points รวมเกิน 66');}
   for(const k of ['nature','ability','item','teraType','nickname','gender'])if(typeof s[k]==='string')out[k]=s[k].slice(0,100);
   out.moves=Array.from({length:4},(_,i)=>typeof s.moves?.[i]==='string'?s.moves[i].slice(0,100):'');
   if(s.level!==undefined&&(!Number.isInteger(s.level)||s.level<1||s.level>100))throw Error('Level ไม่ถูกต้อง');
   out.level=s.level||50;out.shiny=s.shiny===true;out.happiness=Number.isInteger(s.happiness)?Math.max(0,Math.min(255,s.happiness)):255;
   return out;
  });
 }
 try {
  const raw=localStorage.getItem(storageKey);
  if(raw){const data=JSON.parse(raw);if(data.version!==2||!Array.isArray(data.teams)||!data.teams.length)throw Error('รูปแบบข้อมูลไม่รองรับ');
   savedTeams.value=data.teams.map(t=>({id:String(t.id),name:String(t.name).slice(0,80),rule:RULE_PROFILES.some(r=>r.id===t.rule)?t.rule:'national',statMode:t.statMode==='champions'?'champions':'vgc',slots:hydrate(t.slots)}));
   const active=savedTeams.value.find(t=>t.id===data.active)||savedTeams.value[0];activeTeamId.value=active.id;teamName.value=active.name;ruleProfile.value=active.rule;statMode.value=active.statMode;teamSlots.value=hydrate(active.slots);saveStatus.value='โหลดทีมที่บันทึกไว้แล้ว';
  }
 } catch(e){storageError.value='อ่านข้อมูลที่บันทึกไม่ได้: '+e.message+' — ข้อมูลเดิมยังไม่ถูกเขียนทับ';}
 if(!activeTeamId.value)activeTeamId.value=newId();
 function persist(){
  if(switching)return;
  if(storageError.value){saveStatus.value='ยังไม่บันทึก: โปรดส่งออกทีมสำรอง';return;}
  const record={id:activeTeamId.value,name:teamName.value.trim()||'ทีมไม่มีชื่อ',rule:ruleProfile.value,statMode:statMode.value,slots:snapshot()};
  const index=savedTeams.value.findIndex(t=>t.id===record.id);if(index<0)savedTeams.value.push(record);else savedTeams.value[index]=record;
  try{localStorage.setItem(storageKey,JSON.stringify({version:2,active:activeTeamId.value,teams:savedTeams.value},(key,value)=>key==='pokemon'&&value?{name:value.name}:value));saveStatus.value='บันทึกอัตโนมัติแล้ว';}
  catch(e){saveStatus.value='บันทึกไม่สำเร็จ — พื้นที่เก็บข้อมูลอาจเต็มหรือถูกปิด';}
 }
 watch([teamSlots,teamName,ruleProfile,statMode],persist,{deep:true,flush:'sync'});
 function newTeam(copy=false){persist();const previous=snapshot();switching=true;activeTeamId.value=newId();teamName.value=copy?teamName.value+' (สำเนา)':'ทีมใหม่';teamSlots.value=copy?hydrate(previous):Array.from({length:6},freshSlot);switching=false;persist();}
 function loadTeam(id){persist();const t=savedTeams.value.find(x=>x.id===id);if(!t)return;const copy=JSON.parse(JSON.stringify(t));switching=true;activeTeamId.value=copy.id;teamName.value=copy.name;ruleProfile.value=copy.rule;statMode.value=copy.statMode==='champions'?'champions':'vgc';teamSlots.value=hydrate(copy.slots);switching=false;persist();}
 // One atomic replacement prevents partially imported teams from being saved.
 function storeImported(slots,options={}){const imported=hydrate(slots);persist();switching=true;activeTeamId.value=newId();teamName.value=String(options.name||'ทีมที่นำเข้า').slice(0,80);if(RULE_PROFILES.some(r=>r.id===options.rule))ruleProfile.value=options.rule;statMode.value=options.statMode==='champions'?'champions':'vgc';teamSlots.value=imported;switching=false;persist();}
 return {teamName,activeTeamId,savedTeams,saveStatus,ruleProfile,statMode,storageError,newTeam,loadTeam,storeImported,persist};
}
function exportShowdown(slots,statMode='vgc'){
 const statNames={hp:'HP',atk:'Atk',def:'Def',spa:'SpA',spd:'SpD',spe:'Spe'};
 return slots.filter(s=>s.pokemon).map(s=>{
  let header=s.nickname?`${s.nickname} (${s.pokemon.name})`:s.pokemon.name;if(s.gender)header+=` (${s.gender})`;if(s.item)header+=' @ '+s.item;
  const lines=[header,'Ability: '+s.ability,'Level: '+(statMode==='champions'?50:s.level)];if(s.shiny)lines.push('Shiny: Yes');if(s.happiness!==255)lines.push('Happiness: '+s.happiness);if(s.teraType)lines.push('Tera Type: '+s.teraType);
  if(statMode==='champions'){
   const sp=STAT_KEYS.filter(k=>s.statPoints[k]).map(k=>s.statPoints[k]+' '+statNames[k]);lines.push('SPs: '+(sp.length?sp.join(' / '):'0 HP'));
  }else{
   const ev=STAT_KEYS.filter(k=>s.evs[k]).map(k=>s.evs[k]+' '+statNames[k]);if(ev.length)lines.push('EVs: '+ev.join(' / '));
  }
  lines.push(s.nature+' Nature');
  if(statMode!=='champions'){const iv=STAT_KEYS.filter(k=>s.ivs[k]!==31).map(k=>s.ivs[k]+' '+statNames[k]);if(iv.length)lines.push('IVs: '+iv.join(' / '));}
  s.moves.filter(Boolean).forEach(m=>lines.push('- '+m));return lines.join('\n');
 }).join('\n\n');
}
function importShowdown(text,natureNames,types){
 const blocks=text.trim().replace(/\r/g,'').split(/\n\s*\n/).filter(Boolean);if(!text.trim()||blocks.length>6)throw Error('นำเข้าได้ครั้งละ 1–6 ตัว');
 const hasSPs=blocks.some(block=>/^SPs:/m.test(block));
 if(hasSPs&&blocks.some(block=>/^(EVs|IVs):/m.test(block)))throw Error('ทีม Champions ต้องใช้ SPs เท่านั้น ไม่ผสม EVs หรือ IVs');
 const slots=blocks.map((block,index)=>{
  const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);let head=lines.shift();if(head.startsWith('==='))throw Error('วางเฉพาะข้อความของทีม ไม่รวมชื่อกล่อง');
  const s=freshSlot();const at=head.lastIndexOf(' @ ');if(at>=0){s.item=head.slice(at+3);head=head.slice(0,at);if(!ITEM_BY_ID[dexId(s.item)])throw Error('ไม่พบไอเทม '+s.item);s.item=ITEM_BY_ID[dexId(s.item)].name;}
  const gender=head.match(/ \(([MF])\)$/);if(gender){s.gender=gender[1];head=head.slice(0,-4);}
  let pokemon=findPokemon(head);if(!pokemon){const m=head.match(/^(.*) \(([^()]+)\)$/);if(m){s.nickname=m[1];pokemon=findPokemon(m[2]);}}
  if(!pokemon)throw Error('ไม่พบโปเกมอน: '+head+' (รองรับสายพันธุ์หลักและร่างที่อยู่ในคลัง)');s.pokemon=pokemon;s.ability=pokemon.abilities[0];s.teraType=pokemon.requiredTeraType||pokemon.types[0];
  const seen=new Set();let count=0;
  for(const line of lines){
   if(line.startsWith('- ')){if(count>=4)throw Error('ท่าเกิน 4 ช่อง');const m=MOVE_BY_ID[dexId(line.slice(2))];if(!m)throw Error('ไม่พบท่า '+line.slice(2));s.moves[count++]=m.name;continue;}
   const nat=line.match(/^(.+) Nature$/);if(nat){if(!natureNames.includes(nat[1]))throw Error('Nature ไม่ถูกต้อง');s.nature=nat[1];continue;}
   const colon=line.indexOf(':');const key=line.slice(0,colon),value=line.slice(colon+1).trim();if(colon<0||seen.has(key))throw Error('บรรทัดไม่รองรับหรือซ้ำ: '+line);seen.add(key);
   if(key==='Ability'){if(!pokemon.abilities.includes(value))throw Error('Ability ไม่ตรงกับ '+pokemon.name);s.ability=value;}
   else if(key==='Tera Type'){if(![...types,'Stellar'].includes(value))throw Error('Tera Type ไม่ถูกต้อง');s.teraType=value;}
   else if(key==='Level'||key==='Happiness'){const n=Number(value);if(!Number.isInteger(n)||n< (key==='Level'?1:0)||n>(key==='Level'?100:255))throw Error(key+' ไม่ถูกต้อง');s[key==='Level'?'level':'happiness']=n;}
   else if(key==='Shiny'){if(!['Yes','No'].includes(value))throw Error('Shiny ไม่ถูกต้อง');s.shiny=value==='Yes';}
   else if(key==='EVs'||key==='IVs'||key==='SPs'){const obj=key==='EVs'?s.evs:key==='IVs'?s.ivs:s.statPoints;const assigned=new Set();for(const part of value.split('/')){const m=part.trim().match(/^(\d+) (HP|Atk|Def|SpA|SpD|Spe)$/);if(!m||assigned.has(m[2]))throw Error(key+' ไม่ถูกต้อง');assigned.add(m[2]);const n=Number(m[1]);if(n>(key==='EVs'?252:key==='IVs'?31:32))throw Error(key+' เกินขีดจำกัด');obj[m[2].toLowerCase()]=n;}const total=Object.values(obj).reduce((a,b)=>a+b,0);if(key==='EVs'&&total>510)throw Error('EV รวมเกิน 510');if(key==='SPs'&&total>66)throw Error('Stat Points รวมเกิน 66');}
   else throw Error('ยังไม่รองรับบรรทัด: '+line);
  }
  return s;
 });
 while(slots.length<6)slots.push(freshSlot());slots.statMode=hasSPs?'champions':'vgc';return slots;
}
