import{O as b,Z as m,$ as q,s as w,ah as z}from"./index.84a1bd3e.js";const u=[];function A(e,o){return{subscribe:T(e,o).subscribe}}function T(e,o=b){let r;const n=new Set;function a(t){if(w(e,t)&&(e=t,r)){const i=!u.length;for(const s of n)s[1](),u.push(s,e);if(i){for(let s=0;s<u.length;s+=2)u[s][0](u[s+1]);u.length=0}}}function f(t){a(t(e))}function l(t,i=b){const s=[t,i];return n.add(s),n.size===1&&(r=o(a)||b),t(e),()=>{n.delete(s),n.size===0&&r&&(r(),r=null)}}return{set:a,update:f,subscribe:l}}function S(e,o,r){const n=!Array.isArray(e),a=n?[e]:e,f=o.length<2;return A(r,l=>{let t=!1;const i=[];let s=0,p=b;const d=()=>{if(s)return;p();const c=o(n?i[0]:i,l);f?l(c):p=z(c)?c:b},k=a.map((c,_)=>m(c,y=>{i[_]=y,s&=~(1<<_),t&&d()},()=>{s|=1<<_}));return t=!0,d(),function(){q(k),p(),t=!1}})}var g;const x=((g=globalThis.__sveltekit_te2pk)==null?void 0:g.base)??"";var h;const Z=((h=globalThis.__sveltekit_te2pk)==null?void 0:h.assets)??x;export{Z as a,x as b,S as d,A as r,T as w};