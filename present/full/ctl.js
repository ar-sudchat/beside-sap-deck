/* PRESENTER VERSION: คัดจุดหยุดเหลือ 1-2 คลิก/หน้า (ดู compute) · ต้นฉบับอยู่ที่ beside-sap-new
   deck: ควบคุมแอนิเมชันแบบ "คลิกทีละเอฟเฟกต์" (เหมือน PowerPoint)
   คนกด: Space / Enter / → / ↓ / คลิกขวาของจอ = เอฟเฟกต์ถัดไป (หมดแล้วไปหน้าถัดไป) · ← / ↑ / Backspace / คลิกซ้าย 20% = ย้อน
   โปรแกรม/AI (ตอนอัดวิดีโอ):  await deck.ready;  await deck.next();  await deck.next(); ... ; deck.nextPage()
     deck.steps() จำนวนเอฟเฟกต์ของหน้านี้ · deck.step() เอฟเฟกต์ที่เล่นแล้ว · deck.goto(i) ข้ามไปสถานะที่ i ทันที
     deck.back() · deck.reset() · deck.rate = 1 (ความเร็วเล่นของแต่ละเอฟเฟกต์) · deck.setMode('step'|'auto')
   ไม่มีแผงควบคุมบนจอ (ไม่ติดไปในวิดีโอ) */
