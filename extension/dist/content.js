"use strict";(()=>{var Y,b,Se,lt,D,we,Ne,Pe,Ee,se,re,ae,pt,G={},J=[],ct=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Q=Array.isArray;function P(t,e){for(var n in e)t[n]=e[n];return t}function le(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function ut(t,e,n){var o,a,r,s={};for(r in e)r=="key"?o=e[r]:r=="ref"?a=e[r]:s[r]=e[r];if(arguments.length>2&&(s.children=arguments.length>3?Y.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)s[r]===void 0&&(s[r]=t.defaultProps[r]);return V(t,s,o,a,null)}function V(t,e,n,o,a){var r={type:t,props:e,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++Se,__i:-1,__u:0};return a==null&&b.vnode!=null&&b.vnode(r),r}function C(t){return t.children}function K(t,e){this.props=t,this.context=e}function O(t,e){if(e==null)return t.__?O(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?O(t):null}function dt(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,o=[],a=[],r=P({},e);r.__v=e.__v+1,b.vnode&&b.vnode(r),pe(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,o,n??O(e),!!(32&e.__u),a),r.__v=e.__v,r.__.__k[r.__i]=r,Ie(o,r,a),e.__e=e.__=null,r.__e!=n&&Ae(r)}}function Ae(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Ae(t)}function ke(t){(!t.__d&&(t.__d=!0)&&D.push(t)&&!X.__r++||we!=b.debounceRendering)&&((we=b.debounceRendering)||Ne)(X)}function X(){for(var t,e=1;D.length;)D.length>e&&D.sort(Pe),t=D.shift(),e=D.length,dt(t);X.__r=0}function De(t,e,n,o,a,r,s,c,d,p,_){var l,f,u,g,v,y,m,h=o&&o.__k||J,E=e.length;for(d=_t(n,e,h,d,E),l=0;l<E;l++)(u=n.__k[l])!=null&&(f=u.__i!=-1&&h[u.__i]||G,u.__i=l,y=pe(t,u,f,a,r,s,c,d,p,_),g=u.__e,u.ref&&f.ref!=u.ref&&(f.ref&&ce(f.ref,null,u),_.push(u.ref,u.__c||g,u)),v==null&&g!=null&&(v=g),(m=!!(4&u.__u))||f.__k===u.__k?d=Re(u,d,t,m):typeof u.type=="function"&&y!==void 0?d=y:g&&(d=g.nextSibling),u.__u&=-7);return n.__e=v,d}function _t(t,e,n,o,a){var r,s,c,d,p,_=n.length,l=_,f=0;for(t.__k=new Array(a),r=0;r<a;r++)(s=e[r])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=t.__k[r]=V(null,s,null,null,null):Q(s)?s=t.__k[r]=V(C,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=t.__k[r]=V(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):t.__k[r]=s,d=r+f,s.__=t,s.__b=t.__b+1,c=null,(p=s.__i=ft(s,n,d,l))!=-1&&(l--,(c=n[p])&&(c.__u|=2)),c==null||c.__v==null?(p==-1&&(a>_?f--:a<_&&f++),typeof s.type!="function"&&(s.__u|=4)):p!=d&&(p==d-1?f--:p==d+1?f++:(p>d?f--:f++,s.__u|=4))):t.__k[r]=null;if(l)for(r=0;r<_;r++)(c=n[r])!=null&&!(2&c.__u)&&(c.__e==o&&(o=O(c)),Me(c,c));return o}function Re(t,e,n,o){var a,r;if(typeof t.type=="function"){for(a=t.__k,r=0;a&&r<a.length;r++)a[r]&&(a[r].__=t,e=Re(a[r],e,n,o));return e}t.__e!=e&&(o&&(e&&t.type&&!e.parentNode&&(e=O(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function ft(t,e,n,o){var a,r,s,c=t.key,d=t.type,p=e[n],_=p!=null&&(2&p.__u)==0;if(p===null&&c==null||_&&c==p.key&&d==p.type)return n;if(o>(_?1:0)){for(a=n-1,r=n+1;a>=0||r<e.length;)if((p=e[s=a>=0?a--:r++])!=null&&!(2&p.__u)&&c==p.key&&d==p.type)return s}return-1}function Ce(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||ct.test(e)?n:n+"px"}function j(t,e,n,o,a){var r,s;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)n&&e in n||Ce(t.style,e,"");if(n)for(e in n)o&&n[e]==o[e]||Ce(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(Ee,"$1")),s=e.toLowerCase(),e=s in t||e=="onFocusOut"||e=="onFocusIn"?s.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=n,n?o?n.u=o.u:(n.u=se,t.addEventListener(e,r?ae:re,r)):t.removeEventListener(e,r?ae:re,r);else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Te(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e.t==null)e.t=se++;else if(e.t<n.u)return;return n(b.event?b.event(e):e)}}}function pe(t,e,n,o,a,r,s,c,d,p){var _,l,f,u,g,v,y,m,h,E,A,L,xe,q,oe,S=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),r=[c=e.__e=n.__e]),(_=b.__b)&&_(e);e:if(typeof S=="function")try{if(m=e.props,h="prototype"in S&&S.prototype.render,E=(_=S.contextType)&&o[_.__c],A=_?E?E.props.value:_.__:o,n.__c?y=(l=e.__c=n.__c).__=l.__E:(h?e.__c=l=new S(m,A):(e.__c=l=new K(m,A),l.constructor=S,l.render=ht),E&&E.sub(l),l.state||(l.state={}),l.__n=o,f=l.__d=!0,l.__h=[],l._sb=[]),h&&l.__s==null&&(l.__s=l.state),h&&S.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=P({},l.__s)),P(l.__s,S.getDerivedStateFromProps(m,l.__s))),u=l.props,g=l.state,l.__v=e,f)h&&S.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),h&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(h&&S.getDerivedStateFromProps==null&&m!==u&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(m,A),e.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(m,l.__s,A)===!1){e.__v!=n.__v&&(l.props=m,l.state=l.__s,l.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(I){I&&(I.__=e)}),J.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&s.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(m,l.__s,A),h&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(u,g,v)})}if(l.context=A,l.props=m,l.__P=t,l.__e=!1,L=b.__r,xe=0,h)l.state=l.__s,l.__d=!1,L&&L(e),_=l.render(l.props,l.state,l.context),J.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,L&&L(e),_=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++xe<25);l.state=l.__s,l.getChildContext!=null&&(o=P(P({},o),l.getChildContext())),h&&!f&&l.getSnapshotBeforeUpdate!=null&&(v=l.getSnapshotBeforeUpdate(u,g)),q=_!=null&&_.type===C&&_.key==null?Oe(_.props.children):_,c=De(t,Q(q)?q:[q],e,n,o,a,r,s,c,d,p),l.base=e.__e,e.__u&=-161,l.__h.length&&s.push(l),y&&(l.__E=l.__=null)}catch(I){if(e.__v=null,d||r!=null)if(I.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;r[r.indexOf(c)]=null,e.__e=c}else{for(oe=r.length;oe--;)le(r[oe]);ie(e)}else e.__e=n.__e,e.__k=n.__k,I.then||ie(e);b.__e(I,e,n)}else r==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=mt(n.__e,e,n,o,a,r,s,d,p);return(_=b.diffed)&&_(e),128&e.__u?void 0:c}function ie(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(ie))}function Ie(t,e,n){for(var o=0;o<n.length;o++)ce(n[o],n[++o],n[++o]);b.__c&&b.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(r){r.call(a)})}catch(r){b.__e(r,a.__v)}})}function Oe(t){return typeof t!="object"||t==null||t.__b>0?t:Q(t)?t.map(Oe):P({},t)}function mt(t,e,n,o,a,r,s,c,d){var p,_,l,f,u,g,v,y=n.props||G,m=e.props,h=e.type;if(h=="svg"?a="http://www.w3.org/2000/svg":h=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),r!=null){for(p=0;p<r.length;p++)if((u=r[p])&&"setAttribute"in u==!!h&&(h?u.localName==h:u.nodeType==3)){t=u,r[p]=null;break}}if(t==null){if(h==null)return document.createTextNode(m);t=document.createElementNS(a,h,m.is&&m),c&&(b.__m&&b.__m(e,r),c=!1),r=null}if(h==null)y===m||c&&t.data==m||(t.data=m);else{if(r=r&&Y.call(t.childNodes),!c&&r!=null)for(y={},p=0;p<t.attributes.length;p++)y[(u=t.attributes[p]).name]=u.value;for(p in y)u=y[p],p=="dangerouslySetInnerHTML"?l=u:p=="children"||p in m||p=="value"&&"defaultValue"in m||p=="checked"&&"defaultChecked"in m||j(t,p,null,u,a);for(p in m)u=m[p],p=="children"?f=u:p=="dangerouslySetInnerHTML"?_=u:p=="value"?g=u:p=="checked"?v=u:c&&typeof u!="function"||y[p]===u||j(t,p,u,y[p],a);if(_)c||l&&(_.__html==l.__html||_.__html==t.innerHTML)||(t.innerHTML=_.__html),e.__k=[];else if(l&&(t.innerHTML=""),De(e.type=="template"?t.content:t,Q(f)?f:[f],e,n,o,h=="foreignObject"?"http://www.w3.org/1999/xhtml":a,r,s,r?r[0]:n.__k&&O(n,0),c,d),r!=null)for(p=r.length;p--;)le(r[p]);c||(p="value",h=="progress"&&g==null?t.removeAttribute("value"):g!=null&&(g!==t[p]||h=="progress"&&!g||h=="option"&&g!=y[p])&&j(t,p,g,y[p],a),p="checked",v!=null&&v!=t[p]&&j(t,p,v,y[p],a))}return t}function ce(t,e,n){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(a){b.__e(a,n)}}function Me(t,e,n){var o,a;if(b.unmount&&b.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||ce(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){b.__e(r,e)}o.base=o.__P=null}if(o=t.__k)for(a=0;a<o.length;a++)o[a]&&Me(o[a],e,n||typeof t.type!="function");n||le(t.__e),t.__c=t.__=t.__e=void 0}function ht(t,e,n){return this.constructor(t,n)}function M(t,e,n){var o,a,r,s;e==document&&(e=document.documentElement),b.__&&b.__(t,e),a=(o=typeof n=="function")?null:n&&n.__k||e.__k,r=[],s=[],pe(e,t=(!o&&n||e).__k=ut(C,null,[t]),a||G,G,e.namespaceURI,!o&&n?[n]:a?null:e.firstChild?Y.call(e.childNodes):null,r,!o&&n?n:a?a.__e:e.firstChild,o,s),Ie(r,t,s)}Y=J.slice,b={__e:function(t,e,n,o){for(var a,r,s;e=e.__;)if((a=e.__c)&&!a.__)try{if((r=a.constructor)&&r.getDerivedStateFromError!=null&&(a.setState(r.getDerivedStateFromError(t)),s=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(t,o||{}),s=a.__d),s)return a.__E=a}catch(c){t=c}throw t}},Se=0,lt=function(t){return t!=null&&t.constructor===void 0},K.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=P({},this.state),typeof t=="function"&&(t=t(P({},n),this.props)),t&&P(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),ke(this))},K.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ke(this))},K.prototype.render=C,D=[],Ne=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Pe=function(t,e){return t.__v.__b-e.__v.__b},X.__r=0,Ee=/(PointerCapture)$|Capture$/i,se=0,re=Te(!1),ae=Te(!0),pt=0;var z,x,ue,Ue,ee=0,qe=[],w=b,He=w.__b,Le=w.__r,ze=w.diffed,Fe=w.__c,We=w.unmount,Be=w.__;function _e(t,e){w.__h&&w.__h(x,t,ee||e),ee=0;var n=x.__H||(x.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function k(t){return ee=1,gt(Ke,t)}function gt(t,e,n){var o=_e(z++,2);if(o.t=t,!o.__c&&(o.__=[n?n(e):Ke(void 0,e),function(c){var d=o.__N?o.__N[0]:o.__[0],p=o.t(d,c);d!==p&&(o.__N=[p,o.__[1]],o.__c.setState({}))}],o.__c=x,!x.__f)){var a=function(c,d,p){if(!o.__c.__H)return!0;var _=o.__c.__H.__.filter(function(f){return f.__c});if(_.every(function(f){return!f.__N}))return!r||r.call(this,c,d,p);var l=o.__c.props!==c;return _.some(function(f){if(f.__N){var u=f.__[0];f.__=f.__N,f.__N=void 0,u!==f.__[0]&&(l=!0)}}),r&&r.call(this,c,d,p)||l};x.__f=!0;var r=x.shouldComponentUpdate,s=x.componentWillUpdate;x.componentWillUpdate=function(c,d,p){if(this.__e){var _=r;r=void 0,a(c,d,p),r=_}s&&s.call(this,c,d,p)},x.shouldComponentUpdate=a}return o.__N||o.__}function fe(t,e){var n=_e(z++,3);!w.__s&&Ve(n.__H,e)&&(n.__=t,n.u=e,x.__H.__h.push(n))}function bt(t,e){var n=_e(z++,7);return Ve(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function je(t,e){return ee=8,bt(function(){return t},e)}function vt(){for(var t;t=qe.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Z),e.__h.some(de),e.__h=[]}catch(n){e.__h=[],w.__e(n,t.__v)}}}w.__b=function(t){x=null,He&&He(t)},w.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Be&&Be(t,e)},w.__r=function(t){Le&&Le(t),z=0;var e=(x=t.__c).__H;e&&(ue===x?(e.__h=[],x.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Z),e.__h.some(de),e.__h=[],z=0)),ue=x},w.diffed=function(t){ze&&ze(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(qe.push(e)!==1&&Ue===w.requestAnimationFrame||((Ue=w.requestAnimationFrame)||yt)(vt)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),ue=x=null},w.__c=function(t,e){e.some(function(n){try{n.__h.some(Z),n.__h=n.__h.filter(function(o){return!o.__||de(o)})}catch(o){e.some(function(a){a.__h&&(a.__h=[])}),e=[],w.__e(o,n.__v)}}),Fe&&Fe(t,e)},w.unmount=function(t){We&&We(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(o){try{Z(o)}catch(a){e=a}}),n.__H=void 0,e&&w.__e(e,n.__v))};var $e=typeof requestAnimationFrame=="function";function yt(t){var e,n=function(){clearTimeout(o),$e&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(n,35);$e&&(e=requestAnimationFrame(n))}function Z(t){var e=x,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),x=e}function de(t){var e=x;t.__c=t.__(),x=e}function Ve(t,e){return!t||t.length!==e.length||e.some(function(n,o){return n!==t[o]})}function Ke(t,e){return typeof e=="function"?e(t):e}var F={async getAuth(){try{let t=await chrome.runtime.sendMessage({type:"GET_AUTH"});if(t?.success&&t.data){let e=t.data;return console.log("[AuthStorage] Token check:",{hasToken:!!e.token,expiresAt:new Date(e.expiresAt).toISOString(),now:new Date().toISOString(),isExpired:Date.now()>e.expiresAt}),Date.now()>e.expiresAt-3e5?(console.log("[AuthStorage] Token expired or about to expire"),null):e}return console.log("[AuthStorage] No auth in storage"),null}catch(t){return console.error("[AuthStorage] Error:",t),null}},async setAuth(t){try{console.log("[AuthStorage] Saving auth:",{hasToken:!!t.token,expiresAt:new Date(t.expiresAt).toISOString()}),await chrome.runtime.sendMessage({type:"STORE_AUTH",data:t})}catch(e){console.error("[AuthStorage] Set error:",e)}},async clearAuth(){try{await chrome.runtime.sendMessage({type:"CLEAR_AUTH"})}catch(t){console.error("[AuthStorage] Clear error:",t)}},async isAuthenticated(){return await this.getAuth()!==null},async getValidToken(){return(await this.getAuth())?.token||null}};var Ge="http://localhost:3000",Je=1e4,Xe=3,N=class extends Error{constructor(n,o,a,r=!1){super(n);this.code=o;this.status=a;this.isRetryable=r;this.name="CRMClientError"}},me=class{async getHeaders(){let e=await F.getValidToken();if(console.log("[CRMClient] Getting headers, token exists:",!!e),!e)throw new N("Sesi habis. Silakan login ulang.","NOT_AUTHENTICATED",401,!1);return{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}}async fetchWithTimeout(e,n,o=Je){let a=new AbortController,r=setTimeout(()=>a.abort(),o);try{return await fetch(e,{...n,signal:a.signal})}catch(s){throw s instanceof Error&&s.name==="AbortError"?new N("Request timeout. Server tidak merespons dalam waktu 10 detik.","TIMEOUT",void 0,!0):s}finally{clearTimeout(r)}}async fetchWithRetry(e,n,o=0){let a=await this.getHeaders(),r=`${Ge}/api/extension${e}`;console.log(`[CRMClient] Fetching (attempt ${o+1}/${Xe}):`,r);try{let s=await this.fetchWithTimeout(r,{...n,headers:{...a,...n?.headers}});if(console.log("[CRMClient] Response status:",s.status),!s.ok){if(s.status===401)throw console.log("[CRMClient] 401 - Clearing auth"),await F.clearAuth(),new N("Sesi habis. Silakan login ulang.","NOT_AUTHENTICATED",401,!1);if(s.status>=500&&s.status<600){let p=await s.text();throw new N(`Server error: ${p||s.statusText}`,"SERVER_ERROR",s.status,!0)}let d=await s.text();throw console.error("[CRMClient] Error response:",d),new N(d||`HTTP ${s.status}: ${s.statusText}`,"HTTP_ERROR",s.status,!1)}return await s.json()}catch(s){if(s instanceof N&&s.isRetryable&&o<Xe-1){let c=Math.pow(2,o)*1e3;return console.log(`[CRMClient] Retrying after ${c}ms...`),await new Promise(d=>setTimeout(d,c)),this.fetchWithRetry(e,n,o+1)}throw console.error("[CRMClient] Fetch error:",s),s}}async fetch(e,n){return this.fetchWithRetry(e,n)}async login(e,n){let o=await this.fetchWithTimeout(`${Ge}/api/extension/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:n})},Je);if(!o.ok){let r=await o.json().catch(()=>({}));throw new N(r.error||"Login gagal","LOGIN_FAILED",o.status,!1)}let a=await o.json();return a.expiresAt||(a.expiresAt=Date.now()+3600*1e3),console.log("[CRMClient] Login success, expires:",new Date(a.expiresAt).toISOString()),a}async getContact(e,n,o=!0){let a=new URLSearchParams({phone:e});n&&a.append("name",n),o&&a.append("autoCreate","true");try{return await this.fetch(`/contact?${a.toString()}`)}catch(r){if(r instanceof N&&r.status===404)return null;throw r}}async addNote(e){await this.fetch("/note",{method:"POST",body:JSON.stringify(e)})}async updateStage(e){await this.fetch("/stage",{method:"PATCH",body:JSON.stringify(e)})}async assignContact(e){await this.fetch("/assign",{method:"POST",body:JSON.stringify(e)})}async addReminder(e){await this.fetch("/reminder",{method:"POST",body:JSON.stringify(e)})}},U=new me;var xt=0,Mt=Array.isArray;function i(t,e,n,o,a,r){e||(e={});var s,c,d=e;if("ref"in d)for(c in d={},e)c=="ref"?s=e[c]:d[c]=e[c];var p={type:t,props:d,key:n,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--xt,__i:-1,__u:0,__source:a,__self:r};if(typeof t=="function"&&(s=t.defaultProps))for(c in s)d[c]===void 0&&(d[c]=s[c]);return b.vnode&&b.vnode(p),p}function Ye({contact:t}){let e=o=>o.split(" ").map(a=>a[0]).join("").toUpperCase().slice(0,2),n=o=>o.startsWith("62")?`+62 ${o.slice(2,5)}-${o.slice(5,9)}-${o.slice(9)}`:o;return i("div",{className:"pp-header",children:[i("div",{className:"pp-flex pp-items-center pp-gap-3",children:[i("div",{className:"pp-avatar",children:e(t.name)}),i("div",{className:"pp-flex-1 pp-min-w-0",children:[i("h2",{className:"pp-header-title pp-truncate",children:t.name}),i("p",{className:"pp-header-subtitle",children:n(t.phone)})]})]}),t.tags.length>0&&i("div",{className:"pp-flex pp-flex-wrap pp-mt-3",children:t.tags.map(o=>i("span",{className:"pp-tag",style:{backgroundColor:o.color+"20",color:o.color},children:o.name},o.id))})]})}function Qe({contact:t}){let e=(n,o)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:o||"IDR",minimumFractionDigits:0}).format(n);return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Pipeline"}),t.pipeline?i("div",{children:[i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-mb-2",children:i("span",{className:"pp-stage-badge",children:t.pipeline.stage})}),i("p",{className:"pp-text-sm pp-text-gray-600",children:t.pipeline.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada pipeline"}),t.deal&&i("div",{className:"pp-mt-3 pp-p-3 pp-bg-gray-50 pp-rounded",children:[i("p",{className:"pp-text-xs pp-text-gray-500 pp-mb-1",children:"Deal Value"}),i("p",{className:"pp-deal-value",children:e(t.deal.value,t.deal.currency)}),i("p",{className:"pp-text-sm pp-text-gray-600 pp-mt-1",children:t.deal.title})]})]})}function Ze({contact:t,onNoteAdded:e}){let[n,o]=k(!1),[a,r]=k(""),[s,c]=k(!1),[d,p]=k(null),_=u=>new Date(u).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});return i("div",{className:"pp-section",children:[i("div",{className:"pp-flex pp-justify-between pp-items-center pp-mb-3",children:[i("h3",{className:"pp-section-title pp-mb-0",children:"Catatan"}),!n&&i("button",{className:"pp-button pp-button-sm",onClick:()=>o(!0),children:"+ Tambah"})]}),d==="SESSION_EXPIRED"&&i("div",{style:{background:"#fee2e2",color:"#dc2626",padding:"12px",borderRadius:"6px",fontSize:"13px",marginBottom:"12px"},children:[i("p",{style:{margin:"0 0 8px 0"},children:"Sesi habis. Silakan login ulang."}),i("button",{onClick:()=>{chrome.runtime.sendMessage({type:"OPEN_POPUP"})},style:{background:"#dc2626",color:"white",border:"none",padding:"6px 12px",borderRadius:"4px",fontSize:"12px",cursor:"pointer"},children:"Login Ulang"})]}),d&&d!=="SESSION_EXPIRED"&&i("div",{style:{background:"#fee2e2",color:"#dc2626",padding:"8px",borderRadius:"4px",fontSize:"12px",marginBottom:"12px"},children:d}),n&&i("form",{onSubmit:async u=>{if(u.preventDefault(),!(!a.trim()||s)){c(!0),p(null);try{await U.addNote({contactId:t.id,content:a.trim()}),r(""),o(!1),e()}catch(g){if(console.error("Failed to add note:",g),g instanceof Error){let v=g.message;v.includes("NOT_AUTHENTICATED")||v.includes("401")||v.includes("Sesi habis")?p("SESSION_EXPIRED"):v.includes("TIMEOUT")||v.includes("timeout")?p("TIMEOUT: Server tidak merespons. Silakan coba lagi."):v.includes("NETWORK")||v.includes("network")?p("NETWORK_ERROR: Periksa koneksi internet Anda."):p(v)}else p("Gagal menambahkan catatan. Silakan coba lagi.")}finally{c(!1)}}},className:"pp-mb-3",children:[i("textarea",{className:"pp-textarea pp-mb-2",placeholder:"Tulis catatan...",value:a,onChange:u=>r(u.target.value),disabled:s}),i("div",{className:"pp-flex pp-gap-2",children:[i("button",{type:"submit",className:"pp-button pp-button-primary pp-button-sm",disabled:s||!a.trim(),children:s?"Menyimpan...":"Simpan"}),i("button",{type:"button",className:"pp-button pp-button-sm",onClick:()=>{o(!1),r(""),p(null)},disabled:s,children:"Batal"})]})]}),t.recentNotes.length===0?i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada catatan"}):i("div",{children:t.recentNotes.map(u=>i("div",{className:"pp-note-item",children:[i("p",{children:u.content}),i("p",{className:"pp-note-date",children:[u.authorName," \u2022 ",_(u.createdAt)]})]},u.id))})]})}function et({contact:t}){return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Pipeline"}),t.pipeline?i("div",{children:[i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-mb-2",children:i("span",{className:"pp-stage-badge",children:t.pipeline.stage})}),i("p",{className:"pp-text-sm pp-text-gray-600",children:t.pipeline.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum ada pipeline"}),i("p",{style:{fontSize:"11px",color:"#9ca3af",marginTop:"8px"},children:"* Update pipeline via dashboard CRM"})]})}function tt({contact:t}){let e=n=>n.split(" ").map(o=>o[0]).join("").toUpperCase().slice(0,2);return i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Assign ke"}),t.assignedTo?i("div",{className:"pp-flex pp-items-center pp-gap-2 pp-p-2 pp-bg-gray-50 pp-rounded",children:[i("div",{className:"pp-avatar",style:{width:"28px",height:"28px",fontSize:"12px"},children:e(t.assignedTo.name)}),i("span",{className:"pp-text-sm pp-font-medium",children:t.assignedTo.name})]}):i("p",{className:"pp-text-sm pp-text-gray-500",children:"Belum di-assign"}),i("p",{style:{fontSize:"11px",color:"#9ca3af",marginTop:"8px"},children:"* Assign via dashboard CRM"})]})}function nt({contact:t,onTaskAdded:e}){let[n,o]=k(!1),[a,r]=k(""),[s,c]=k(""),[d,p]=k(!1),_=async u=>{if(u.preventDefault(),!(!a.trim()||!s||d)){p(!0);try{await U.addReminder({contactId:t.id,title:a.trim(),dueDate:new Date(s).toISOString()}),r(""),c(""),o(!1),e()}catch(g){console.error("Failed to add reminder:",g),alert("Gagal menambahkan reminder")}finally{p(!1)}}},l=u=>u.toISOString().slice(0,16),f=()=>{let u=new Date;return u.setDate(u.getDate()+1),l(u)};return n?i("div",{className:"pp-section",children:[i("h3",{className:"pp-section-title",children:"Tambah Reminder"}),i("form",{onSubmit:_,children:[i("input",{type:"text",className:"pp-input pp-mb-2",placeholder:"Judul reminder...",value:a,onChange:u=>r(u.target.value),disabled:d}),i("input",{type:"datetime-local",className:"pp-input pp-mb-3",value:s,onChange:u=>c(u.target.value),disabled:d}),i("div",{className:"pp-flex pp-gap-2",children:[i("button",{type:"submit",className:"pp-button pp-button-primary pp-button-sm",disabled:d||!a.trim()||!s,children:d?"Menyimpan...":"Simpan"}),i("button",{type:"button",className:"pp-button pp-button-sm",onClick:()=>{o(!1),r(""),c("")},disabled:d,children:"Batal"})]})]})]}):i("div",{className:"pp-section",children:i("button",{className:"pp-button",onClick:()=>{o(!0),c(f())},children:"\u{1F4C5} Tambah Reminder"})})}function he({type:t,message:e,onRetry:n}){let o={not_authenticated:{title:"Belum Login",message:"Silakan login melalui extension",action:"Buka Extension"},not_found:{title:"Kontak Tidak Ditemukan",message:"Nomor ini belum terdaftar di CRM",action:null},network_error:{title:"Koneksi Error",message:e||"Gagal terhubung ke server. Coba lagi?",action:"Coba Lagi"},unknown:{title:"Terjadi Kesalahan",message:e||"Silakan coba lagi nanti",action:"Coba Lagi"}},{title:a,message:r,action:s}=o[t];return i("div",{className:"pp-login-prompt",children:[i("div",{className:"pp-login-prompt-icon",children:i("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[t==="not_authenticated"&&i("path",{d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}),t==="not_found"&&i("path",{d:"M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}),(t==="network_error"||t==="unknown")&&i("path",{d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"})]})}),i("h3",{className:"pp-font-semibold pp-text-gray-900 pp-mb-2",children:a}),i("p",{className:"pp-text-sm pp-text-gray-500 pp-mb-3",children:r}),t==="not_authenticated"&&i("div",{style:{fontSize:"12px",color:"#6b7280",marginBottom:"12px",textAlign:"center"},children:"Click icon PelangganPro di toolbar Chrome untuk login"}),s&&i("button",{className:"pp-button pp-button-primary pp-button-sm",onClick:()=>{t==="not_authenticated"?chrome.runtime.sendMessage({type:"OPEN_POPUP"}):n&&n()},children:s})]})}var te="pelangganpro_sidebar_visible";function ot({phone:t}){let[e,n]=k(null),[o,a]=k("idle"),[r,s]=k(null),[c,d]=k(null),[p,_]=k(!0),[l,f]=k(!1);fe(()=>{chrome.storage.local.get(te).then(m=>{m[te]!==void 0&&_(m[te])})},[]);let u=()=>{let m=!p;_(m),chrome.storage.local.set({[te]:m})},g=je(async()=>{if(t){a("loading"),s(null);try{let m=await F.getAuth();if(d(!!m),!m){a("error"),s("NOT_AUTHENTICATED");return}let h=await U.getContact(t);h?(n(h),a("success")):(n(null),a("error"),s("NOT_FOUND"))}catch(m){if(console.error("Failed to load contact:",m),a("error"),m instanceof Error){let h=m.message;h.includes("NOT_AUTHENTICATED")||h.includes("401")||h.includes("Sesi habis")?(s("NOT_AUTHENTICATED"),d(!1)):h.includes("TIMEOUT")||h.includes("timeout")?s("TIMEOUT: Server tidak merespons dalam waktu 10 detik."):h.includes("NETWORK")||h.includes("network")?s("NETWORK_ERROR"):s("UNKNOWN")}else s("UNKNOWN")}}},[t]);fe(()=>{g()},[g]);let v=()=>{f(!0),g().finally(()=>{setTimeout(()=>f(!1),500)})},y=()=>i("button",{onClick:u,style:{position:"fixed",right:p?"320px":"0",top:"50%",transform:"translateY(-50%)",zIndex:1e4,width:"24px",height:"60px",background:"#4f46e5",color:"white",border:"none",borderRadius:"4px 0 0 4px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",boxShadow:"-2px 0 8px rgba(0,0,0,0.1)",transition:"right 0.3s ease"},title:p?"Sembunyikan CRM":"Tampilkan CRM",children:p?"\u203A":"\u2039"});return p?o==="loading"&&!e?i(C,{children:[i(y,{}),i("div",{className:"pp-sidebar",children:i("div",{className:"pp-loading",children:i("div",{className:"pp-spinner"})})})]}):o==="error"||!c?i(C,{children:[i(y,{}),i("div",{className:"pp-sidebar",children:i(he,{type:r==="NOT_AUTHENTICATED"?"not_authenticated":r==="NOT_FOUND"?"not_found":r==="NETWORK_ERROR"?"network_error":"unknown",message:r&&r!=="NOT_AUTHENTICATED"&&r!=="NOT_FOUND"&&r!=="NETWORK_ERROR"&&r!=="UNKNOWN"?r:void 0,onRetry:v})})]}):e?i(C,{children:[i(y,{}),i("div",{className:"pp-sidebar",children:[l&&i("div",{style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg, #4f46e5, #7c3aed)",animation:"pp-pulse 1s infinite"}}),i(Ye,{contact:e}),e.upcomingTask&&i("div",{className:"pp-section",style:{background:"#fef3c7"},children:[i("h3",{className:"pp-section-title",children:"\u23F0 Reminder"}),i("p",{className:"pp-font-medium",children:e.upcomingTask.title}),i("p",{className:"pp-text-xs pp-text-gray-600 pp-mt-1",children:new Date(e.upcomingTask.dueDate).toLocaleDateString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})]}),i(Qe,{contact:e}),i(Ze,{contact:e,onNoteAdded:v}),i(et,{contact:e,onStageChanged:v}),i(tt,{contact:e,onAssigned:v}),i(nt,{contact:e,onTaskAdded:v}),i("div",{className:"pp-section",style:{marginTop:"auto",borderTop:"1px solid #e5e7eb"},children:i("button",{className:"pp-button pp-button-sm",onClick:()=>window.open(`http://localhost:3000/contacts/${e.id}`,"_blank"),children:"Buka di CRM \u2192"})})]})]}):i(C,{children:[i(y,{}),i("div",{className:"pp-sidebar",children:i(he,{type:"not_found"})})]}):i(y,{})}var wt=[()=>{let t=window.location.pathname,n=window.location.search.match(/[?&]phone=(\d+)/);if(n){let a=n[1];return{raw:a,normalized:W(a),source:"url"}}let o=t.match(/\/c\/(\d+)/);if(o){let a=o[1];return{raw:a,normalized:W(a),source:"url"}}return null},()=>{let t=['[data-testid="conversation-header"] [data-id]','[data-testid="conversation-info-header"] [data-id]','[data-icon="default-user"]',"header [data-id]"];for(let e of t){let n=document.querySelector(e),o=n?.getAttribute("data-id")||n?.parentElement?.getAttribute("data-id");if(o){let a=o.match(/(\d+)/);if(a){let r=a[1];return{raw:r,normalized:W(r),source:"header"}}}}return null},()=>{let t=['[aria-label*="+"]','[aria-label*="62"]','[title*="+"]','[title*="62"]'];for(let e of t){let n=document.querySelectorAll(e);for(let o of n){let r=(o.getAttribute("aria-label")||o.getAttribute("title")||"").match(/[\+]?[\d\s\-\(\)]+/);if(r){let s=r[0].replace(/\D/g,"");if(s.length>=10)return{raw:s,normalized:W(s),source:"aria-label"}}}}return null},()=>{let t=document.querySelectorAll('[data-testid="drawer-left"] span, [data-testid="contact-info"] span');for(let e of t){let o=(e.textContent||"").match(/[\+]?[\d\s\-\(\)]+/);if(o){let a=o[0].replace(/\D/g,"");if(a.length>=10&&a.length<=15)return{raw:a,normalized:W(a),source:"header"}}}return null}];function W(t){let e=t.replace(/\D/g,"");return e.startsWith("0")?e="62"+e.slice(1):e.startsWith("8")?e="62"+e:e.startsWith("62")&&(e=e),e}function kt(){for(let t of wt)try{let e=t();if(e)return e}catch{}return null}function rt(){let t=kt();return!t||t.normalized.length>15||window.location.pathname.includes("status")?null:t.normalized}var ne=class{constructor(e){this.observer=null;this.lastPhone=null;this.debounceTimer=null;this.DEBOUNCE_MS=300;this.callback=e}start(){if(this.observer)return;this.checkForChanges(),this.observer=new MutationObserver(n=>{this.debounceTimer&&window.clearTimeout(this.debounceTimer),this.debounceTimer=window.setTimeout(()=>{this.checkForChanges()},this.DEBOUNCE_MS)});let e=document.querySelector("#app");e&&this.observer.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-id","class","aria-label"]}),this.observeUrlChanges(),console.log("[PelangganPro] Chat observer started")}stop(){this.observer&&(this.observer.disconnect(),this.observer=null),this.debounceTimer&&(window.clearTimeout(this.debounceTimer),this.debounceTimer=null),console.log("[PelangganPro] Chat observer stopped")}checkForChanges(){let e=rt();e!==this.lastPhone&&(this.lastPhone=e,this.callback(e))}observeUrlChanges(){let e=history.pushState,n=history.replaceState;history.pushState=(...o)=>{e.apply(history,o),this.handleUrlChange()},history.replaceState=(...o)=>{n.apply(history,o),this.handleUrlChange()},window.addEventListener("popstate",()=>{this.handleUrlChange()})}handleUrlChange(){window.setTimeout(()=>{this.checkForChanges()},100)}getCurrentPhone(){return this.lastPhone}};var ge="pelangganpro-crm-host";function at(){let t=document.getElementById(ge);if(t){let r=t.shadowRoot;if(r){let s=r.getElementById("pp-root");if(s)return{host:t,shadow:r,container:s}}}t&&t.remove();let e=document.createElement("div");e.id=ge,e.style.cssText=`
    position: fixed;
    right: 0;
    top: 0;
    width: 320px;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
  `;let n=e.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=Ct(),n.appendChild(o);let a=document.createElement("div");return a.id="pp-root",a.style.cssText=`
    width: 100%;
    height: 100%;
    pointer-events: auto;
  `,n.appendChild(a),document.body.appendChild(e),{host:e,shadow:n,container:a}}function it(){let t=document.getElementById(ge);t&&t.remove()}function Ct(){return`
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
  `}var R=null,B=null,T=null,be=0,Tt=10,St="pelangganpro_auth",H=null;function $(){if(console.log("[PelangganPro] Extension initializing...",{url:window.location.href,timestamp:new Date().toISOString()}),!window.location.href.includes("web.whatsapp.com")){console.log("[PelangganPro] Not on WhatsApp Web, skipping");return}if(!document.querySelector("#app"))if(be++,console.log(`[PelangganPro] Waiting for #app... attempt ${be}`),be<Tt){setTimeout($,1e3);return}else{console.error("[PelangganPro] Failed to find #app after max attempts");return}console.log("[PelangganPro] #app found, creating shadow DOM...");let t=at();if(!t){console.error("[PelangganPro] Failed to create shadow host");return}T=t.container,console.log("[PelangganPro] Shadow DOM created successfully"),B=new ne(e=>{ye(e)}),B.start(),console.log("[PelangganPro] Chat observer started"),st(),chrome.runtime.onMessage.addListener((e,n,o)=>{if(e.type==="AUTH_REFRESH")return console.log("[PelangganPro] Auth refresh received, reloading sidebar..."),ve(),o({success:!0}),!0}),chrome.storage.onChanged.addListener((e,n)=>{n==="local"&&e[St]&&(console.log("[PelangganPro] Auth changed via storage, refreshing..."),ve())}),M(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-empty",children:i("p",{children:"Buka chat individual untuk melihat data CRM"})})}),T),console.log("[PelangganPro] Extension initialized successfully")}function st(){try{H=chrome.runtime.connect({name:"pelangganpro-sidebar"}),console.log("[PelangganPro] Connected to background script"),H.onDisconnect.addListener(()=>{console.log("[PelangganPro] Port disconnected, reconnecting..."),H=null,setTimeout(st,1e3)})}catch(t){console.error("[PelangganPro] Failed to connect to background:",t)}}function ve(){console.log("[PelangganPro] Handling auth refresh, current phone:",R),T&&M(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-loading",children:[i("div",{className:"pp-spinner"}),i("p",{style:{marginTop:"12px",fontSize:"13px",color:"#6b7280"},children:"Memperbarui sesi..."})]})}),T),setTimeout(()=>{R?ye(R):T&&M(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-empty",children:i("p",{children:"Buka chat individual untuk melihat data CRM"})})}),T)},500)}function ye(t){if(console.log("[PelangganPro] Phone changed:",t),R=t,!T){console.error("[PelangganPro] No sidebar container");return}if(t)try{M(i(ot,{phone:t},t),T),console.log("[PelangganPro] Sidebar rendered with phone:",t)}catch(e){console.error("[PelangganPro] Failed to render sidebar:",e)}else M(i("div",{className:"pp-sidebar",children:i("div",{className:"pp-empty",children:i("p",{children:"Buka chat individual untuk melihat data CRM"})})}),T)}function Nt(){console.log("[PelangganPro] Cleaning up..."),B&&(B.stop(),B=null),H&&(H.disconnect(),H=null),it(),T=null}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$):$();setTimeout($,2e3);window.addEventListener("beforeunload",Nt);window.pelangganproDebug={getCurrentPhone:()=>R,refresh:()=>R&&ye(R),getContainer:()=>T,reinit:$,forceAuthRefresh:ve};console.log("[PelangganPro] Content script loaded");})();
