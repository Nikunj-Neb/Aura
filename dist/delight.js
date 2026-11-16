'use strict';
const drawCatWithMouth=catArt;
catArt=function(coat,accent){return drawCatWithMouth(coat,accent).replace('<path class="pet-heart"','<ellipse class="cat-yawn-mouth" cx="107" cy="59" rx="3.5" ry="4" fill="#815b50"/><path class="pet-heart"');};
const renderCatsWithToy=renderCats;
renderCats=function(){renderCatsWithToy();const stage=$('#cat-shelf .cat-stage');if(stage&&!stage.querySelector('.cat-toy'))stage.insertAdjacentHTML('beforeend','<span class="cat-toy" aria-hidden="true" hidden></span>');};
document.addEventListener('click',e=>{const button=e.target.closest('button');if(button?.dataset.cats!=='play'||reducedCats())return;const actor=catActors[0];if(!actor)return;setCatBehavior(actor,'chase',performance.now());const toy=$('#cat-shelf .cat-toy');if(toy){toy.hidden=false;toy.style.setProperty('--toy-start',actor.x+actor.el.clientWidth-10+'px');toy.style.setProperty('--toy-end',actor.target+actor.el.clientWidth-10+'px');toy.classList.remove('rolling');void toy.offsetWidth;toy.classList.add('rolling');setTimeout(()=>{if(toy.isConnected)toy.hidden=true;},4000);}if(catActors[1])setCatBehavior(catActors[1],'watch',performance.now());});
// Add a short transition to quiz steps; never animate changing scores as a reward.
const delightfulRoute=route;let previousDelightView='';route=function(){delightfulRoute();const key=location.hash+(location.hash==='#weekly'&&weeklyDraft?':'+weeklyIndex:'');if(key!==previousDelightView&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){$('#main').animate([{opacity:.25,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:290,easing:'cubic-bezier(.2,.7,.3,1)'});previousDelightView=key;}};
catSignature='';route();