(function(){
var vm=false,vt=0,ambient=[],GAP=0.55,mode='step',bps=[],idx=-1,masterT=0,target=null,playing=false,last=0,driven=[],END=0,resolvers=[],readyRes;
if(/[?&]auto\b/.test(location.search))mode='auto';
var deck={presenter:true,rate:1,ready:new Promise(function(r){readyRes=r})};
function setAll(t){driven.forEach(function(a){try{a.currentTime=t*1000}catch(e){}})}
function nv(v){v=String(v);return /^rgba\(.*,\s*0\)$/.test(v)?'transparent':v}
function compute(){
  var iv=[];driven.forEach(function(a){var e=a.effect;if(!e||!e.getKeyframes||/float|smoke|smk|spin|belt|bob|wiggle|sway/i.test(a.animationName||''))return;var tm=e.getTiming();if(tm.iterations===Infinity)return;var d=(tm.duration||0)/1000,dl=(tm.delay||0)/1000;
    var kf=e.getKeyframes();for(var i=0;i<kf.length-1;i++){var A=kf[i],B=kf[i+1],diff=false;
      if(A.opacity==='0'&&B.opacity==='0')continue;
      for(var k in A){if(k==='offset'||k==='computedOffset'||k==='easing'||k==='composite')continue;if(k in B&&nv(A[k])!==nv(B[k])){diff=true;break}}
      var s=dl+kf[i].computedOffset*d,en=dl+kf[i+1].computedOffset*d;
      if(diff&&s>=0&&en>s&&en>0.05&&en-s<=6)iv.push([s,en])}});
  iv.sort(function(a,b){return a[0]-b[0]});var out=[],ls=null,ce=0;
  iv.forEach(function(x){if(ls===null){ls=x[0];ce=x[1]}else if(x[0]-ls<GAP){ls=x[0];ce=Math.max(ce,x[1])}else{out.push(ce);ls=x[0];ce=x[1]}});
  if(ls!==null)out.push(ce);var N=out.length;/* presenter: 1 คลิกต่อหน้า (เปิดหน้าเห็นขั้นแรกเอง → คลิก 1 = ครบ) */if(N>2)out=[out[0],out[N-1]];bps=out;END=out.length?out[out.length-1]:0}
function done(){var r=resolvers;resolvers=[];r.forEach(function(f){f(true)})}
function tick(ts){var dt=last?(ts-last)/1000:0;last=ts;if(vm){requestAnimationFrame(tick);return}
  if(playing){masterT+=dt*deck.rate*((deck.smooth&&target!=null&&target-masterT>1.0)?1.6:1);if(target!=null&&masterT>=target){masterT=target;playing=false;setAll(masterT);done()}else setAll(masterT)}
  requestAnimationFrame(tick)}
function finishNow(){if(playing&&target!=null){masterT=target;setAll(masterT);playing=false;done()}}
function playTo(i){idx=i;target=bps[i];playing=true}
deck.steps=function(){return bps.length};deck.step=function(){return idx+1};deck.mode=function(){return mode};
deck.next=function(){if(mode!=='step'||!bps.length)return Promise.resolve(false);if(!(deck.smooth&&playing))finishNow();if(idx+1>=bps.length)return Promise.resolve(false);
  return new Promise(function(res){resolvers.push(res);playTo(idx+1)})};
deck.back=function(){if(mode!=='step'||!bps.length)return false;finishNow();if(idx>0){idx--;masterT=bps[idx];target=null;playing=false;setAll(masterT);return true}return false};
deck.goto=function(i){finishNow();i=Math.max(-1,Math.min(bps.length-1,i));idx=i;masterT=i<0?0:bps[i];target=null;playing=false;setAll(masterT)};
deck.reset=function(){finishNow();idx=-1;masterT=0;playing=false;setAll(0)};
deck.setMode=function(m){mode=m;finishNow();masterT=0;setAll(0);idx=-1;if(m==='step'){playTo(0)}else{target=END+0.5;playing=true;idx=bps.length-1}};
deck.virtual=function(on){vm=!!on;vt=0;ambient.forEach(function(a){try{if(vm){a.pause();a.currentTime=0}else a.play()}catch(e){}})};
deck.advance=function(dt){vt+=dt;ambient.forEach(function(a){try{a.currentTime=vt*1000}catch(e){}});if(playing){masterT+=dt*deck.rate*((deck.smooth&&target!=null&&target-masterT>1.0)?1.6:1);if(target!=null&&masterT>=target){masterT=target;playing=false;setAll(masterT);done()}else setAll(masterT)}};
deck.pages=['n1','s2','b2','n2','b3','so','sf','sa','sd','pl','bm','mps','wo','mrp','po','buy','m4','iqc','m5','iss','m6','prd','m7','qc','trc','m8','cst','cmp','m9','dlv','dbd','sot','mar','fin'];
deck.page=function(){return location.pathname.split('/').pop().replace('.html','')};
deck.nextPage=function(){var i=deck.pages.indexOf(deck.page());if(i>=0&&i<deck.pages.length-1)location.href=deck.pages[i+1]+'.html'};
window.deck=deck;
function init(){var all=document.getAnimations();ambient=all.filter(function(a){var e=a.effect,tm=e&&e.getTiming&&e.getTiming();return tm&&tm.iterations===Infinity});driven=all.filter(function(a){return ambient.indexOf(a)<0});driven.forEach(function(a){a.pause()});compute();
  if(mode==='step'){playTo(0)}else{target=END+0.5;playing=true;idx=bps.length-1}
  requestAnimationFrame(tick);readyRes(true)}
var FW=['ArrowRight','ArrowDown','PageDown',' ','Enter'],BK=['ArrowLeft','ArrowUp','PageUp','Backspace'];
addEventListener('keydown',function(e){var k=e.key;
  if(FW.indexOf(k)>=0){if(mode==='step'&&bps.length&&idx+1<bps.length){e.preventDefault();e.stopImmediatePropagation();deck.next()}else if(mode==='step'&&playing){e.preventDefault();e.stopImmediatePropagation();finishNow()}}
  else if(BK.indexOf(k)>=0){if(deck.back()){e.preventDefault();e.stopImmediatePropagation()}}},true);
addEventListener('click',function(e){if(e.clientX<innerWidth*.2){if(deck.back())e.stopImmediatePropagation()}else{if(mode==='step'&&bps.length&&(idx+1<bps.length||playing)){e.stopImmediatePropagation();if(idx+1<bps.length&&!playing)deck.next();else finishNow()}}},true);
function reveal(){var p=document.getElementById('predeck');if(p)p.textContent='#fit{opacity:1;transition:opacity .18s ease-out}'}
var started=false;function go(){if(started)return;started=true;init();requestAnimationFrame(function(){requestAnimationFrame(reveal)})}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){requestAnimationFrame(go)});
setTimeout(go,2500);
})();
