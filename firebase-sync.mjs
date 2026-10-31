import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,setPersistence,browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,doc,getDocFromServer,setDoc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import {unpack,saveRevision} from './cloud-core.mjs';
const config={apiKey:'AIzaSyBU0_rQspRKLWkzh9lMgpuF0yLgKu0i-Lk',authDomain:'ggfc-scheduler.firebaseapp.com',projectId:'ggfc-scheduler',storageBucket:'ggfc-scheduler.firebasestorage.app',messagingSenderId:'521708969819',appId:'1:521708969819:web:4c9cb288c7437e6f4c047e'};
const OWNER='songjhwin@gmail.com',bridge=window.ggfcCloudBridge;
const $=id=>document.getElementById(id),main=document.querySelector('main');
let auth,db,user=null,busy=false,baseRevision,cloudSignature='',savedDate='',authEpoch=0;
function status(text){$('cloudMessage').textContent=text;}
function update(){
  main.inert=busy;
  $('cloudLogin').disabled=busy||Boolean(user)||!auth;
  $('cloudLogout').disabled=busy||!user;
  $('cloudLoad').disabled=busy||!user;
  $('cloudSave').disabled=busy||!user||baseRevision===undefined;
  $('cloudUser').textContent=user?user.email:'로그인이 필요합니다';
  $('cloudDirty').textContent=user?(cloudSignature===bridge.signature()?'온라인 저장 내용과 같음':'온라인에 저장하지 않은 변경 있음')+(savedDate?' · 마지막 온라인 저장 '+savedDate:''):'';
}
function errorText(e){
  const messages={'auth/unauthorized-domain':'Firebase Authentication의 승인된 도메인에 현재 주소를 등록해 주세요.','auth/popup-blocked':'로그인 팝업을 허용한 뒤 다시 눌러 주세요.','auth/popup-closed-by-user':'로그인 창이 닫혔습니다.','auth/operation-not-allowed':'Firebase Authentication에서 Google 로그인을 켜 주세요.','permission-denied':'접근이 거부되었습니다. 제공된 firestore.rules와 로그인 계정을 확인해 주세요.','unavailable':'서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.'};
  return messages[e.code]||e.message||'연결에 실패했습니다.';
}
async function task(fn){if(busy)return;busy=true;update();try{await fn();}catch(e){status(errorText(e));}finally{busy=false;update();}}
function root(){return doc(db,'users',user.uid);}
function partRef(rev,i){return doc(db,'users',user.uid,'revisions',rev,'chunks',String(i));}
async function load(ask=true){
  if(!user)return;
  const epoch=authEpoch;
  if(ask&&cloudSignature!==bridge.signature()&&!confirm('현재 화면의 내용을 온라인 저장 내용으로 바꿉니다. 보관할 내용은 먼저 전체 백업을 저장해 주세요. 계속할까요?'))return;
  status('온라인 저장 내용을 확인하고 있습니다…');
  const snapshot=await getDocFromServer(root());
  if(epoch!==authEpoch)throw Error('로그인 상태가 변경되었습니다. 다시 로그인해 주세요.');
  if(!snapshot.exists()){
    baseRevision=null;cloudSignature='';savedDate='';
    status('첫 온라인 저장 전입니다. V74 전체 백업을 불러온 다음 온라인 저장을 눌러 주세요.');return;
  }
  const meta=snapshot.data(),data=await unpack(meta,async(rev,i)=>{
    const snap=await getDocFromServer(partRef(rev,i));return snap.exists()?snap.data().payload:null;
  });
  if(epoch!==authEpoch)throw Error('로그인 상태가 변경되었습니다. 다시 로그인해 주세요.');
  bridge.validate(data);bridge.restore(data);
  baseRevision=meta.revision;cloudSignature=bridge.signature();
  savedDate=meta.updatedAt?.toDate().toLocaleString('ko-KR')||'';
  const localSaved=bridge.persist();
  status(localSaved?'온라인 저장 내용을 불러왔습니다.':'온라인 자료를 불러왔으나 이 브라우저에 임시 저장하지 못했습니다.');
}
async function save(){
  if(!user)return;
  const data=bridge.snapshot();bridge.validate(data);
  const signature=JSON.stringify(data),uid=user.uid,epoch=authEpoch;
  status('일정·설정·로고를 온라인에 저장하고 있습니다…');
  const meta=await saveRevision(data,baseRevision,{
    writePart:(rev,i,payload)=>{
      if(epoch!==authEpoch)throw Error('로그인 상태가 변경되었습니다. 다시 로그인해 주세요.');
      return setDoc(doc(db,'users',uid,'revisions',rev,'chunks',String(i)),{payload});
    },
    commit:async(meta,expected)=>runTransaction(db,async tx=>{
      const ref=doc(db,'users',uid),snapshot=await tx.get(ref);
      const actual=snapshot.exists()?snapshot.data().revision:null;
      if(actual!==expected)throw Error('다른 컴퓨터에서 저장한 새 내용이 있습니다. 현재 내용을 전체 백업한 뒤 온라인 불러오기를 눌러 주세요.');
      tx.set(ref,{...meta,updatedAt:serverTimestamp()});
    })
  });
  if(epoch!==authEpoch)throw Error('로그인 상태가 변경되었습니다. 다시 로그인해 주세요.');
  baseRevision=meta.revision;cloudSignature=signature;savedDate=new Date().toLocaleString('ko-KR');
  bridge.persist();status('온라인 저장 완료 · 다른 컴퓨터에서도 같은 계정으로 불러올 수 있습니다.');
}
$('cloudLogin').onclick=()=>task(async()=>{
  if(location.protocol==='file:')throw Error('이 파일은 GitHub Pages 주소에서 로그인해 주세요. README의 업로드 순서를 진행해 주세요.');
  const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account',login_hint:OWNER});
  await signInWithPopup(auth,provider);
});
$('cloudLoad').onclick=()=>task(()=>load(true));
$('cloudSave').onclick=()=>task(save);
$('cloudLogout').onclick=()=>task(async()=>{
  if(cloudSignature!==bridge.signature()&&!confirm('온라인에 저장하지 않은 변경이 있습니다. 로그아웃하면 이 브라우저의 임시 자료를 지웁니다. 계속할까요?'))return;
  await signOut(auth);
});
document.addEventListener('input',update);document.addEventListener('change',update);
document.addEventListener('ggfc-state-changed',update);
window.addEventListener('beforeunload',e=>{if(user&&cloudSignature!==bridge.signature()){e.preventDefault();e.returnValue='';}});
window.addEventListener('offline',()=>status('인터넷 연결이 끊겼습니다. 온라인 저장 전까지 변경 내용은 이 컴퓨터에만 있습니다.'));
window.addEventListener('online',()=>status('인터넷이 연결되었습니다. 온라인 불러오기 또는 저장을 눌러 주세요.'));
try{
  const app=initializeApp(config);auth=getAuth(app);db=getFirestore(app);
  await setPersistence(auth,browserSessionPersistence);
  onAuthStateChanged(auth,async current=>{
    ++authEpoch;
    // Hide private data immediately, including on session expiry.
    main.hidden=true;user=null;baseRevision=undefined;cloudSignature='';savedDate='';update();
    if(!current){bridge.clear();status('Google 계정으로 로그인해 주세요. 자료는 본인 계정만 접근할 수 있습니다.');update();return;}
    if(!current.emailVerified||current.email?.toLowerCase()!==OWNER){await signOut(auth);status('허용된 본인 계정으로 로그인해 주세요: '+OWNER);return;}
    user=current;main.hidden=false;update();
    // Popup sign-in may still be finishing its task; serialize the initial load afterward.
    while(busy)await new Promise(r=>setTimeout(r,50));
    await task(()=>load(true));
  },e=>{main.hidden=true;status(errorText(e));});
  update();
}catch(e){status('온라인 연결을 준비하지 못했습니다. '+errorText(e));}
