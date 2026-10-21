const ItemArtwork = {
 props:{name:{type:String,default:''}},data(){return {failed:false};},
 computed:{src(){const path=ITEM_IMAGES[dexId(this.name)];return path?path+'?v=2':null;}},watch:{name(){this.failed=false;}},
 template:`<span class="item-artwork"><img v-if="src&&!failed" :src="src" :alt="name" loading="lazy" width="64" height="64" @error="failed=true"><span v-else class="item-artwork-fallback" role="img" :aria-label="name?(failed?'โหลดรูปไม่ได้: ':'ยังไม่มีภาพที่ยืนยันตรงชื่อ: ')+name:'ไม่ได้ถือไอเทม'" :title="name?(failed?'โหลดรูปไม่ได้ ลองรีเฟรชหน้าเว็บ':'ยังไม่มีภาพที่ยืนยันตรงชื่อสำหรับไอเทมนี้'):'ไม่ได้ถือไอเทม'"><i class="fas fa-box" aria-hidden="true"></i></span></span>`
};
