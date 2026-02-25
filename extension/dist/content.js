"use strict";(()=>{var G,g,Ce,nt,E,ve,ke,Se,Ne,ae,ne,oe,ot,$={},V=[],rt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,J=Array.isArray;function N(t,e){for(var n in e)t[n]=e[n];return t}function ie(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function at(t,e,n){var o,a,r,p={};for(r in e)r=="key"?o=e[r]:r=="ref"?a=e[r]:p[r]=e[r];if(arguments.length>2&&(p.children=arguments.length>3?G.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)p[r]===void 0&&(p[r]=t.defaultProps[r]);return j(t,p,o,a,null)}function j(t,e,n,o,a){var r={type:t,props:e,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++Ce,__i:-1,__u:0};return a==null&&g.vnode!=null&&g.vnode(r),r}function k(t){return t.children}function q(t,e){this.props=t,this.context=e}function R(t,e){if(e==null)return t.__?R(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?R(t):null}function it(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,o=[],a=[],r=N({},e);r.__v=e.__v+1,g.vnode&&g.vnode(r),se(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,o,n??R(e),!!(32&e.__u),a),r.__v=e.__v,r.__.__k[r.__i]=r,Ae(o,r,a),e.__e=e.__=null,r.__e!=n&&Pe(r)}}function Pe(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Pe(t)}function ye(t){(!t.__d&&(t.__d=!0)&&E.push(t)&&!K.__r++||ve!=g.debounceRendering)&&((ve=g.debounceRendering)||ke)(K)}function K(){for(var t,e=1;E.length;)E.length>e&&E.sort(Se),t=E.shift(),e=E.length,it(t);K.__r=0}function Te(t,e,n,o,a,r,p,c,d,l,_){var s,f,u,m,h,x,v,b=o&&o.__k||V,P=e.length;for(d=st(n,e,b,d,P),s=0;s<P;s++)(u=n.__k[s])!=null&&(f=u.__i!=-1&&b[u.__i]||$,u.__i=s,x=se(t,u,f,a,r,p,c,d,l,_),m=u.__e,u.ref&&f.ref!=u.ref&&(f.ref&&pe(f.ref,null,u),_.push(u.ref,u.__c||m,u)),h==null&&m!=null&&(h=m),(v=!!(4&u.__u))||f.__k===u.__k?d=Ee(u,d,t,v):typeof u.type=="function"&&x!==void 0?d=x:m&&(d=m.nextSibling),u.__u&=-7);return n.__e=h,d}function st(t,e,n,o,a){var r,p,c,d,l,_=n.length,s=_,f=0;for(t.__k=new Array(a),r=0;r<a;r++)(p=e[r])!=null&&typeof p!="boolean"&&typeof p!="function"?(typeof p=="string"||typeof p=="number"||typeof p=="bigint"||p.constructor==String?p=t.__k[r]=j(null,p,null,null,null):J(p)?p=t.__k[r]=j(k,{children:p},null,null,null):p.constructor===void 0&&p.__b>0?p=t.__k[r]=j(p.type,p.props,p.key,p.ref?p.ref:null,p.__v):t.__k[r]=p,d=r+f,p.__=t,p.__b=t.__b+1,c=null,(l=p.__i=pt(p,n,d,s))!=-1&&(s--,(c=n[l])&&(c.__u|=2)),c==null||c.__v==null?(l==-1&&(a>_?f--:a<_&&f++),typeof p.type!="function"&&(p.__u|=4)):l!=d&&(l==d-1?f--:l==d+1?f++:(l>d?f--:f++,p.__u|=4))):t.__k[r]=null;if(s)for(r=0;r<_;r++)(c=n[r])!=null&&!(2&c.__u)&&(c.__e==o&&(o=R(c)),Re(c,c));return o}function Ee(t,e,n,o){var a,r;if(typeof t.type=="function"){for(a=t.__k,r=0;a&&r<a.length;r++)a[r]&&(a[r].__=t,e=Ee(a[r],e,n,o));return e}t.__e!=e&&(o&&(e&&t.type&&!e.parentNode&&(e=R(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function pt(t,e,n,o){var a,r,p,c=t.key,d=t.type,l=e[n],_=l!=null&&(2&l.__u)==0;if(l===null&&c==null||_&&c==l.key&&d==l.type)return n;if(o>(_?1:0)){for(a=n-1,r=n+1;a>=0||r<e.length;)if((l=e[p=a>=0?a--:r++])!=null&&!(2&l.__u)&&c==l.key&&d==l.type)return p}return-1}function xe(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||rt.test(e)?n:n+"px"}function W(t,e,n,o,a){var r,p;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)n&&e in n||xe(t.style,e,"");if(n)for(e in n)o&&n[e]==o[e]||xe(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(Ne,"$1")),p=e.toLowerCase(),e=p in t||e=="onFocusOut"||e=="onFocusIn"?p.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=n,n?o?n.u=o.u:(n.u=ae,t.addEventListener(e,r?oe:ne,r)):t.removeEventListener(e,r?oe:ne,r);else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function we(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e.t==null)e.t=ae++;else if(e.t<n.u)return;return n(g.event?g.event(e):e)}}}function se(t,e,n,o,a,r,p,c,d,l){var _,s,f,u,m,h,x,v,b,P,T,O,be,B,te,S=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),r=[c=e.__e=n.__e]),(_=g.__b)&&_(e);e:if(typeof S=="function")try{if(v=e.props,b="prototype"in S&&S.prototype.render,P=(_=S.contextType)&&o[_.__c],T=_?P?P.props.value:_.__:o,n.__c?x=(s=e.__c=n.__c).__=s.__E:(b?e.__c=s=new S(v,T):(e.__c=s=new q(v,T),s.constructor=S,s.render=ct),P&&P.sub(s),s.state||(s.state={}),s.__n=o,f=s.__d=!0,s.__h=[],s._sb=[]),b&&s.__s==null&&(s.__s=s.state),b&&S.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=N({},s.__s)),N(s.__s,S.getDerivedStateFromProps(v,s.__s))),u=s.props,m=s.state,s.__v=e,f)b&&S.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),b&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(b&&S.getDerivedStateFromProps==null&&v!==u&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(v,T),e.__v==n.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(v,s.__s,T)===!1){e.__v!=n.__v&&(s.props=v,s.state=s.__s,s.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(D){D&&(D.__=e)}),V.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&p.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(v,s.__s,T),b&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(u,m,h)})}if(s.context=T,s.props=v,s.__P=t,s.__e=!1,O=g.__r,be=0,b)s.state=s.__s,s.__d=!1,O&&O(e),_=s.render(s.props,s.state,s.context),V.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,O&&O(e),_=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++be<25);s.state=s.__s,s.getChildContext!=null&&(o=N(N({},o),s.getChildContext())),b&&!f&&s.getSnapshotBeforeUpdate!=null&&(h=s.getSnapshotBeforeUpdate(u,m)),B=_!=null&&_.type===k&&_.key==null?De(_.props.children):_,c=Te(t,J(B)?B:[B],e,n,o,a,r,p,c,d,l),s.base=e.__e,e.__u&=-161,s.__h.length&&p.push(s),x&&(s.__E=s.__=null)}catch(D){if(e.__v=null,d||r!=null)if(D.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;r[r.indexOf(c)]=null,e.__e=c}else{for(te=r.length;te--;)ie(r[te]);re(e)}else e.__e=n.__e,e.__k=n.__k,D.then||re(e);g.__e(D,e,n)}else r==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=lt(n.__e,e,n,o,a,r,p,d,l);return(_=g.diffed)&&_(e),128&e.__u?void 0:c}function re(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(re))}function Ae(t,e,n){for(var o=0;o<n.length;o++)pe(n[o],n[++o],n[++o]);g.__c&&g.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(r){r.call(a)})}catch(r){g.__e(r,a.__v)}})}function De(t){return typeof t!="object"||t==null||t.__b>0?t:J(t)?t.map(De):N({},t)}function lt(t,e,n,o,a,r,p,c,d){var l,_,s,f,u,m,h,x=n.props||$,v=e.props,b=e.type;if(b=="svg"?a="http://www.w3.org/2000/svg":b=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),r!=null){for(l=0;l<r.length;l++)if((u=r[l])&&"setAttribute"in u==!!b&&(b?u.localName==b:u.nodeType==3)){t=u,r[l]=null;break}}if(t==null){if(b==null)return document.createTextNode(v);t=document.createElementNS(a,b,v.is&&v),c&&(g.__m&&g.__m(e,r),c=!1),r=null}if(b==null)x===v||c&&t.data==v||(t.data=v);else{if(r=r&&G.call(t.childNodes),!c&&r!=null)for(x={},l=0;l<t.attributes.length;l++)x[(u=t.attributes[l]).name]=u.value;for(l in x)u=x[l],l=="dangerouslySetInnerHTML"?s=u:l=="children"||l in v||l=="value"&&"defaultValue"in v||l=="checked"&&"defaultChecked"in v||W(t,l,null,u,a);for(l in v)u=v[l],l=="children"?f=u:l=="dangerouslySetInnerHTML"?_=u:l=="value"?m=u:l=="checked"?h=u:c&&typeof u!="function"||x[l]===u||W(t,l,u,x[l],a);if(_)c||s&&(_.__html==s.__html||_.__html==t.innerHTML)||(t.innerHTML=_.__html),e.__k=[];else if(s&&(t.innerHTML=""),Te(e.type=="template"?t.content:t,J(f)?f:[f],e,n,o,b=="foreignObject"?"http://www.w3.org/1999/xhtml":a,r,p,r?r[0]:n.__k&&R(n,0),c,d),r!=null)for(l=r.length;l--;)ie(r[l]);c||(l="value",b=="progress"&&m==null?t.removeAttribute("value"):m!=null&&(m!==t[l]||b=="progress"&&!m||b=="option"&&m!=x[l])&&W(t,l,m,x[l],a),l="checked",h!=null&&h!=t[l]&&W(t,l,h,x[l],a))}return t}function pe(t,e,n){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(a){g.__e(a,n)}}function Re(t,e,n){var o,a;if(g.unmount&&g.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||pe(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){g.__e(r,e)}o.base=o.__P=null}if(o=t.__k)for(a=0;a<o.length;a++)o[a]&&Re(o[a],e,n||typeof t.type!="function");n||ie(t.__e),t.__c=t.__=t.__e=void 0}function ct(t,e,n){return this.constructor(t,n)}function X(t,e,n){var o,a,r,p;e==document&&(e=document.documentElement),g.__&&g.__(t,e),a=(o=typeof n=="function")?null:n&&n.__k||e.__k,r=[],p=[],se(e,t=(!o&&n||e).__k=at(k,null,[t]),a||$,$,e.namespaceURI,!o&&n?[n]:a?null:e.firstChild?G.call(e.childNodes):null,r,!o&&n?n:a?a.__e:e.firstChild,o,p),Ae(r,t,p)}G=V.slice,g={__e:function(t,e,n,o){for(var a,r,p;e=e.__;)if((a=e.__c)&&!a.__)try{if((r=a.constructor)&&r.getDerivedStateFromError!=null&&(a.setState(r.getDerivedStateFromError(t)),p=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(t,o||{}),p=a.__d),p)return a.__E=a}catch(c){t=c}throw t}},Ce=0,nt=function(t){return t!=null&&t.constructor===void 0},q.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=N({},this.state),typeof t=="function"&&(t=t(N({},n),this.props)),t&&N(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),ye(this))},q.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ye(this))},q.prototype.render=k,E=[],ke=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Se=function(t,e){return t.__v.__b-e.__v.__b},K.__r=0,Ne=/(PointerCapture)$|Capture$/i,ae=0,ne=we(!1),oe=we(!0),ot=0;var H,y,le,Ie,Q=0,Be=[],w=g,Me=w.__b,Oe=w.__r,He=w.diffed,Ue=w.__c,ze=w.unmount,Le=w.__;function ue(t,e){w.__h&&w.__h(y,t,Q||e),Q=0;var n=y.__H||(y.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function C(t){return Q=1,ut(qe,t)}function ut(t,e,n){var o=ue(H++,2);if(o.t=t,!o.__c&&(o.__=[n?n(e):qe(void 0,e),function(c){var d=o.__N?o.__N[0]:o.__[0],l=o.t(d,c);d!==l&&(o.__N=[l,o.__[1]],o.__c.setState({}))}],o.__c=y,!y.__f)){var a=function(c,d,l){if(!o.__c.__H)return!0;var _=o.__c.__H.__.filter(function(f){return f.__c});if(_.every(function(f){return!f.__N}))return!r||r.call(this,c,d,l);var s=o.__c.props!==c;return _.some(function(f){if(f.__N){var u=f.__[0];f.__=f.__N,f.__N=void 0,u!==f.__[0]&&(s=!0)}}),r&&r.call(this,c,d,l)||s};y.__f=!0;var r=y.shouldComponentUpdate,p=y.componentWillUpdate;y.componentWillUpdate=function(c,d,l){if(this.__e){var _=r;r=void 0,a(c,d,l),r=_}p&&p.call(this,c,d,l)},y.shouldComponentUpdate=a}return o.__N||o.__}function de(t,e){var n=ue(H++,3);!w.__s&&je(n.__H,e)&&(n.__=t,n.u=e,y.__H.__h.push(n))}function dt(t,e){var n=ue(H++,7);return je(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function We(t,e){return Q=8,dt(function(){return t},e)}function _t(){for(var t;t=Be.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Y),e.__h.some(ce),e.__h=[]}catch(n){e.__h=[],w.__e(n,t.__v)}}}w.__b=function(t){y=null,Me&&Me(t)},w.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Le&&Le(t,e)},w.__r=function(t){Oe&&Oe(t),H=0;var e=(y=t.__c).__H;e&&(le===y?(e.__h=[],y.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Y),e.__h.some(ce),e.__h=[],H=0)),le=y},w.diffed=function(t){He&&He(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Be.push(e)!==1&&Ie===w.requestAnimationFrame||((Ie=w.requestAnimationFrame)||ft)(_t)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),le=y=null},w.__c=function(t,e){e.some(function(n){try{n.__h.some(Y),n.__h=n.__h.filter(function(o){return!o.__||ce(o)})}catch(o){e.some(function(a){a.__h&&(a.__h=[])}),e=[],w.__e(o,n.__v)}}),Ue&&Ue(t,e)},w.unmount=function(t){ze&&ze(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(o){try{Y(o)}catch(a){e=a}}),n.__H=void 0,e&&w.__e(e,n.__v))};var Fe=typeof requestAnimationFrame=="function";function ft(t){var e,n=function(){clearTimeout(o),Fe&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(n,35);Fe&&(e=requestAnimationFrame(n))}function Y(t){var e=y,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),y=e}function ce(t){var e=y;t.__c=t.__(),y=e}function je(t,e){return!t||t.length!==e.length||e.some(function(n,o){return n!==t[o]})}function qe(t,e){return typeof e=="function"?e(t):e}var U={async getAuth(){try{let t=await chrome.runtime.sendMessage({type:"GET_AUTH"});if(t?.success&&t.data){let e=t.data;return console.log("[AuthStorage] Token check:",{hasToken:!!e.token,expiresAt:new Date(e.expiresAt).toISOString(),now:new Date().toISOString(),isExpired:Date.now()>e.expiresAt}),Date.now()>e.expiresAt-3e5?(console.log("[AuthStorage] Token expired or about to expire"),null):e}return console.log("[AuthStorage] No auth in storage"),null}catch(t){return console.error("[AuthStorage] Error:",t),null}},async setAuth(t){try{console.log("[AuthStorage] Saving auth:",{hasToken:!!t.token,expiresAt:new Date(t.expiresAt).toISOString()}),await chrome.runtime.sendMessage({type:"STORE_AUTH",data:t})}catch(e){console.error("[AuthStorage] Set error:",e)}},async clearAuth(){try{await chrome.runtime.sendMessage({type:"CLEAR_AUTH"})}catch(t){console.error("[AuthStorage] Clear error:",t)}},async isAuthenticated(){return await this.getAuth()!==null},async getValidToken(){return(await this.getAuth())?.token||null}};var $e="http://localhost:3000",_e=class{async getHeaders(){let e=await U.getValidToken();if(console.log("[CRMClient] Getting headers, token exists:",!!e),!e)throw new Error("NOT_AUTHENTICATED");return{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}async fetch(e,n){let o=await this.getHeaders(),a=`${$e}/api/extension${e}`;console.log("[CRMClient] Fetching:",a),console.log("[CRMClient] Headers:",{...o,Authorization:"Bearer ***"});try{let r=await fetch(a,{...n,headers:{...o,...n?.headers}});if(console.log("[CRMClient] Response status:",r.status),!r.ok){if(r.status===401)throw console.log("[CRMClient] 401 - Clearing auth"),await U.clearAuth(),new Error("NOT_AUTHENTICATED");let c=await r.text();throw console.error("[CRMClient] Error response:",c),new Error(`HTTP ${r.status}: ${c}`)}return await r.json()}catch(r){throw console.error("[CRMClient] Fetch error:",r),r}}async login(e,n){let o=await fetch(`${$e}/api/extension/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:n})});if(!o.ok){let r=await o.json().catch(()=>({}));throw new Error(r.error||"Login failed")}let a=await o.json();return a.expiresAt||(a.expiresAt=Date.now()+3600*1e3),console.log("[CRMClient] Login success, expires:",new Date(a.expiresAt).toISOString()),a}async getContact(e,n,o=!0){let a=new URLSearchParams({phone:e});n&&a.append("name",n),o&&a.append("autoCreate","true");try{return await this.fetch(`/contact?${a.toString()}`)}catch(r){if(r instanceof Error&&r.message.includes("404"))return null;throw r}}async addNote(e){await this.fetch("/note",{method:"POST",body:JSON.stringify(e)})}async updateStage(e){await this.fetch("/stage",{method:"PATCH",body:JSON.stringify(e)})}async assignContact(e){await this.fetch("/assign",{method:"POST",body:JSON.stringify(e)})}async addReminder(e){await this.fetch("/reminder",{method:"POST",body:JSON.stringify(e)})}},I=new _e;var mt=0,Et=Array.isArray;function i(t,e,n,o,a,r){e||(e={});var p,c,d=e;if("ref"in d)for(c in d={},e)c=="ref"?p=e[c]:d[c]=e[c];var l={type:t,props:d,key:n,ref:p,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--mt,__i:-1,__u:0,__source:a,__self:r};if(typeof t=="function"&&(p=t.defaultProps))for(c in p)d[c]===void 0&&(d[c]=p[c]);return g.vnode&&g.vnode(l),l}function Ve({contact:t}){let e=o=>o.split(" ").map(a=>a[0]).join("").toUpperCase().slice(0,2),n=o=>o.startsWith("62")?`+62 ${o.slice(2,5)}-${o.slice(5,9)}-${o.slice(9)}`:o;return i("div",{className:"pp-header",children:[i("div",{className:"pp-flex pp-items-center pp-gap-3",children:[i("div",{className:"pp-avatar",children:e(t.name)}),i("div",{className:"pp-flex-1 pp-min-w-0",children:[i("h2",{className:"pp-header-title pp-truncate",children:t.name}),i("p",{className:"pp-header-subtitle",children:n(t.phone)})]})]}),t.tags.length>0&&i("div",{className:"pp-flex pp-flex-wrap pp-mt-3",children:t.tags.map(o=>i("span",{className:"pp-tag",style:{backgroundColor:o.color+"20",color:o.color},children:o.name},o.id))})]})}function Ke({contact:t}){let e=(n,o)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:o||"IDR",minimumFractionDigits:0}).format(n);return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Pipeline"}),t.pipeline?i("div",{children:[i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-mb-2",children:i("span",{className:"pp-stage-badge",children:t.pipeline.stage})}),i("p",{className:"pp-text-sm pp-text-gray-600",children:t.pipeline.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada pipeline"}),t.deal&&i("div",{className:"pp-mt-3 pp-p-3 pp-bg-gray-50 pp-rounded",children:[i("p",{className:"pp-text-xs pp-text-gray-500 pp-mb-1",children:"Deal Value"}),i("p",{className:"pp-deal-value",children:e(t.deal.value,t.deal.currency)}),i("p",{className:"pp-text-sm pp-text-gray-600 pp-mt-1",children:t.deal.title})]})]})}function Ge({contact:t,onNoteAdded:e}){let[n,o]=C(!1),[a,r]=C(""),[p,c]=C(!1),[d,l]=C(null),_=u=>new Date(u).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});return i("div",{className:"pp-section",children:[i("div",{className:"pp-flex pp-justify-between pp-items-center pp-mb-3",children:[i("h3",{className:"pp-section-title pp-mb-0",children:"Catatan"}),!n&&i("button",{className:"pp-button pp-button-sm",onClick:()=>o(!0),children:"+ Tambah"})]}),d==="SESSION_EXPIRED"&&i("div",{style:{background:"#fee2e2",color:"#dc2626",padding:"12px",borderRadius:"6px",fontSize:"13px",marginBottom:"12px"},children:[i("p",{style:{margin:"0 0 8px 0"},children:"Sesi habis. Silakan login ulang."}),i("button",{onClick:()=>{chrome.runtime.sendMessage({type:"OPEN_POPUP"})},style:{background:"#dc2626",color:"white",border:"none",padding:"6px 12px",borderRadius:"4px",fontSize:"12px",cursor:"pointer"},children:"Login Ulang"})]}),d&&d!=="SESSION_EXPIRED"&&i("div",{style:{background:"#fee2e2",color:"#dc2626",padding:"8px",borderRadius:"4px",fontSize:"12px",marginBottom:"12px"},children:d}),n&&i("form",{onSubmit:async u=>{if(u.preventDefault(),!(!a.trim()||p)){c(!0),l(null);try{await I.addNote({contactId:t.id,content:a.trim()}),r(""),o(!1),e()}catch(m){console.error("Failed to add note:",m);let h=m instanceof Error?m.message:"Gagal menambahkan catatan";h.includes("NOT_AUTHENTICATED")||h.includes("401")?l("SESSION_EXPIRED"):l(h)}finally{c(!1)}}},className:"pp-mb-3",children:[i("textarea",{className:"pp-textarea pp-mb-2",placeholder:"Tulis catatan...",value:a,onChange:u=>r(u.target.value),disabled:p}),i("div",{className:"pp-flex pp-gap-2",children:[i("button",{type:"submit",className:"pp-button pp-button-primary pp-button-sm",disabled:p||!a.trim(),children:p?"Menyimpan...":"Simpan"}),i("button",{type:"button",className:"pp-button pp-button-sm",onClick:()=>{o(!1),r(""),l(null)},disabled:p,children:"Batal"})]})]}),t.recentNotes.length===0?i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada catatan"}):i("div",{children:t.recentNotes.map(u=>i("div",{className:"pp-note-item",children:[i("p",{children:u.content}),i("p",{className:"pp-note-date",children:[u.authorName," \u2022 ",_(u.createdAt)]})]},u.id))})]})}function Je({contact:t}){return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Pipeline"}),t.pipeline?i("div",{children:[i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-mb-2",children:i("span",{className:"pp-stage-badge",children:t.pipeline.stage})}),i("p",{className:"pp-text-sm pp-text-gray-600",children:t.pipeline.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada pipeline"}),i("p",{style:{fontSize:"11px",color:"#9ca3af",marginTop:"8px"},children:"* Update pipeline via dashboard CRM"})]})}function Xe({contact:t}){let e=n=>n.split(" ").map(o=>o[0]).join("").toUpperCase().slice(0,2);return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Assign ke"}),t.assignedTo?i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-p-2 pp-bg-gray-50 pp-rounded",children:[i("div",{className:"pp-avatar",style:{width:"28px",height:"28px",fontSize:"12px"},children:e(t.assignedTo.name)}),i("span",{className:"pp-text-sm pp-font-medium",children:t.assignedTo.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum di-assign"}),i("p",{style:{fontSize:"11px",color:"#9ca3af",marginTop:"8px"},children:"* Assign via dashboard CRM"})]})}function Ye({contact:t,onTaskAdded:e}){let[n,o]=C(!1),[a,r]=C(""),[p,c]=C(""),[d,l]=C(!1),_=async u=>{if(u.preventDefault(),!(!a.trim()||!p||d)){l(!0);try{await I.addReminder({contactId:t.id,title:a.trim(),dueDate:new Date(p).toISOString()}),r(""),c(""),o(!1),e()}catch(m){console.error("Failed to add reminder:",m),alert("Gagal menambahkan reminder")}finally{l(!1)}}},s=u=>u.toISOString().slice(0,16),f=()=>{let u=new Date;return u.setDate(u.getDate()+1),s(u)};return n?i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Tambah Reminder"}),i("form",{onSubmit:_,children:[i("input",{type:"text",className:"pp-input pp-mb-2",placeholder:"Judul reminder...",value:a,onChange:u=>r(u.target.value),disabled:d}),i("input",{type:"datetime-local",className:"pp-input pp-mb-3",value:p,onChange:u=>c(u.target.value),disabled:d}),i("div",{className:"pp-flex pp-gap-2",children:[i("button",{type:"submit",className:"pp-button pp-button-primary pp-button-sm",disabled:d||!a.trim()||!p,children:d?"Menyimpan...":"Simpan"}),i("button",{type:"button",className:"pp-button pp-button-sm",onClick:()=>{o(!1),r(""),c("")},disabled:d,children:"Batal"})]})]})]}):i("div",{className:"pp-section",children:i("button",{className:"pp-button",onClick:()=>{o(!0),c(f())},children:"\u{1F4C5} Tambah Reminder"})})}function fe({type:t,onRetry:e}){let n={not_authenticated:{title:"Belum Login",message:"Silakan login melalui extension",action:"Buka Extension"},not_found:{title:"Kontak Tidak Ditemukan",message:"Nomor ini belum terdaftar di CRM",action:null},network_error:{title:"Koneksi Error",message:"Gagal terhubung ke server. Coba lagi?",action:"Coba Lagi"},unknown:{title:"Terjadi Kesalahan",message:"Silakan coba lagi nanti",action:"Coba Lagi"}},{title:o,message:a,action:r}=n[t];return i("div",{className:"pp-login-prompt",children:[i("div",{className:"pp-login-prompt-icon",children:i("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[t==="not_authenticated"&&i("path",{d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}),t==="not_found"&&i("path",{d:"M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}),(t==="network_error"||t==="unknown")&&i("path",{d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"})]})}),i("h3",{className:"pp-font-semibold pp-text-gray-900 pp-mb-2",children:o}),i("p",{className:"pp-text-sm pp-text-gray-500 pp-mb-3",children:a}),t==="not_authenticated"&&i("div",{style:{fontSize:"12px",color:"#6b7280",marginBottom:"12px",textAlign:"center"},children:"Click icon PelangganPro di toolbar Chrome untuk login"}),r&&i("button",{className:"pp-button pp-button-primary pp-button-sm",onClick:()=>{t==="not_authenticated"?chrome.runtime.sendMessage({type:"OPEN_POPUP"}):e&&e()},children:r})]})}var Z="pelangganpro_sidebar_visible";function Qe({phone:t}){let[e,n]=C(null),[o,a]=C("idle"),[r,p]=C(null),[c,d]=C(null),[l,_]=C(!0);de(()=>{chrome.storage.local.get(Z).then(h=>{h[Z]!==void 0&&_(h[Z])})},[]);let s=()=>{let h=!l;_(h),chrome.storage.local.set({[Z]:h})},f=We(async()=>{if(t){a("loading"),p(null);try{let h=await U.getAuth();if(d(!!h),!h){a("error"),p("NOT_AUTHENTICATED");return}let x=await I.getContact(t);x?(n(x),a("success")):(n(null),a("error"),p("NOT_FOUND"))}catch(h){console.error("Failed to load contact:",h),a("error"),h instanceof Error?h.message==="NOT_AUTHENTICATED"?(p("NOT_AUTHENTICATED"),d(!1)):h.message==="NETWORK_ERROR"?p("NETWORK_ERROR"):p("UNKNOWN"):p("UNKNOWN")}}},[t]);de(()=>{f()},[f]);let u=()=>{f()},m=()=>i("button",{onClick:s,style:{position:"fixed",right:l?"320px":"0",top:"50%",transform:"translateY(-50%)",zIndex:1e4,width:"24px",height:"60px",background:"#4f46e5",color:"white",border:"none",borderRadius:"4px 0 0 4px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",boxShadow:"-2px 0 8px rgba(0,0,0,0.1)",transition:"right 0.3s ease"},title:l?"Sembunyikan CRM":"Tampilkan CRM",children:l?"\u203A":"\u2039"});return l?o==="loading"&&!e?i(k,{children:[i(m,{}),i("div",{className:"pp-sidebar",children:i("div",{className:"pp-loading",children:i("div",{className:"pp-spinner"})})})]}):o==="error"||!c?i(k,{children:[i(m,{}),i("div",{className:"pp-sidebar",children:i(fe,{type:r==="NOT_AUTHENTICATED"?"not_authenticated":r==="NOT_FOUND"?"not_found":r==="NETWORK_ERROR"?"network_error":"unknown",onRetry:u})})]}):e?i(k,{children:[i(m,{}),i("div",{className:"pp-sidebar",children:[i(Ve,{contact:e}),e.upcomingTask&&i("div",{className:"pp-section",style:{background:"#fef3c7"},children:[i("h3",{className:"pp-section-title",children:"\u23F0 Reminder"}),i("p",{className:"pp-font-medium",children:e.upcomingTask.title}),i("p",{className:"pp-text-xs pp-text-gray-600 pp-mt-1",children:new Date(e.upcomingTask.dueDate).toLocaleDateString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})]}),i(Ke,{contact:e}),i(Ge,{contact:e,onNoteAdded:u}),i(Je,{contact:e,onStageChanged:u}),i(Xe,{contact:e,onAssigned:u}),i(Ye,{contact:e,onTaskAdded:u}),i("div",{className:"pp-section",style:{marginTop:"auto",borderTop:"1px solid #e5e7eb"},children:i("button",{className:"pp-button pp-button-sm",onClick:()=>window.open(`http://localhost:3000/contacts/${e.id}`,"_blank"),children:"Buka di CRM \u2192"})})]})]}):i(k,{children:[i(m,{}),i("div",{className:"pp-sidebar",children:i(fe,{type:"not_found"})})]}):i(m,{})}var ht=[()=>{let t=window.location.pathname,n=window.location.search.match(/[?&]phone=(\d+)/);if(n){let a=n[1];return{raw:a,normalized:z(a),source:"url"}}let o=t.match(/\/c\/(\d+)/);if(o){let a=o[1];return{raw:a,normalized:z(a),source:"url"}}return null},()=>{let t=['[data-testid="conversation-header"] [data-id]','[data-testid="conversation-info-header"] [data-id]','[data-icon="default-user"]',"header [data-id]"];for(let e of t){let n=document.querySelector(e),o=n?.getAttribute("data-id")||n?.parentElement?.getAttribute("data-id");if(o){let a=o.match(/(\d+)/);if(a){let r=a[1];return{raw:r,normalized:z(r),source:"header"}}}}return null},()=>{let t=['[aria-label*="+"]','[aria-label*="62"]','[title*="+"]','[title*="62"]'];for(let e of t){let n=document.querySelectorAll(e);for(let o of n){let r=(o.getAttribute("aria-label")||o.getAttribute("title")||"").match(/[\+]?[\d\s\-\(\)]+/);if(r){let p=r[0].replace(/\D/g,"");if(p.length>=10)return{raw:p,normalized:z(p),source:"aria-label"}}}}return null},()=>{let t=document.querySelectorAll('[data-testid="drawer-left"] span, [data-testid="contact-info"] span');for(let e of t){let o=(e.textContent||"").match(/[\+]?[\d\s\-\(\)]+/);if(o){let a=o[0].replace(/\D/g,"");if(a.length>=10&&a.length<=15)return{raw:a,normalized:z(a),source:"header"}}}return null}];function z(t){let e=t.replace(/\D/g,"");return e.startsWith("0")?e="62"+e.slice(1):e.startsWith("8")?e="62"+e:e.startsWith("62")&&(e=e),e}function gt(){for(let t of ht)try{let e=t();if(e)return e}catch{}return null}function Ze(){let t=gt();return!t||t.normalized.length>15||window.location.pathname.includes("status")?null:t.normalized}var ee=class{constructor(e){this.observer=null;this.lastPhone=null;this.debounceTimer=null;this.DEBOUNCE_MS=300;this.callback=e}start(){if(this.observer)return;this.checkForChanges(),this.observer=new MutationObserver(n=>{this.debounceTimer&&window.clearTimeout(this.debounceTimer),this.debounceTimer=window.setTimeout(()=>{this.checkForChanges()},this.DEBOUNCE_MS)});let e=document.querySelector("#app");e&&this.observer.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-id","class","aria-label"]}),this.observeUrlChanges(),console.log("[PelangganPro] Chat observer started")}stop(){this.observer&&(this.observer.disconnect(),this.observer=null),this.debounceTimer&&(window.clearTimeout(this.debounceTimer),this.debounceTimer=null),console.log("[PelangganPro] Chat observer stopped")}checkForChanges(){let e=Ze();e!==this.lastPhone&&(this.lastPhone=e,this.callback(e))}observeUrlChanges(){let e=history.pushState,n=history.replaceState;history.pushState=(...o)=>{e.apply(history,o),this.handleUrlChange()},history.replaceState=(...o)=>{n.apply(history,o),this.handleUrlChange()},window.addEventListener("popstate",()=>{this.handleUrlChange()})}handleUrlChange(){window.setTimeout(()=>{this.checkForChanges()},100)}getCurrentPhone(){return this.lastPhone}};var me="pelangganpro-crm-host";function et(){let t=document.getElementById(me);if(t){let r=t.shadowRoot;if(r){let p=r.getElementById("pp-root");if(p)return{host:t,shadow:r,container:p}}}t&&t.remove();let e=document.createElement("div");e.id=me,e.style.cssText=`
    position: fixed;
    right: 0;
    top: 0;
    width: 320px;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
  `;let n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=bt(),n.appendChild(o);let a=document.createElement("div");return a.id="pp-root",a.style.cssText=`
    width: 100%;
    height: 100%;
    pointer-events: auto;
  `,n.appendChild(a),document.body.appendChild(e),{host:e,shadow:n,container:a}}function tt(){let t=document.getElementById(me);t&&t.remove()}function bt(){return`
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Base */
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #111827;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    /* Utility Classes */
    .pp-flex { display: flex; }
    .pp-flex-col { flex-direction: column; }
    .pp-items-center { align-items: center; }
    .pp-justify-center { justify-content: center; }
    .pp-justify-between { justify-content: space-between; }
    .pp-gap-2 { gap: 8px; }
    .pp-gap-3 { gap: 12px; }
    
    .pp-w-full { width: 100%; }
    .pp-h-full { height: 100%; }
    
    .pp-p-3 { padding: 12px; }
    .pp-p-4 { padding: 16px; }
    .pp-px-3 { padding-left: 12px; padding-right: 12px; }
    .pp-py-2 { padding-top: 8px; padding-bottom: 8px; }
    
    .pp-mb-2 { margin-bottom: 8px; }
    .pp-mb-3 { margin-bottom: 12px; }
    .pp-mt-2 { margin-top: 8px; }
    
    .pp-text-sm { font-size: 13px; }
    .pp-text-xs { font-size: 11px; }
    .pp-text-lg { font-size: 16px; }
    .pp-font-medium { font-weight: 500; }
    .pp-font-semibold { font-weight: 600; }
    .pp-text-gray-500 { color: #6b7280; }
    .pp-text-gray-600 { color: #4b5563; }
    .pp-text-gray-900 { color: #111827; }
    
    .pp-bg-white { background-color: #ffffff; }
    .pp-bg-gray-50 { background-color: #f9fafb; }
    .pp-bg-gray-100 { background-color: #f3f4f6; }
    
    .pp-rounded { border-radius: 6px; }
    .pp-rounded-full { border-radius: 9999px; }
    
    .pp-border { border: 1px solid #e5e7eb; }
    .pp-border-b { border-bottom: 1px solid #e5e7eb; }
    
    /* Component Styles */
    .pp-sidebar {
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .pp-header {
      padding: 16px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      flex-shrink: 0;
    }
    
    .pp-header-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .pp-header-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .pp-section {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .pp-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 8px;
      letter-spacing: 0.025em;
    }
    
    .pp-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 500;
      background: #e0e7ff;
      color: #4338ca;
      margin-right: 4px;
      margin-bottom: 4px;
    }
    
    .pp-button {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      color: #374151;
    }
    
    .pp-button:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    .pp-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .pp-button-primary {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }
    
    .pp-button-primary:hover:not(:disabled) {
      background: #4338ca;
    }
    
    .pp-button-sm {
      padding: 4px 8px;
      font-size: 12px;
      width: auto;
    }
    
    .pp-input, .pp-textarea, .pp-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    
    .pp-input:focus, .pp-textarea:focus, .pp-select:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    .pp-textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .pp-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px;
    }
    
    .pp-note-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      border: 1px solid #f3f4f6;
    }
    
    .pp-note-date {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    
    .pp-deal-value {
      font-size: 18px;
      font-weight: 600;
      color: #059669;
    }
    
    .pp-stage-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: #dbeafe;
      color: #1e40af;
    }
    
    .pp-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .pp-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px;
    }
    
    .pp-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: pp-spin 0.8s linear infinite;
    }
    
    @keyframes pp-spin {
      to { transform: rotate(360deg); }
    }
    
    .pp-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 13px;
    }
    
    .pp-error {
      padding: 16px;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 6px;
      margin: 16px;
    }
    
    .pp-login-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
      text-align: center;
    }
    
    .pp-login-prompt-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #9ca3af;
    }
  `}var M=null,L=null,A=null,he=0,vt=10,yt="pelangganpro_auth";function F(){if(console.log("[PelangganPro] Extension initializing...",{url:window.location.href,timestamp:new Date().toISOString()}),!window.location.href.includes("web.whatsapp.com")){console.log("[PelangganPro] Not on WhatsApp Web, skipping");return}if(!document.querySelector("#app"))if(he++,console.log(`[PelangganPro] Waiting for #app... attempt ${he}`),he<vt){setTimeout(F,1e3);return}else{console.error("[PelangganPro] Failed to find #app after max attempts");return}console.log("[PelangganPro] #app found, creating shadow DOM...");let t=et();if(!t){console.error("[PelangganPro] Failed to create shadow host");return}A=t.container,console.log("[PelangganPro] Shadow DOM created successfully"),L=new ee(e=>{ge(e)}),L.start(),console.log("[PelangganPro] Chat observer started"),chrome.storage.onChanged.addListener((e,n)=>{n==="local"&&e[yt]&&(console.log("[PelangganPro] Auth changed, refreshing..."),M&&ge(M))}),X(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-empty",children:i("p",{children:"Buka chat individual untuk melihat data CRM"})})}),A),console.log("[PelangganPro] Extension initialized successfully")}function ge(t){if(console.log("[PelangganPro] Phone changed:",t),M=t,!A){console.error("[PelangganPro] No sidebar container");return}if(t)try{X(i(Qe,{phone:t}),A),console.log("[PelangganPro] Sidebar rendered with phone:",t)}catch(e){console.error("[PelangganPro] Failed to render sidebar:",e)}else X(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-empty",children:i("p",{children:"Buka chat individual untuk melihat data CRM"})})}),A)}function xt(){console.log("[PelangganPro] Cleaning up..."),L&&(L.stop(),L=null),tt(),A=null}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F):F();setTimeout(F,2e3);window.addEventListener("beforeunload",xt);window.pelangganproDebug={getCurrentPhone:()=>M,refresh:()=>M&&ge(M),getContainer:()=>A,reinit:F};console.log("[PelangganPro] Content script loaded");})();
