import{s as E,a as H,C as S,g as I,i as w,f as k,t as y,d as C,j as L,H as J,x as K,I as V,e as M,c as P,b as Q,r as R,F as W,n as X}from"./scheduler.DDeJziXz.js";import{S as q,i as B,c as d,a as p,m as b,t as m,b as _,d as h,g as D,e as F}from"./index.Ck-5ZlV-.js";import{H as Y,S as Z,I as N,g as U}from"./Spinner.svelte_svelte_type_style_lang.Df5Tmw8H.js";import"./entry.Dq0cEQhD.js";import{C as x,i as A,j as T,V as ee,r as te}from"./Track.JPZt6Yd8.js";import{A as re,m as ne}from"./util.CWYqaP8a.js";function le(f){let e;return{c(){e=y(f[5])},l(n){e=C(n,f[5])},m(n,t){w(n,e,t)},p(n,t){t&32&&L(e,n[5])},d(n){n&&k(e)}}}function ae(f){let e,n;return e=new A({props:{secondary:!0,loading:f[6],$$slots:{default:[se]},$$scope:{ctx:f}}}),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,a){const r={};a&64&&(r.loading=t[6]),a&512&&(r.$$scope={dirty:a,ctx:t}),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}function fe(f){let e,n;return e=new Z({props:{x:!0,class:"justify-center gap-4",$$slots:{default:[ce]},$$scope:{ctx:f}}}),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,a){const r={};a&584&&(r.$$scope={dirty:a,ctx:t}),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}function ie(f){let e,n;return e=new A({props:{secondary:!0,loading:f[6],$$slots:{default:[me]},$$scope:{ctx:f}}}),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,a){const r={};a&64&&(r.loading=t[6]),a&520&&(r.$$scope={dirty:a,ctx:t}),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}function se(f){let e;return{c(){e=y("Loading...")},l(n){e=C(n,"Loading...")},m(n,t){w(n,e,t)},d(n){n&&k(e)}}}function oe(f){let e,n,t=f[3].collection.size+"",a,r;return e=new N({props:{name:"note",sm:!0}}),{c(){d(e.$$.fragment),n=H(),a=y(t)},l(l){p(e.$$.fragment,l),n=I(l),a=C(l,t)},m(l,s){b(e,l,s),w(l,n,s),w(l,a,s),r=!0},p(l,s){(!r||s&8)&&t!==(t=l[3].collection.size+"")&&L(a,t)},i(l){r||(m(e.$$.fragment,l),r=!0)},o(l){_(e.$$.fragment,l),r=!1},d(l){l&&(k(n),k(a)),h(e,l)}}}function ue(f){let e,n,t=T(f[3].collection.duration)+"",a,r;return e=new N({props:{name:"clock",sm:!0}}),{c(){d(e.$$.fragment),n=H(),a=y(t)},l(l){p(e.$$.fragment,l),n=I(l),a=C(l,t)},m(l,s){b(e,l,s),w(l,n,s),w(l,a,s),r=!0},p(l,s){(!r||s&8)&&t!==(t=T(l[3].collection.duration)+"")&&L(a,t)},i(l){r||(m(e.$$.fragment,l),r=!0)},o(l){_(e.$$.fragment,l),r=!1},d(l){l&&(k(n),k(a)),h(e,l)}}}function ce(f){let e,n,t,a;return e=new A({props:{secondary:!0,loading:f[6],$$slots:{default:[oe]},$$scope:{ctx:f}}}),t=new A({props:{secondary:!0,loading:f[6],$$slots:{default:[ue]},$$scope:{ctx:f}}}),{c(){d(e.$$.fragment),n=H(),d(t.$$.fragment)},l(r){p(e.$$.fragment,r),n=I(r),p(t.$$.fragment,r)},m(r,l){b(e,r,l),w(r,n,l),b(t,r,l),a=!0},p(r,l){const s={};l&64&&(s.loading=r[6]),l&520&&(s.$$scope={dirty:l,ctx:r}),e.$set(s);const o={};l&64&&(o.loading=r[6]),l&520&&(o.$$scope={dirty:l,ctx:r}),t.$set(o)},i(r){a||(m(e.$$.fragment,r),m(t.$$.fragment,r),a=!0)},o(r){_(e.$$.fragment,r),_(t.$$.fragment,r),a=!1},d(r){r&&k(n),h(e,r),h(t,r)}}}function me(f){let e=f[3].artists.map(z).join(", ")+"",n;return{c(){n=y(e)},l(t){n=C(t,e)},m(t,a){w(t,n,a)},p(t,a){a&8&&e!==(e=t[3].artists.map(z).join(", ")+"")&&L(n,e)},d(t){t&&k(n)}}}function _e(f){let e,n,t,a,r,l,s,o;e=new Y({props:{center:!0,loading:f[6],$$slots:{default:[le]},$$scope:{ctx:f}}});const $=[ie,fe,ae],c=[];function v(i,g){return g&10&&(t=null),g&8&&(a=null),t==null&&(t=!!(i[1]&&i[7](i[3])&&"artists"in i[3])),t?0:(a==null&&(a=!!(i[7](i[3])&&i[3].collection)),a?1:i[0]?-1:2)}return~(r=v(f,-1))&&(l=c[r]=$[r](f)),{c(){d(e.$$.fragment),n=H(),l&&l.c(),s=S()},l(i){p(e.$$.fragment,i),n=I(i),l&&l.l(i),s=S()},m(i,g){b(e,i,g),w(i,n,g),~r&&c[r].m(i,g),w(i,s,g),o=!0},p(i,g){const j={};g&64&&(j.loading=i[6]),g&544&&(j.$$scope={dirty:g,ctx:i}),e.$set(j);let u=r;r=v(i,g),r===u?~r&&c[r].p(i,g):(l&&(D(),_(c[u],1,1,()=>{c[u]=null}),F()),~r?(l=c[r],l?l.p(i,g):(l=c[r]=$[r](i),l.c()),m(l,1),l.m(s.parentNode,s)):l=null)},i(i){o||(m(e.$$.fragment,i),m(l),o=!0)},o(i){_(e.$$.fragment,i),_(l),o=!1},d(i){i&&(k(n),k(s)),h(e,i),~r&&c[r].d(i)}}}function $e(f){let e,n;return e=new re({props:{round:!!f[0],of:f[4],slot:"after"}}),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,a){const r={};a&1&&(r.round=!!t[0]),a&16&&(r.of=t[4]),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}function ge(f){let e,n;return e=new x({props:{interactive:!!f[2]&&!f[6],href:f[2],$$slots:{after:[$e],default:[_e]},$$scope:{ctx:f}}}),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,[a]){const r={};a&68&&(r.interactive=!!t[2]&&!t[6]),a&4&&(r.href=t[2]),a&635&&(r.$$scope={dirty:a,ctx:t}),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}const z=f=>f.title;function de(f,e,n){let t,a,r,l,{playlist:s=void 0}=e,{artist:o=void 0}=e,{album:$=void 0}=e,{href:c=void 0}=e;const v=i=>typeof i=="object";return f.$$set=i=>{"playlist"in i&&n(8,s=i.playlist),"artist"in i&&n(0,o=i.artist),"album"in i&&n(1,$=i.album),"href"in i&&n(2,c=i.href)},f.$$.update=()=>{f.$$.dirty&259&&n(3,t=s||o||$),f.$$.dirty&8&&n(6,a=t===!0),f.$$.dirty&8&&n(5,r=v(t)?t.title:"Loading..."),f.$$.dirty&8&&n(4,l=v(t)?t:void 0)},[o,$,c,t,l,r,a,v,s]}class G extends q{constructor(e){super(),B(this,e,de,ge,E,{playlist:8,artist:0,album:1,href:2})}}function pe(f){let e,n;const t=[{[f[0]]:!0}];let a={};for(let r=0;r<t.length;r+=1)a=V(a,t[r]);return e=new G({props:a}),{c(){d(e.$$.fragment)},l(r){p(e.$$.fragment,r)},m(r,l){b(e,r,l),n=!0},p(r,l){const s=l&1?U(t,[{[r[0]]:!0}]):{};e.$set(s)},i(r){n||(m(e.$$.fragment,r),n=!0)},o(r){_(e.$$.fragment,r),n=!1},d(r){h(e,r)}}}function be(f){let e,n,t,a,r;return n=new N({props:{name:"plus",xxl:!0}}),{c(){e=M("button"),d(n.$$.fragment),this.h()},l(l){e=P(l,"BUTTON",{class:!0});var s=Q(e);p(n.$$.fragment,s),s.forEach(k),this.h()},h(){R(e,"class","p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight focus-visible:outline-none focus-visible:ring-primary-600")},m(l,s){w(l,e,s),b(n,e,null),t=!0,a||(r=W(e,"click",f[10]),a=!0)},p:X,i(l){t||(m(n.$$.fragment,l),t=!0)},o(l){_(n.$$.fragment,l),t=!1},d(l){l&&k(e),h(n),a=!1,r()}}}function he(f){let e,n;const t=[{href:f[1]+"/"+f[0]+"#"+f[12].id},{[f[0]]:f[12]}];let a={};for(let r=0;r<t.length;r+=1)a=V(a,t[r]);return e=new G({props:a}),{c(){d(e.$$.fragment)},l(r){p(e.$$.fragment,r)},m(r,l){b(e,r,l),n=!0},p(r,l){const s=l&4099?U(t,[{href:r[1]+"/"+r[0]+"#"+r[12].id},l&4097&&{[r[0]]:r[12]}]):{};e.$set(s)},i(r){n||(m(e.$$.fragment,r),n=!0)},o(r){_(e.$$.fragment,r),n=!1},d(r){h(e,r)}}}function ke(f){let e,n,t,a;const r=[he,be,pe],l=[];function s(o,$){return o[12]?0:o[12]===null?1:2}return e=s(f),n=l[e]=r[e](f),{c(){n.c(),t=S()},l(o){n.l(o),t=S()},m(o,$){l[e].m(o,$),w(o,t,$),a=!0},p(o,$){let c=e;e=s(o),e===c?l[e].p(o,$):(D(),_(l[c],1,1,()=>{l[c]=null}),F(),n=l[e],n?n.p(o,$):(n=l[e]=r[e](o),n.c()),m(n,1),n.m(t.parentNode,t))},i(o){a||(m(n),a=!0)},o(o){_(n),a=!1},d(o){o&&k(t),l[e].d(o)}}}function we(f){let e,n;return e=new ee({props:{sortable:f[2]&&!f[4],key:ve,columns:"20rem",prerender:f[3],gap:16,animate:!0,items:f[5],$$slots:{default:[ke,({item:t})=>({12:t}),({item:t})=>t?4096:0]},$$scope:{ctx:f}}}),e.$on("edit",f[7]),e.$on("end",f[11]),{c(){d(e.$$.fragment)},l(t){p(e.$$.fragment,t)},m(t,a){b(e,t,a),n=!0},p(t,[a]){const r={};a&20&&(r.sortable=t[2]&&!t[4]),a&8&&(r.prerender=t[3]),a&32&&(r.items=t[5]),a&12291&&(r.$$scope={dirty:a,ctx:t}),e.$set(r)},i(t){n||(m(e.$$.fragment,t),n=!0)},o(t){_(e.$$.fragment,t),n=!1},d(t){h(e,t)}}}const ve=f=>f==null?void 0:f.id;function je(f,e,n){let t;const a=J();let{of:r=void 0}=e,{style:l}=e,{expandable:s=!1}=e,{href:o="/library"}=e,{editable:$=!1}=e,{prerender:c=3}=e,{filter:v=""}=e;function i({detail:u}){var O;!u.item||u.action!=="rearrange"||a("rearrange",{id:u.item.id,after:(O=u.after)==null?void 0:O.id})}const g=()=>a("create");function j(u){K.call(this,f,u)}return f.$$set=u=>{"of"in u&&n(8,r=u.of),"style"in u&&n(0,l=u.style),"expandable"in u&&n(9,s=u.expandable),"href"in u&&n(1,o=u.href),"editable"in u&&n(2,$=u.editable),"prerender"in u&&n(3,c=u.prerender),"filter"in u&&n(4,v=u.filter)},f.$$.update=()=>{f.$$.dirty&792&&n(5,t=r&&te(r)?(s?[...r,null]:r).filter(ne(v)):Array.from({length:c}))},[l,o,$,c,v,t,a,i,r,s,g,j]}class Le extends q{constructor(e){super(),B(this,e,je,we,E,{of:8,style:0,expandable:9,href:1,editable:2,prerender:3,filter:4})}}export{Le as O};