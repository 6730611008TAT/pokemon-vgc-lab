const { createApp, ref, computed } = Vue;

createApp({
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

        // --- Team Builder State ---
        const teamSlots = ref(Array(6).fill().map(() => ({
            pokemon: null,
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, // Default Max
            nature: "Timid",
            ability: ""
        })));

        const showSearchModal = ref(false);
        const activeSearchSlot = ref(0);
        const searchQuery = ref("");

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
            teamSlots.value[activeSearchSlot.value].pokemon = pokemon;
            teamSlots.value[activeSearchSlot.value].ability = pokemon.abilities[0];
            showSearchModal.value = false;
        };

        const removePokemon = (index) => {
            teamSlots.value[index].pokemon = null;
        };

        const resetTeam = () => {
            teamSlots.value.forEach(slot => { slot.pokemon = null; slot.evs = { hp:0, atk:0, def:0, spa:0, spd:0, spe:0 }; });
            aiAnalyzed.value = false;
        };

        const totalEVs = (evs) => Object.values(evs).reduce((a, b) => a + b, 0);

        // VGC Level 50 Stat Calculation Formula
        const calculateStat = (slot, statKey) => {
            if(!slot.pokemon) return 0;
            const base = slot.pokemon.baseStats[statKey];
            const iv = slot.ivs[statKey];
            const ev = slot.evs[statKey];
            const level = 50;
            
            if(statKey === 'hp') {
                return Math.floor(( (2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
            } else {
                let calc = Math.floor(( (2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
                const nat = natures.find(n => n.name === slot.nature);
                if(nat.plus === statKey) calc = Math.floor(calc * 1.1);
                if(nat.minus === statKey) calc = Math.floor(calc * 0.9);
                return calc;
            }
        };

        const filteredPokemon = computed(() => {
            if(!searchQuery.value) return POKEMON_DB;
            const q = searchQuery.value.toLowerCase();
            return POKEMON_DB.filter(p => p.name.toLowerCase().includes(q) || p.types.some(t => t.toLowerCase().includes(q)));
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

        const analyzeTeam = () => {
            aiLoading.value = true;
            // จำลองเวลาให้ AI ประมวลผล 2 วินาที
            setTimeout(() => {
                // สร้าง Mockup การวิเคราะห์โดยอิงจากโปเกมอนในทีมเล็กน้อย
                const teamNames = teamSlots.value.map(s => s.pokemon.name);
                const hasWeather = teamSlots.value.some(s => ["Drought","Drizzle","Sand Stream","Snow Warning"].includes(s.ability));
                
                aiReport.value = {
                    strengths: `Synergy ของทีมนี้อยู่ในเกณฑ์ดีเยี่ยม (${hasWeather ? 'มีการคุมสภาพอากาศเสริมความได้เปรียบ' : 'มีความยืดหยุ่นไม่พึ่งพาสภาพอากาศ'}) โปเกมอนแกนหลักสามารถ Cover จุดอ่อนให้กันและกันได้ดี โดยมีค่าเฉลี่ยสเตตัส (BST) สูงพอจะชนกับ Meta ปัจจุบัน`,
                    weaknesses: hasMajorWeakness.value ? 
                        `จุดตายรุนแรง! ทีมของคุณมีโปเกมอนที่แพ้ทางธาตุเดียวกันเกิน 3 ตัว หากฝ่ายตรงข้ามมีตัวเปิดเกม (Lead) ที่ใช้ธาตุนั้นๆ คุณจะเสียบอร์ด Control ทันที แนะนำให้เปลี่ยนตัวใดตัวหนึ่งเป็นธาตุที่ต้านทาน` : 
                        `ทีมมีความสมดุลธาตุดี แต่อาจจะแพ้ทาง Trick Room หากคู่แข่งสามารถเซ็ตอัพได้สำเร็จ เนื่องจากขาดท่าประเภท Taunt หรือตัวที่มีความเร็วต่ำพอจะสวนกลับในมิติเวลา`,
                    playstyle: `ควรใช้การ Lead แบบ 2 ทิศทาง หากเจอทีม Aggro ให้เปิดด้วยตัวที่มี Fake Out / Protect เพื่อประเมินสถานการณ์ (Scout) หากเจอทีมช้า ให้ส่งตัวดาเมจหลักลงไปกดดัน (Pressure) ตั้งแต่เทิร์นแรก`,
                    counters: `ระวังทีมประเภท Tailwind Hyper Offense ที่มีความเร็วพื้นฐานสูงกว่า หากคุณเสีย Speed Control ไปใน 2 เทิร์นแรก โอกาสแพ้จะพุ่งสูงถึง 80% ควรเก็บตัว Pivot ไว้สลับรับดาเมจ`
                };
                aiLoading.value = false;
                aiAnalyzed.value = true;
            }, 2000);
        };

        // --- Sample Teams ---
        const selectedTeam = ref(null);
        const viewTeam = (team) => {
            selectedTeam.value = team;
        };

        return {
            currentTab, isLoggedin, typesList, getTypeColor, getTypeEffectiveness, getTypeEffectColor,
            steps, metaAbilities: ABILITIES, metaMoves: MOVES, sampleTeams: SAMPLE_TEAMS,
            teamSlots, natures, showSearchModal, activeSearchSlot, searchQuery, filteredPokemon,
            openPokemonSearch, selectPokemon, removePokemon, resetTeam,
            totalEVs, calculateStat, calculateTeamWeaknesses, hasMajorWeakness,
            aiLoading, aiAnalyzed, aiReport, analyzeTeam,
            selectedTeam, viewTeam
        }
    }
}).mount('#app');