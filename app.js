(function(){
'use strict';
const QUOTA={"消防関係法令":10,"基礎的知識（機械）":5,"構造・機能及び整備":15,"実技・鑑別":5};
const cats=Object.keys(QUOTA);
let exam=[],idx=0,score=0,secScore={},answered=false,timer=null,advance=null;
const $=s=>document.querySelector(s);
function shuffle(a){return a.slice().sort(()=>Math.random()-0.5)}
function getBank(){return Array.isArray(window.BANK_DATA)?window.BANK_DATA:[]}
function setStarted(on){document.body.classList.toggle('started',!!on)}
function startExam(){
  try{
    const bank=getBank();
    if(bank.length!==250) throw new Error('問題データが250問読み込まれていません（'+bank.length+'問）');
    const common=shuffle(bank.filter(q=>q.category==='消防関係法令'&&q.law_section==='共通')).slice(0,6);
    const classified=shuffle(bank.filter(q=>q.category==='消防関係法令'&&q.law_section==='類別')).slice(0,4);
    const basic=shuffle(bank.filter(q=>q.category==='基礎的知識（機械）')).slice(0,5);
    const structure=shuffle(bank.filter(q=>q.category==='構造・機能及び整備')).slice(0,15);
    const practical=shuffle(bank.filter(q=>q.category==='実技・鑑別')).slice(0,5);
    if(common.length!==6||classified.length!==4||basic.length!==5||structure.length!==15||practical.length!==5)
      throw new Error('出題区分の問題数が不足しています。');
    exam=[...common,...classified,...basic,...structure,...practical];
    idx=0;score=0;secScore={};
    clearInterval(timer);clearInterval(advance);
    $('#resultScreen').classList.remove('show');
    setStarted(true);
    showQuestion();
  }catch(e){
    console.error(e);
    const msg='開始できませんでした。問題データを確認してください。';
    $('#qtext').textContent=msg;
    $('#feedbackTitle').textContent='開始エラー';
    $('#explain').textContent=e.message||msg;
    $('#mobileFeedbackTitle').textContent='開始エラー';
    $('#mobileExplain').textContent=e.message||msg;
    $('#mobileFeedback').classList.add('show');
  }
}
function visualFor(q){
 const s=q.question||'';
 if(q.visual&&q.visual.key){
   const map={pressure_gauge_normal:'./img/visuals/gauge-normal.svg',pressure_gauge_low:'./img/visuals/gauge-low.svg',pressure_gauge_high:'./img/visuals/gauge-high.svg',siphon_cutaway:'./img/visuals/siphon.svg',gas_cartridge:'./img/visuals/gas-cylinder.svg',cap_spanner:'./img/visuals/cap-wrench.svg',pressure_fill_plug:'./img/visuals/safety-plug.svg',reducer_groove:'./img/visuals/reduction-groove.svg',fire_marks:'./img/visuals/fire-marks.svg',inspection_scene:'./img/visuals/inspection.svg'};
   if(map[q.visual.key]) return map[q.visual.key];
 }
 if(/指示圧力計/.test(s)){if(/左|低圧|低下|漏れ/.test(s))return './img/visuals/gauge-low.svg';if(/右|高圧/.test(s))return './img/visuals/gauge-high.svg';return './img/visuals/gauge-normal.svg'}
 if(/サイホン管/.test(s))return './img/visuals/siphon.svg';
 if(/加圧用ガス容器/.test(s))return './img/visuals/gas-cylinder.svg';
 if(/キャップスパナ/.test(s))return './img/visuals/cap-wrench.svg';
 if(/安全排圧充填プラグ/.test(s))return './img/visuals/safety-plug.svg';
 if(/減圧溝|排気溝/.test(s))return './img/visuals/reduction-groove.svg';
 if(/質量計|秤|重量/.test(s))return './img/visuals/scale.svg';
 if(/適応火災|A・B・C|A・B・C|火災表示/.test(s))return './img/visuals/fire-marks.svg';
 if(q.category==='実技・鑑別'||/ホース/.test(s))return './img/visuals/extinguisher.svg';
 return './img/shibasaburo.png';
}
function renderVisual(q){$('#visual').innerHTML='';const img=document.createElement('img');img.src=visualFor(q);img.alt='問題図';img.onerror=()=>{img.onerror=null;img.src='./img/shibasaburo.png'};$('#visual').appendChild(img)}
function showQuestion(){
 answered=false;clearInterval(timer);clearInterval(advance);const q=exam[idx];
 $('#kind').textContent=q.category==='実技・鑑別'?'鑑別・実技':q.category==='基礎的知識（機械）'?'基礎・計算':'学習問題';
 $('#qtext').textContent=q.question;renderVisual(q);const box=$('#choices');box.innerHTML='';
 ['A','B','C','D'].forEach(l=>{const b=document.createElement('button');b.type='button';b.className='choice '+l.toLowerCase();b.innerHTML='<span class="letter">'+l+'</span><span>'+q.choices[l]+'</span>';b.addEventListener('click',()=>answer(l));box.appendChild(b)});
 $('#hintInline').classList.remove('show');$('#mobileFeedback').classList.remove('show');$('#hintBadge').textContent='20秒後にヒント';$('#hintText').textContent='問題を読んで考えてみよう。';$('#feedbackTitle').textContent='解答すると結果が表示されます';$('#explain').textContent='回答後に正誤と解説を表示します。';$('#auto').textContent='回答後 約6秒で次の問題へ';
 let s=0;timer=setInterval(()=>{s++;if(s<20)$('#hintBadge').textContent='ヒントまで '+(20-s)+'秒';if(s===20&&!answered){const h=hint(q);$('#hintBadge').textContent='ももちゃんがヒント！';$('#hintText').textContent=h;$('#hintInlineText').textContent=h;$('#hintInline').classList.add('show')}},1000)
}
function hint(q){if(q.category==='基礎的知識（機械）')return'数値と単位を整理し、使う式を考えてみよう。';if(q.category==='実技・鑑別')return'部品の形だけでなく、取り付け位置と役割を考えてみよう。';if(/圧力/.test(q.question))return'指示圧力計は指針の位置と緑色の適正範囲に注目しよう。';if(/薬剤|粉末/.test(q.question))return'主成分・消火作用・適応火災を関連付けて考えよう。';return'問題文の「目的」「役割」「状態」を表す言葉に注目してみよう。'}
function answer(l){if(answered)return;answered=true;clearInterval(timer);const q=exam[idx],ok=l===q.answer;if(ok){score++;secScore[q.category]=(secScore[q.category]||0)+1}document.querySelectorAll('.choice').forEach((b,i)=>{b.disabled=true;const x='ABCD'[i];if(x===q.answer)b.classList.add('correct');if(x===l&&x!==q.answer)b.classList.add('wrong')});const expl=(ok?'正解：':'正解は '+q.answer+'：')+q.explanation;$('#feedbackTitle').textContent=ok?'正解です！':'不正解です';$('#feedbackTitle').style.color=ok?'#0b9e4b':'#df3b70';$('#explain').textContent=expl;$('#mobileFeedbackTitle').textContent=ok?'⭕ 正解です！':'❌ 不正解です';$('#mobileFeedbackTitle').style.color=ok?'#0b9e4b':'#df3b70';$('#mobileExplain').textContent=expl;$('#mobileFeedback').classList.add('show');let left=6;advance=setInterval(()=>{left--;$('#auto').textContent=left>0?'約'+left+'秒後に次の問題へ':'次の問題へ';$('#mobileAuto').textContent=left>0?'約'+left+'秒後に次の問題へ':'次の問題へ';if(left<=0){clearInterval(advance);if(idx<34){idx++;showQuestion()}else finish()}},1000)}
function finish(){const pass=score>=21&&cats.every(c=>(secScore[c]||0)/QUOTA[c]>=.6);$('#resultTitle').textContent=pass?'合格おめでとう！':'もう一度チャレンジしよう！';$('#scoreText').textContent=score+' / 35（'+Math.round(score/35*100)+'%）';$('#resultMsg').textContent=pass?'ももちゃんと一緒に、よく頑張りました！':'各区分の基準を確認して復習しましょう。';$('#sections').innerHTML=cats.map(c=>{const n=QUOTA[c],g=secScore[c]||0;return '<div class="sec">'+c+'<br>'+g+' / '+n+'（'+Math.round(g/n*100)+'%）</div>'}).join('');$('#resultScreen').classList.add('show')}
function setupAuth(){const mobile=window.matchMedia('(max-width:850px)').matches;if(!mobile)return;try{if(localStorage.getItem('ot6_auth_v2')==='1')return}catch(e){}$('#lock').classList.add('show');setTimeout(()=>$('#pw').focus(),100)}
function init(){
 const start=$('#start'),again=$('#again'),unlock=$('#unlock'),pw=$('#pw');
 if(start)start.addEventListener('click',startExam);if(again)again.addEventListener('click',startExam);
 if(unlock)unlock.addEventListener('click',()=>{if(pw.value==='8888'){try{localStorage.setItem('ot6_auth_v2','1')}catch(e){}$('#lock').classList.remove('show');$('#err').textContent=''}else $('#err').textContent='パスワードが違います。'});
 if(pw)pw.addEventListener('keydown',e=>{if(e.key==='Enter'&&unlock)unlock.click()});
 setupAuth();
}
window.startExam=startExam;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
if(location.protocol!=='file:'&&'serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
