import{S as z,i as N,s as Q,y as m,a as w,z as p,c as v,C as F,h as d,A as g,b as k,g as u,d as i,B as _,E as D,o as G,v as M,f as j,q as O,r as S,k as A,l as C,m as L,n as P,Q as J,D as K,O as V}from"../chunks/index.84a1bd3e.js";import{S as B,H as E,B as W,I as Y}from"../chunks/Spinner.svelte_svelte_type_style_lang.19921810.js";import{j as H,W as R,s as U,k as X,T as Z}from"../chunks/Track.8ee53542.js";import"../chunks/paths.9a05db43.js";import{T as y}from"../chunks/util.a2d0342e.js";import{O as x}from"../chunks/Overview.0c0c9473.js";function I(o,e,r){const t=o.slice();return t[8]=e[r].device,t[9]=e[r].track,t[10]=e[r].progress,t}function ee(o){let e;return{c(){e=O("Home")},l(r){e=S(r,"Home")},m(r,t){k(r,e,t)},d(r){r&&d(e)}}}function te(o){let e,r;return e=new Y({props:{name:"settings"}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p:V,i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function re(o){let e,r;return e=new W({props:{round:!0,href:"/settings",$$slots:{default:[te]},$$scope:{ctx:o}}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p(t,s){const a={};s&8192&&(a.$$scope={dirty:s,ctx:t}),e.$set(a)},i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function ne(o){let e,r;return e=new R({props:{not:!0,sm:!0,slot:"after",$$slots:{default:[re]},$$scope:{ctx:o}}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p(t,s){const a={};s&8192&&(a.$$scope={dirty:s,ctx:t}),e.$set(a)},i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function se(o){let e,r;return e=new E({props:{xl:!0,indent:!0,id:"feed",$$slots:{after:[ne],default:[ee]},$$scope:{ctx:o}}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p(t,s){const a={};s&8192&&(a.$$scope={dirty:s,ctx:t}),e.$set(a)},i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function T(o){let e,r;return e=new B({props:{grow:!0,gap:"sm",$$slots:{default:[le]},$$scope:{ctx:o}}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p(t,s){const a={};s&8193&&(a.$$scope={dirty:s,ctx:t}),e.$set(a)},i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function ae(o){let e;return{c(){e=O("Other Devices")},l(r){e=S(r,"Other Devices")},m(r,t){k(r,e,t)},d(r){r&&d(e)}}}function oe(o){let e,r;return e=new Y({props:{name:"close"}}),{c(){m(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,s){g(e,t,s),r=!0},p:V,i(t){r||(u(e.$$.fragment,t),r=!0)},o(t){i(e.$$.fragment,t),r=!1},d(t){_(e,t)}}}function fe(o){let e,r;function t(...s){return o[5](o[8],...s)}return e=new W({props:{air:!0,$$slots:{default:[oe]},$$scope:{ctx:o}}}),e.$on("click",t),{c(){m(e.$$.fragment)},l(s){p(e.$$.fragment,s)},m(s,a){g(e,s,a),r=!0},p(s,a){o=s;const n={};a&8192&&(n.$$scope={dirty:a,ctx:o}),e.$set(n)},i(s){r||(u(e.$$.fragment,s),r=!0)},o(s){i(e.$$.fragment,s),r=!1},d(s){_(e,s)}}}function q(o){let e,r,t,s;function a(){return o[6](o[8])}return r=new Z({props:{sm:!0,track:o[9],progress:o[10],$$slots:{default:[fe]},$$scope:{ctx:o}}}),r.$on("click",a),{c(){e=A("div"),m(r.$$.fragment),t=w(),this.h()},l(n){e=C(n,"DIV",{class:!0});var l=L(e);p(r.$$.fragment,l),t=v(l),l.forEach(d),this.h()},h(){P(e,"class","dark:ring-none rounded-lg shadow-sm ring-1 ring-highlight [&>*]:bg-surface-100")},m(n,l){k(n,e,l),g(r,e,null),K(e,t),s=!0},p(n,l){o=n;const f={};l&1&&(f.track=o[9]),l&1&&(f.progress=o[10]),l&8193&&(f.$$scope={dirty:l,ctx:o}),r.$set(f)},i(n){s||(u(r.$$.fragment,n),s=!0)},o(n){i(r.$$.fragment,n),s=!1},d(n){n&&d(e),_(r)}}}function le(o){let e,r,t,s;e=new E({props:{sm:!0,$$slots:{default:[ae]},$$scope:{ctx:o}}});let a=o[0],n=[];for(let f=0;f<a.length;f+=1)n[f]=q(I(o,a,f));const l=f=>i(n[f],1,1,()=>{n[f]=null});return{c(){m(e.$$.fragment),r=w(),t=A("div");for(let f=0;f<n.length;f+=1)n[f].c();this.h()},l(f){p(e.$$.fragment,f),r=v(f),t=C(f,"DIV",{class:!0});var c=L(t);for(let h=0;h<n.length;h+=1)n[h].l(c);c.forEach(d),this.h()},h(){P(t,"class","grid grid-cols-[repeat(auto-fill,minmax(min(100%,40rem),1fr))] gap-1")},m(f,c){g(e,f,c),k(f,r,c),k(f,t,c);for(let h=0;h<n.length;h+=1)n[h]&&n[h].m(t,null);s=!0},p(f,c){const h={};if(c&8192&&(h.$$scope={dirty:c,ctx:f}),e.$set(h),c&1){a=f[0];let $;for($=0;$<a.length;$+=1){const b=I(f,a,$);n[$]?(n[$].p(b,c),u(n[$],1)):(n[$]=q(b),n[$].c(),u(n[$],1),n[$].m(t,null))}for(M(),$=a.length;$<n.length;$+=1)l($);j()}},i(f){if(!s){u(e.$$.fragment,f);for(let c=0;c<a.length;c+=1)u(n[c]);s=!0}},o(f){i(e.$$.fragment,f),n=n.filter(Boolean);for(let c=0;c<n.length;c+=1)i(n[c]);s=!1},d(f){_(e,f),f&&d(r),f&&d(t),J(n,f)}}}function $e(o){let e;return{c(){e=O("You Might Like")},l(r){e=S(r,"You Might Like")},m(r,t){k(r,e,t)},d(r){r&&d(e)}}}function ce(o){let e,r,t,s;return e=new E({props:{sm:!0,$$slots:{default:[$e]},$$scope:{ctx:o}}}),t=new x({props:{style:"playlist",filter:o[1],of:o[2].filter(o[7]),href:"/home"}}),{c(){m(e.$$.fragment),r=w(),m(t.$$.fragment)},l(a){p(e.$$.fragment,a),r=v(a),p(t.$$.fragment,a)},m(a,n){g(e,a,n),k(a,r,n),g(t,a,n),s=!0},p(a,n){const l={};n&8192&&(l.$$scope={dirty:n,ctx:a}),e.$set(l);const f={};n&2&&(f.filter=a[1]),n&4&&(f.of=a[2].filter(a[7])),t.$set(f)},i(a){s||(u(e.$$.fragment,a),u(t.$$.fragment,a),s=!0)},o(a){i(e.$$.fragment,a),i(t.$$.fragment,a),s=!1},d(a){_(e,a),a&&d(r),_(t,a)}}}function ue(o){let e,r,t,s=o[0].length&&T(o);return r=new B({props:{grow:!0,gap:"sm",$$slots:{default:[ce]},$$scope:{ctx:o}}}),{c(){s&&s.c(),e=w(),m(r.$$.fragment)},l(a){s&&s.l(a),e=v(a),p(r.$$.fragment,a)},m(a,n){s&&s.m(a,n),k(a,e,n),g(r,a,n),t=!0},p(a,n){a[0].length?s?(s.p(a,n),n&1&&u(s,1)):(s=T(a),s.c(),u(s,1),s.m(e.parentNode,e)):s&&(M(),i(s,1,1,()=>{s=null}),j());const l={};n&8198&&(l.$$scope={dirty:n,ctx:a}),r.$set(l)},i(a){t||(u(s),u(r.$$.fragment,a),t=!0)},o(a){i(s),i(r.$$.fragment,a),t=!1},d(a){s&&s.d(a),a&&d(e),_(r,a)}}}function ie(o){let e,r,t,s,a;return e=new y({props:{title:"Home",$$slots:{default:[se]},$$scope:{ctx:o}}}),t=new B({props:{p:!0,grow:!0,gap:"lg",$$slots:{default:[ue]},$$scope:{ctx:o}}}),{c(){m(e.$$.fragment),r=w(),m(t.$$.fragment),s=w(),this.h()},l(n){p(e.$$.fragment,n),r=v(n),p(t.$$.fragment,n),s=v(n),F("svelte-1c748qj",document.head).forEach(d),this.h()},h(){document.title="Amadeus"},m(n,l){g(e,n,l),k(n,r,l),g(t,n,l),k(n,s,l),a=!0},p(n,[l]){const f={};l&8192&&(f.$$scope={dirty:l,ctx:n}),e.$set(f);const c={};l&8199&&(c.$$scope={dirty:l,ctx:n}),t.$set(c)},i(n){a||(u(e.$$.fragment,n),u(t.$$.fragment,n),a=!0)},o(n){i(e.$$.fragment,n),i(t.$$.fragment,n),a=!1},d(n){_(e,n),n&&d(r),_(t,n),n&&d(s)}}}function me(o,e,r){let t,s,a,n;D(o,H,$=>r(4,s=$)),D(o,U,$=>r(1,a=$)),D(o,X,$=>r(2,n=$));const l=new Set([-3,-4]);G(()=>{location.hash||location.replace("#feed")});const f=($,b)=>(H.clear($),b.stopPropagation()),c=$=>H.replicate($),h=$=>!l.has($.id);return o.$$.update=()=>{o.$$.dirty&16&&r(0,t=s.filter($=>!$.local))},[t,a,n,l,s,f,c,h]}class we extends z{constructor(e){super(),N(this,e,me,ie,Q,{})}}export{we as component};