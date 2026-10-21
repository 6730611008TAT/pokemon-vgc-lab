const { createApp, ref, computed, watch } = Vue;

createApp({
    components: { PokemonArtwork, ItemArtwork },
    setup() {
        // --- State Management ---
        const currentTab = ref('home');
        const isLoggedin = ref(false);
        const typesList = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
        
        // Natures: ส่งผล +10% และ -10% ต่อสเตตัส
        const natures = [
            { name: "Timid", plus: "spe", minus: "atk" }, { name: "Modest", plus: "spa", minus: "atk" },
            { name: "Jolly", plus: "spe", minus: "spa" }, { name: "Adamant", plus: "atk", minus: "spa" },
            { name: "Bold", plus: "def", minus: "atk" }, { name: "Impish", plus: "def", minus: "spa" },
            { name: "Careful", plus: "spd", minus: "spa" }, { name: "Calm", plus: "spd", minus: "atk" },
            { name: "Brave", plus: "atk", minus: "spe" }, { name: "Quiet", plus: "spa", minus: "spe" }
        ];

        const natureGrid=[['Hardy','Lonely','Brave','Adamant','Naughty'],['Bold','Docile','Relaxed','Impish','Lax'],['Timid','Hasty','Serious','Jolly','Naive'],['Modest','Mild','Quiet','Bashful','Rash'],['Calm','Gentle','Sassy','Careful','Quirky']];
        const natureStats=['atk','def','spe','spa','spd'];
        natures.splice(0,natures.length,...natureGrid.flatMap((row,i)=>row.map((name,j)=>({name,plus:i===j?'':natureStats[i],minus:i===j?'':natureStats[j]}))));
        // --- Team Builder State ---
        const teamSlots = ref(Array.from({length:6}, freshSlot));
        const library = useTeamLibrary(teamSlots);
        const {ruleProfile} = library;


        const showSearchModal = ref(false);
        const activeSearchSlot = ref(0);
        const searchQuery = ref("");
        const selectedGeneration = ref('all');
        const selectedType = ref('all'), selectedRole = ref('all'), onlyEligible = ref(false), visibleCount = ref(60);
        const roleOptions = [{id:'attacker',name:'ตัวโจมตี'},{id:'defender',name:'ตัวรับ'},{id:'support',name:'สนับสนุน'},{id:'speed',name:'คุมความเร็ว'}];
        const generationMode = ref('generation');
        const generationOptions = [
            { id: 1, region: 'Kanto' }, { id: 2, region: 'Johto' },
            { id: 3, region: 'Hoenn' }, { id: 4, region: 'Sinnoh' },
            { id: 5, region: 'Unova' }, { id: 6, region: 'Kalos' },
            { id: 7, region: 'Alola' }, { id: 8, region: 'Galar / Hisui' },
            { id: 9, region: 'Paldea / Legends: Z-A' }
        ];
        const generationLabel = (name) => {
            const info = findPokemon(name);
            if (!info) return '';
            return `Gen ${info.generation}` + (info.formGeneration !== info.generation ? ` · ร่าง Gen ${info.formGeneration}` : '');
        };
        const clearPokemonFilters = () => {
            searchQuery.value = '';
            selectedGeneration.value = 'all';
            generationMode.value = 'generation';
            selectedType.value='all'; selectedRole.value='all'; onlyEligible.value=false;
        };

        // --- Home Guide Data ---
        const steps = [
            { title: "Define the Win Condition", desc: "กำหนดเป้าหมายของทีม เช่น เน้นบุกเร็ว(Hyper Offense) หรือค่อยๆ คุมบอร์ด(Balance)" },
            { title: "Choose the Core", desc: "เลือกโปเกมอนแกนหลัก 2-3 ตัวที่คอมโบกันได้ดี (เช่น แกน ไฟ/น้ำ/พืช)" },
            { title: "Balance & Synergy", desc: "เติมตำแหน่งที่ขาด เช่น แทงค์รับดาเมจ(Pivot), ตัวป่วน(Support)" },
            { title: "Items & Abilities", desc: "ใส่ไอเทมให้เข้ากับแผน เช่น Focus Sash ให้ตัวบาง, Assault Vest ให้ตัวแทงค์" },
            { title: "Speed Control", desc: "ทุกทีมต้องมีวิธีคุมความเร็ว เช่น Tailwind, Icy Wind, หรือ Trick Room" },
            { title: "Test & Refine", desc: "นำไปทดสอบจริงเพื่อหาจุดอ่อนที่คาดไม่ถึง และกลับมาปรับแต่ง EVs อีกครั้ง" }
        ];

        // --- Helper Functions ---
        const getTypeColor = (type) => {
            const colors = {
                Normal: "bg-gray-400 text-white", Fire: "bg-red-500 text-white", Water: "bg-blue-500 text-white",
                Grass: "bg-green-500 text-white", Electric: "bg-yellow-400 text-black", Ice: "bg-cyan-300 text-black",
                Fighting: "bg-orange-600 text-white", Poison: "bg-purple-500 text-white", Ground: "bg-yellow-600 text-white",
                Flying: "bg-indigo-300 text-black", Psychic: "bg-pink-500 text-white", Bug: "bg-lime-500 text-black",
                Rock: "bg-yellow-700 text-white", Ghost: "bg-indigo-700 text-white", Dragon: "bg-indigo-600 text-white",
                Dark: "bg-slate-700 text-white", Steel: "bg-slate-500 text-white", Fairy: "bg-pink-300 text-black"
            };
            return colors[type] || "bg-gray-500";
        };

        const getTypeEffectiveness = (atk, def) => {
            let eff = TYPE_EFFECTIVENESS[atk][def];
            return eff === undefined ? 1 : eff;
        };

        const getTypeEffectColor = (val) => {
            if(val === 2) return "text-green-400 bg-green-900/30";
            if(val === 0.5) return "text-red-400 bg-red-900/30";
            if(val === 0) return "text-gray-500 bg-gray-800";
            return "text-slate-300";
        };

        // --- Team Builder Logic ---
        const openPokemonSearch = (index) => {
            activeSearchSlot.value = index;
            searchQuery.value = "";
            showSearchModal.value = true;
        };

        const selectPokemon = (pokemon) => {
            const slot=freshSlot(); slot.pokemon=pokemon;slot.ability=pokemon.abilities[0];slot.teraType=pokemon.requiredTeraType||pokemon.types[0];slot.item=pokemon.requiredItem||'';
            teamSlots.value[activeSearchSlot.value]=slot;
            showSearchModal.value = false;
        };

        const removePokemon = (index) => {
            teamSlots.value[index] = freshSlot();
        };

        const resetTeam = () => {
            teamSlots.value = Array.from({length:6},freshSlot);
            aiAnalyzed.value = false;
        };

        const totalEVs = (evs) => Object.values(evs).reduce((a, b) => a + b, 0);

        // VGC Level 50 Stat Calculation Formula
        const calculateStat = (slot, statKey) => {
            if(!slot.pokemon) return 0;
            const base = slot.pokemon.baseStats[statKey];
            const iv = slot.ivs[statKey];
            const ev = slot.evs[statKey];
            const level = slot.level || 50;
            
            if(statKey === 'hp') {
                if(slot.pokemon.id === 'shedinja') return 1;
                return Math.floor(( (2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
            } else {
                let calc = Math.floor(( (2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
                const nat = natures.find(n => n.name === slot.nature);
                if(nat?.plus === statKey) calc = Math.floor(calc * 1.1);
                if(nat?.minus === statKey) calc = Math.floor(calc * 0.9);
                return calc;
            }
        };

        const filteredPokemon = computed(() => {
            const q = searchQuery.value.trim().toLowerCase();
            return POKEMON_DB.filter(p => {
                const matchesText = !q || p.name.toLowerCase().includes(q) || p.types.some(t => t.toLowerCase().includes(q)||(THAI_TYPES[t]||'').includes(q));
                const matchesGen = selectedGeneration.value === 'all' || p[generationMode.value] === Number(selectedGeneration.value);
                return matchesText && matchesGen && (selectedType.value==='all'||p.types.includes(selectedType.value)) && (selectedRole.value==='all'||p.roles.includes(selectedRole.value)) && (!onlyEligible.value||pokemonEligibility(p).length===0);
            });
        });

        // คำนวณจุดอ่อนรวมของทีม (เพื่อแสดงคำเตือน)
        const calculateTeamWeaknesses = computed(() => {
            let weakCount = {};
            typesList.forEach(t => weakCount[t] = 0);

            teamSlots.value.forEach(slot => {
                if(!slot.pokemon) return;
                typesList.forEach(atkType => {
                    let eff = 1;
                    slot.pokemon.types.forEach(defType => {
                        eff *= (TYPE_EFFECTIVENESS[atkType][defType] !== undefined ? TYPE_EFFECTIVENESS[atkType][defType] : 1);
                    });
                    if(eff > 1) weakCount[atkType]++;
                });
            });
            // กรองเอาเฉพาะธาตุที่ทีมแพ้ 2 ตัวขึ้นไป
            return Object.fromEntries(Object.entries(weakCount).filter(([k,v]) => v >= 2).sort((a,b) => b[1] - a[1]));
        });

        const hasMajorWeakness = computed(() => {
            return Object.values(calculateTeamWeaknesses.value).some(v => v >= 3);
        });

        // --- AI Analyst Mockup ---
        const aiLoading = ref(false);
        const aiAnalyzed = ref(false);
        const aiReport = ref({ strengths: "", weaknesses: "", playstyle: "", counters: "" });

        // --- Sample Teams ---
        const selectedTeam = ref(null);
        const viewTeam = (team) => {
            selectedTeam.value = team;
        };

        const ruleProfiles=RULE_PROFILES;
        const currentRule=computed(()=>RULE_PROFILES.find(r=>r.id===ruleProfile.value));
        const pokemonEligibility=(p)=>{
            if(ruleProfile.value==='national')return [];
            const errors=[];if(!p.sv)errors.push('ไม่มีใน Scarlet / Violet');
            if(ruleProfile.value==='regh'&&p.tags.some(t=>/Legendary|Mythical|Paradox/.test(t)))errors.push('กลุ่มที่ Regulation H ไม่อนุญาต');
            return errors;
        };
        const eligibleMoves=slot=> (ruleProfile.value==='national'?slot.pokemon.learnset:slot.pokemon.gen9Moves).map(id=>MOVE_BY_ID[id]).filter(Boolean).sort((a,b)=>Number(!!moveRecommendation(slot,b))-Number(!!moveRecommendation(slot,a))||a.name.localeCompare(b.name));
        const itemOptions= computed(()=>CATALOG.items.filter(i=>ruleProfile.value==='national'||(!i.isNonstandard&&(!i.gen||i.gen<=9))).sort((a,b)=>a.name.localeCompare(b.name)));
        const originalDescription=(kind,name)=>({moves:MOVE_BY_ID,items:ITEM_BY_ID,abilities:ABILITY_BY_ID}[kind]?.[dexId(name)]?.desc || 'ไม่มีคำอธิบายในชุดข้อมูลนี้');
        const description=(kind,name)=>thaiEntry(kind,name).effect;
        const thaiInterface=useThaiInterface();
        const teraView=ref(false);
        const defenseMultiplier=(slot,type)=>{
            if(!slot.pokemon)return null;
            let defending=teraView.value&&slot.teraType&&slot.teraType!=='Stellar'?[slot.teraType]:slot.pokemon.types;
            let value=defending.reduce((n,t)=>n*getTypeEffectiveness(type,t),1);
            const ab=slot.ability;
            if((type==='Ground'&&ab==='Levitate')||(type==='Fire'&&['Flash Fire','Well-Baked Body'].includes(ab))||(type==='Water'&&['Water Absorb','Storm Drain','Dry Skin'].includes(ab))||(type==='Electric'&&['Volt Absorb','Lightning Rod','Motor Drive'].includes(ab))||(type==='Grass'&&ab==='Sap Sipper'))return 0;
            if(ab==='Wonder Guard'&&value<=1)return 0;
            if(ab==='Thick Fat'&&['Fire','Ice'].includes(type))value*=.5;
            if(['Filter','Solid Rock','Prism Armor'].includes(ab)&&value>1)value*=.75;
            if(ab==='Dry Skin'&&type==='Fire')value*=1.25;
            if(ab==='Fluffy'&&type==='Fire')value*=2;
            if((ab==='Heatproof'&&type==='Fire')||(ab==='Water Bubble'&&type==='Fire'))value*=.5;
            return value;
        };
        const defenseColor=value=>value===null?'text-slate-600':value===0?'bg-slate-700 text-slate-300':value>1?'bg-red-950 text-red-300':value<1?'bg-emerald-950 text-emerald-300':'text-slate-400';
        const validationIssues=computed(()=>{
            const result=[],species=new Set(),items=new Set();let count=0;
            teamSlots.value.forEach((slot,index)=>{
                if(!slot.pokemon)return;count++;const p=slot.pokemon,prefix=`ช่อง ${index+1} · ${p.name}: `;
                const add=text=>result.push(prefix+text);
                pokemonEligibility(p).forEach(add);
                if(species.has(p.dex))add('โปเกมอนสายพันธุ์ซ้ำ (Species Clause)');species.add(p.dex);
                if(slot.item){if(items.has(slot.item))add('ไอเทมซ้ำ (Item Clause)');items.add(slot.item);if(!ITEM_BY_ID[dexId(slot.item)])add('ไม่พบไอเทม');}
                if(p.requiredItem&&slot.item!==p.requiredItem)add('ร่างนี้ต้องถือ '+p.requiredItem);
                if(p.requiredTeraType&&slot.teraType!==p.requiredTeraType)add('ร่างนี้ต้องใช้ Tera '+p.requiredTeraType);
                if(!p.abilities.includes(slot.ability))add('Ability ไม่ตรงสายพันธุ์');
                if(totalEVs(slot.evs)>510)add('EV รวมเกิน 510');
                for(const stat of STAT_KEYS){if(!Number.isInteger(slot.evs[stat])||slot.evs[stat]<0||slot.evs[stat]>252)add('EV '+stat+' ต้องอยู่ในช่วง 0–252');if(!Number.isInteger(slot.ivs[stat])||slot.ivs[stat]<0||slot.ivs[stat]>31)add('IV '+stat+' ต้องอยู่ในช่วง 0–31');}
                if(!Number.isInteger(slot.level)||slot.level<1||slot.level>100)add('Level ต้องเป็น 1–100');
                if(!natures.some(n=>n.name===slot.nature))add('Nature ไม่ถูกต้อง');
                if(![...typesList,'Stellar'].includes(slot.teraType))add('กรุณาเลือก Tera Type');
                const moves=slot.moves.filter(Boolean);if(moves.length<4)add('เลือกท่ายังไม่ครบ 4 ช่อง');
                if(new Set(moves).size!==moves.length)add('ท่าซ้ำ');
                const legal=new Set(eligibleMoves(slot).map(m=>m.name));moves.forEach(m=>{if(!legal.has(m))add(m+' ไม่อยู่ในชุดท่าของร่างนี้/โหมดนี้');});
                if(slot.item==='Assault Vest'&&moves.some(m=>MOVE_BY_ID[dexId(m)]?.category==='Status'))add('Assault Vest ใช้ร่วมกับท่า Status ไม่ได้');
            });
            if(count<6)result.unshift('ทีมยังไม่ครบ 6 ตัว ('+count+'/6)');
            return result;
        });
        const visiblePokemon=computed(()=>filteredPokemon.value.slice(0,visibleCount.value));
        watch([searchQuery,selectedGeneration,generationMode,selectedType,selectedRole,onlyEligible,ruleProfile],()=>visibleCount.value=60);
        watch(teamSlots,()=>{aiAnalyzed.value=false;},{deep:true});
        const ioOpen=ref(false),ioText=ref(''),ioError=ref(''),ioMessage=ref('');
        const openExport=()=>{ioText.value=exportShowdown(teamSlots.value);ioError.value='';ioMessage.value='คัดลอกข้อความด้านล่างไปวางใน Pokémon Showdown';ioOpen.value=true;};
        const openImport=()=>{ioText.value='';ioError.value='';ioMessage.value='การนำเข้าจะสร้างทีมใหม่ ทีมเดิมยังอยู่';ioOpen.value=true;};
        const doImport=()=>{try{const slots=importShowdown(ioText.value,natures.map(n=>n.name),typesList);library.storeImported(slots);ioOpen.value=false;}catch(e){ioError.value=e.message;}};
        const copyExport=async()=>{try{await navigator.clipboard.writeText(ioText.value);ioMessage.value='คัดลอกแล้ว';}catch{ioMessage.value='กรุณาเลือกข้อความแล้วกด Ctrl+C';}};
        const downloadExport=()=>{const url=URL.createObjectURL(new Blob([ioText.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=(library.teamName.value.replace(/[\\/:*?"<>|]/g,'_')||'team')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
        const catalogSearch=ref(''),catalogKind=ref('moves'),catalogLimit=ref(40);
        const catalogEntries=computed(()=>CATALOG[catalogKind.value].filter(entry=>(entry.name+' '+(entry.type||'')+' '+entry.desc+' '+description(catalogKind.value,entry.name)+' '+thaiName(catalogKind.value,entry.name)+' '+(THAI_TYPES[entry.type]||'')).toLowerCase().includes(catalogSearch.value.toLowerCase())));
        watch([catalogSearch,catalogKind],()=>catalogLimit.value=40);
        const showDex=()=>{currentTab.value='database';};
        // Reports are derived from the actual team; no remote AI or fabricated win rate.
        const analyzeActualTeam=()=>{
            const slots=teamSlots.value.filter(s=>s.pokemon);if(slots.length<6)return;
            const weak=typesList.map(t=>({type:t,count:slots.filter(s=>defenseMultiplier(s,t)>1).length})).filter(x=>x.count>=2).sort((a,b)=>b.count-a.count);
            const speed=slots.filter(s=>s.moves.some(m=>['Tailwind','Trick Room','Icy Wind','Electroweb','Thunder Wave'].includes(m)));
            const support=slots.filter(s=>s.moves.some(m=>['Fake Out','Follow Me','Rage Powder','Helping Hand','Spore'].includes(m)));
            aiReport.value={strengths:`มีท่าสนับสนุนใน ${support.length} ตัว และตัวคุมความเร็ว ${speed.length} ตัว`,weaknesses:weak.length?weak.map(x=>`${x.type}: แพ้ ${x.count} ตัว`).join(' · '):'ไม่พบธาตุที่แพ้ร่วมกันตั้งแต่ 2 ตัวขึ้นไปในเงื่อนไขตารางปัจจุบัน',playstyle:speed.length?'พิจารณาเปิดเกมด้วย '+speed.map(s=>s.pokemon.name).join(', ')+' เพื่อคุมความเร็ว แล้วเลือกคู่ตาม matchup':'ยังไม่มีท่าคุมความเร็วที่ระบบติดตาม ลองเพิ่ม Tailwind, Trick Room หรือท่าลด Speed',counters:validationIssues.value.length?`พบข้อควรแก้ ${validationIssues.value.length} รายการ ตรวจรายการในหน้า Builder ก่อนนำทีมไปทดสอบ`:'ไม่พบปัญหาจากรายการตรวจพื้นฐาน ควรทดสอบกับคู่ต่อสู้หลายรูปแบบ'};
            aiAnalyzed.value=true;
        };
        const itemPickerOpen=ref(false),itemPickerSlot=ref(0),itemSearch=ref(''),itemLimit=ref(60);
        const filteredItems=computed(()=>{const q=itemSearch.value.trim().toLowerCase(),slot=teamSlots.value[itemPickerSlot.value];return itemOptions.value.filter(item=>(item.name+' '+thaiName('items',item.name)+' '+description('items',item.name)).toLowerCase().includes(q)).sort((a,b)=>Number(!!itemRecommendation(slot,b))-Number(!!itemRecommendation(slot,a))||a.name.localeCompare(b.name));});
        const openItemPicker=index=>{itemPickerSlot.value=index;itemSearch.value='';itemLimit.value=60;itemPickerOpen.value=true;};
        const selectItem=name=>{if(name&&!itemOptions.value.some(item=>item.name===name))return;if(!teamSlots.value[itemPickerSlot.value]?.pokemon)return;teamSlots.value[itemPickerSlot.value].item=name;itemPickerOpen.value=false;};
        watch(itemSearch,()=>itemLimit.value=60);
        const recommendedSet=slot=>{
            const available=eligibleMoves(slot),guide=TEAM_MOVE_GUIDES[slot.pokemon?.id]||[];
            const preferred=guide.map(name=>available.find(m=>m.name===name)).filter(m=>m&&moveRecommendation(slot,m));
            return preferred.slice(0,4);
        };
        const applyRecommendedSet=slot=>{const moves=recommendedSet(slot);if(moves.length===4)slot.moves=moves.map(m=>m.name);};
        const natureAdvice=(slot,nature)=>natureRecommendation(slot,nature,teamSlots.value.some(s=>s.pokemon&&s.moves.includes('Trick Room')));
        const sortedNatures=slot=>[...natures].sort((a,b)=>Number(!!natureAdvice(slot,b))-Number(!!natureAdvice(slot,a))||a.name.localeCompare(b.name));
        const useTeamIdea=team=>{library.storeImported(team.sets,{name:team.name+' (ปรับต่อ)',rule:team.rule});selectedTeam.value=null;currentTab.value='builder';};
        const teamIdeaPaste=team=>exportShowdown(team.sets);
        const features={useTeamIdea,teamIdeaPaste,natureAdvice,sortedNatures,moveRecommendation,itemRecommendation,recommendedSet,applyRecommendedSet,itemPickerOpen,itemPickerSlot,itemSearch,itemLimit,filteredItems,openItemPicker,selectItem,selectedType,selectedRole,onlyEligible,visibleCount,visiblePokemon,roleOptions,ruleProfiles,currentRule,pokemonEligibility,eligibleMoves,itemOptions,description,teraView,defenseMultiplier,defenseColor,validationIssues,ioOpen,ioText,ioError,ioMessage,openExport,openImport,doImport,copyExport,downloadExport,catalogSearch,catalogKind,catalogLimit,catalogEntries,showDex,analyzeActualTeam};

        return {
            ...library, ...features, ...thaiInterface, originalDescription,
            currentTab, isLoggedin, typesList, getTypeColor, getTypeEffectiveness, getTypeEffectColor,
            steps, metaAbilities: CATALOG.abilities.slice(0,40), metaMoves: CATALOG.moves.slice(0,40), sampleTeams: SAMPLE_TEAMS,
            teamSlots, natures, showSearchModal, activeSearchSlot, searchQuery, filteredPokemon,
            selectedGeneration, generationMode, generationOptions, generationLabel, clearPokemonFilters,
            openPokemonSearch, selectPokemon, removePokemon, resetTeam,
            totalEVs, calculateStat, calculateTeamWeaknesses, hasMajorWeakness,
            aiLoading, aiAnalyzed, aiReport, analyzeTeam: analyzeActualTeam,
            selectedTeam, viewTeam
        }
    }
}).mount('#app');