import{O as l,Z as q,$ as j,s as k,ah as w}from"./index.84a1bd3e.js";const u=[];function z(e,o){return{subscribe:A(e,o).subscribe}}function A(e,o=l){let r;const n=new Set;function a(t){if(k(e,t)&&(e=t,r)){const i=!u.length;for(const s of n)s[1](),u.push(s,e);if(i){for(let s=0;s<u.length;s+=2)u[s][0](u[s+1]);u.length=0}}}function f(t){a(t(e))}function b(t,i=l){const s=[t,i];return n.add(s),n.size===1&&(r=o(a)||l),t(e),()=>{n.delete(s),n.size===0&&r&&(r(),r=null)}}return{set:a,update:f,subscribe:b}}function O(e,o,r){const n=!Array.isArray(e),a=n?[e]:e,f=o.length<2;return z(r,b=>{let t=!1;const i=[];let s=0,p=l;const d=()=>{if(s)return;p();const c=o(n?i[0]:i,b);f?b(c):p=w(c)?c:l},y=a.map((c,_)=>q(c,m=>{i[_]=m,s&=~(1<<_),t&&d()},()=>{s|=1<<_}));return t=!0,d(),function(){j(y),p(),t=!1}})}var g;const T=((g=globalThis.__sveltekit_1jy4l4p)==null?void 0:g.base)??"";var h;const S=((h=globalThis.__sveltekit_1jy4l4p)==null?void 0:h.assets)??T;export{S as a,T as b,O as d,z as r,A as w};