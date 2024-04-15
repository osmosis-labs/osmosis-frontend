/*! For license information please see 397.bundle.js.LICENSE.txt */
"use strict";(self.webpackChunk_keplr_wallet_extension=self.webpackChunk_keplr_wallet_extension||[]).push([[397],{16060:(e,t,r)=>{function n(){return n=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},n.apply(this,arguments)}var o;r.d(t,{RQ:()=>A,WK:()=>O,X3:()=>V,Zn:()=>S,aU:()=>o,cP:()=>d,fp:()=>h,kG:()=>i,q_:()=>l}),function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"}(o||(o={}));const a="popstate";function l(e){return void 0===e&&(e={}),function(e,t,r,l){void 0===l&&(l={});let{window:d=document.defaultView,v5Compat:p=!1}=l,h=d.history,m=o.Pop,f=null,g=y();function y(){return(h.state||{idx:null}).idx}function v(){m=o.Pop;let e=y(),t=null==e?null:e-g;g=e,f&&f({action:m,location:w.location,delta:t})}function b(e){let t="null"!==d.location.origin?d.location.origin:d.location.href,r="string"==typeof e?e:u(e);return i(t,"No window.location.(origin|href) available to create URL for href: "+r),new URL(r,t)}null==g&&(g=0,h.replaceState(n({},h.state,{idx:g}),""));let w={get action(){return m},get location(){return e(d,h)},listen(e){if(f)throw new Error("A history only accepts one active listener");return d.addEventListener(a,v),f=e,()=>{d.removeEventListener(a,v),f=null}},createHref:e=>t(d,e),createURL:b,encodeLocation(e){let t=b(e);return{pathname:t.pathname,search:t.search,hash:t.hash}},push:function(e,t){m=o.Push;let n=s(w.location,e,t);r&&r(n,e),g=y()+1;let a=c(n,g),l=w.createHref(n);try{h.pushState(a,"",l)}catch(e){d.location.assign(l)}p&&f&&f({action:m,location:w.location,delta:1})},replace:function(e,t){m=o.Replace;let n=s(w.location,e,t);r&&r(n,e),g=y();let a=c(n,g),l=w.createHref(n);h.replaceState(a,"",l),p&&f&&f({action:m,location:w.location,delta:0})},go:e=>h.go(e)};return w}((function(e,t){let{pathname:r="/",search:n="",hash:o=""}=d(e.location.hash.substr(1));return s("",{pathname:r,search:n,hash:o},t.state&&t.state.usr||null,t.state&&t.state.key||"default")}),(function(e,t){let r=e.document.querySelector("base"),n="";if(r&&r.getAttribute("href")){let t=e.location.href,r=t.indexOf("#");n=-1===r?t:t.slice(0,r)}return n+"#"+("string"==typeof t?t:u(t))}),(function(e,t){!function(e,t){if(!e){"undefined"!=typeof console&&console.warn(t);try{throw new Error(t)}catch(e){}}}("/"===e.pathname.charAt(0),"relative pathnames are not supported in hash history.push("+JSON.stringify(t)+")")}),e)}function i(e,t){if(!1===e||null==e)throw new Error(t)}function c(e,t){return{usr:e.state,key:e.key,idx:t}}function s(e,t,r,o){return void 0===r&&(r=null),n({pathname:"string"==typeof e?e:e.pathname,search:"",hash:""},"string"==typeof t?d(t):t,{state:r,key:t&&t.key||o||Math.random().toString(36).substr(2,8)})}function u(e){let{pathname:t="/",search:r="",hash:n=""}=e;return r&&"?"!==r&&(t+="?"===r.charAt(0)?r:"?"+r),n&&"#"!==n&&(t+="#"===n.charAt(0)?n:"#"+n),t}function d(e){let t={};if(e){let r=e.indexOf("#");r>=0&&(t.hash=e.substr(r),e=e.substr(0,r));let n=e.indexOf("?");n>=0&&(t.search=e.substr(n),e=e.substr(0,n)),e&&(t.pathname=e)}return t}var p;function h(e,t,r){void 0===r&&(r="/");let n=S(("string"==typeof t?d(t):t).pathname||"/",r);if(null==n)return null;let o=m(e);!function(e){e.sort(((e,t)=>e.score!==t.score?t.score-e.score:function(e,t){return e.length===t.length&&e.slice(0,-1).every(((e,r)=>e===t[r]))?e[e.length-1]-t[t.length-1]:0}(e.routesMeta.map((e=>e.childrenIndex)),t.routesMeta.map((e=>e.childrenIndex)))))}(o);let a=null;for(let e=0;null==a&&e<o.length;++e)a=C(o[e],Z(n));return a}function m(e,t,r,n){void 0===t&&(t=[]),void 0===r&&(r=[]),void 0===n&&(n="");let o=(e,o,a)=>{let l={relativePath:void 0===a?e.path||"":a,caseSensitive:!0===e.caseSensitive,childrenIndex:o,route:e};l.relativePath.startsWith("/")&&(i(l.relativePath.startsWith(n),'Absolute route path "'+l.relativePath+'" nested under path "'+n+'" is not valid. An absolute child route path must start with the combined path of all its parent routes.'),l.relativePath=l.relativePath.slice(n.length));let c=A([n,l.relativePath]),s=r.concat(l);e.children&&e.children.length>0&&(i(!0!==e.index,'Index routes must not have child routes. Please remove all child routes from route path "'+c+'".'),m(e.children,t,s,c)),(null!=e.path||e.index)&&t.push({path:c,score:k(c,e.index),routesMeta:s})};return e.forEach(((e,t)=>{var r;if(""!==e.path&&null!=(r=e.path)&&r.includes("?"))for(let r of f(e.path))o(e,t,r);else o(e,t)})),t}function f(e){let t=e.split("/");if(0===t.length)return[];let[r,...n]=t,o=r.endsWith("?"),a=r.replace(/\?$/,"");if(0===n.length)return o?[a,""]:[a];let l=f(n.join("/")),i=[];return i.push(...l.map((e=>""===e?a:[a,e].join("/")))),o&&i.push(...l),i.map((t=>e.startsWith("/")&&""===t?"/":t))}!function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"}(p||(p={}));const g=/^:\w+$/,y=3,v=2,b=1,w=10,x=-2,E=e=>"*"===e;function k(e,t){let r=e.split("/"),n=r.length;return r.some(E)&&(n+=x),t&&(n+=v),r.filter((e=>!E(e))).reduce(((e,t)=>e+(g.test(t)?y:""===t?b:w)),n)}function C(e,t){let{routesMeta:r}=e,n={},o="/",a=[];for(let e=0;e<r.length;++e){let l=r[e],i=e===r.length-1,c="/"===o?t:t.slice(o.length)||"/",s=$({path:l.relativePath,caseSensitive:l.caseSensitive,end:i},c);if(!s)return null;Object.assign(n,s.params);let u=l.route;a.push({params:n,pathname:A([o,s.pathname]),pathnameBase:_(A([o,s.pathnameBase])),route:u}),"/"!==s.pathnameBase&&(o=A([o,s.pathnameBase]))}return a}function $(e,t){"string"==typeof e&&(e={path:e,caseSensitive:!1,end:!0});let[r,n]=function(e,t,r){void 0===t&&(t=!1),void 0===r&&(r=!0),R("*"===e||!e.endsWith("*")||e.endsWith("/*"),'Route path "'+e+'" will be treated as if it were "'+e.replace(/\*$/,"/*")+'" because the `*` character must always follow a `/` in the pattern. To get rid of this warning, please change the route path to "'+e.replace(/\*$/,"/*")+'".');let n=[],o="^"+e.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^$?{}|()[\]]/g,"\\$&").replace(/\/:(\w+)/g,((e,t)=>(n.push(t),"/([^\\/]+)")));return e.endsWith("*")?(n.push("*"),o+="*"===e||"/*"===e?"(.*)$":"(?:\\/(.+)|\\/*)$"):r?o+="\\/*$":""!==e&&"/"!==e&&(o+="(?:(?=\\/|$))"),[new RegExp(o,t?void 0:"i"),n]}(e.path,e.caseSensitive,e.end),o=t.match(r);if(!o)return null;let a=o[0],l=a.replace(/(.)\/+$/,"$1"),i=o.slice(1);return{params:n.reduce(((e,t,r)=>{if("*"===t){let e=i[r]||"";l=a.slice(0,a.length-e.length).replace(/(.)\/+$/,"$1")}return e[t]=function(e,t){try{return decodeURIComponent(e)}catch(r){return R(!1,'The value for the URL param "'+t+'" will not be decoded because the string "'+e+'" is a malformed URL segment. This is probably due to a bad percent encoding ('+r+")."),e}}(i[r]||"",t),e}),{}),pathname:a,pathnameBase:l,pattern:e}}function Z(e){try{return decodeURI(e)}catch(t){return R(!1,'The URL path "'+e+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent encoding ('+t+")."),e}}function S(e,t){if("/"===t)return e;if(!e.toLowerCase().startsWith(t.toLowerCase()))return null;let r=t.endsWith("/")?t.length-1:t.length,n=e.charAt(r);return n&&"/"!==n?null:e.slice(r)||"/"}function R(e,t){if(!e){"undefined"!=typeof console&&console.warn(t);try{throw new Error(t)}catch(e){}}}const A=e=>e.join("/").replace(/\/\/+/g,"/"),_=e=>e.replace(/\/+$/,"").replace(/^\/*/,"/");class V extends Error{}function O(e){return null!=e&&"number"==typeof e.status&&"string"==typeof e.statusText&&"boolean"==typeof e.internal&&"data"in e}const L=["post","put","patch","delete"],I=(new Set(L),["get",...L]);new Set(I),new Set([301,302,303,307,308]),new Set([307,308]),"undefined"!=typeof window&&void 0!==window.document&&window.document.createElement,Symbol("deferred")},28316:(e,t,r)=>{!function e(){if("undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e)}catch(e){console.error(e)}}(),e.exports=r(52967)},48570:(e,t,r)=>{e.exports=r(66866)},73557:(e,t,r)=>{var n;r.d(t,{AW:()=>$,F0:()=>Z,TH:()=>v,Z5:()=>S});var o=r(16060),a=r(2784);function l(){return l=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},l.apply(this,arguments)}"function"==typeof Object.is&&Object.is;const{useState:i,useEffect:c,useLayoutEffect:s,useDebugValue:u}=n||(n=r.t(a,2));"undefined"==typeof window||void 0===window.document||window.document.createElement;const d=a.createContext(null),p=a.createContext(null),h=a.createContext(null),m=a.createContext(null),f=a.createContext({outlet:null,matches:[]}),g=a.createContext(null);function y(){return null!=a.useContext(m)}function v(){return y()||(0,o.kG)(!1),a.useContext(m).location}function b(){let e=function(){var e;let t=a.useContext(g),r=function(e){let t=a.useContext(p);return t||(0,o.kG)(!1),t}(k.UseRouteError),n=function(e){let t=function(e){let t=a.useContext(f);return t||(0,o.kG)(!1),t}(),r=t.matches[t.matches.length-1];return r.route.id||(0,o.kG)(!1),r.route.id}(k.UseRouteError);return t||(null==(e=r.errors)?void 0:e[n])}(),t=(0,o.WK)(e)?e.status+" "+e.statusText:e instanceof Error?e.message:JSON.stringify(e),r=e instanceof Error?e.stack:null,n={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return a.createElement(a.Fragment,null,a.createElement("h2",null,"Unexpected Application Error!"),a.createElement("h3",{style:{fontStyle:"italic"}},t),r?a.createElement("pre",{style:n},r):null,null)}class w extends a.Component{constructor(e){super(e),this.state={location:e.location,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,t){return t.location!==e.location?{error:e.error,location:e.location}:{error:e.error||t.error,location:t.location}}componentDidCatch(e,t){console.error("React Router caught the following error during render",e,t)}render(){return this.state.error?a.createElement(f.Provider,{value:this.props.routeContext},a.createElement(g.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function x(e){let{routeContext:t,match:r,children:n}=e,o=a.useContext(d);return o&&o.static&&o.staticContext&&r.route.errorElement&&(o.staticContext._deepestRenderedBoundaryId=r.route.id),a.createElement(f.Provider,{value:t},n)}var E,k,C;function $(e){(0,o.kG)(!1)}function Z(e){let{basename:t="/",children:r=null,location:n,navigationType:l=o.aU.Pop,navigator:i,static:c=!1}=e;y()&&(0,o.kG)(!1);let s=t.replace(/^\/*/,"/"),u=a.useMemo((()=>({basename:s,navigator:i,static:c})),[s,i,c]);"string"==typeof n&&(n=(0,o.cP)(n));let{pathname:d="/",search:p="",hash:f="",state:g=null,key:v="default"}=n,b=a.useMemo((()=>{let e=(0,o.Zn)(d,s);return null==e?null:{pathname:e,search:p,hash:f,state:g,key:v}}),[s,d,p,f,g,v]);return null==b?null:a.createElement(h.Provider,{value:u},a.createElement(m.Provider,{children:r,value:{location:b,navigationType:l}}))}function S(e){let{children:t,location:r}=e,n=a.useContext(d);return function(e,t){y()||(0,o.kG)(!1);let{navigator:r}=a.useContext(h),n=a.useContext(p),{matches:i}=a.useContext(f),c=i[i.length-1],s=c?c.params:{},u=(c&&c.pathname,c?c.pathnameBase:"/");c&&c.route;let d,g=v();if(t){var E;let e="string"==typeof t?(0,o.cP)(t):t;"/"===u||(null==(E=e.pathname)?void 0:E.startsWith(u))||(0,o.kG)(!1),d=e}else d=g;let k=d.pathname||"/",C="/"===u?k:k.slice(u.length)||"/",$=(0,o.fp)(e,{pathname:C}),Z=function(e,t,r){if(void 0===t&&(t=[]),null==e){if(null==r||!r.errors)return null;e=r.matches}let n=e,l=null==r?void 0:r.errors;if(null!=l){let e=n.findIndex((e=>e.route.id&&(null==l?void 0:l[e.route.id])));e>=0||(0,o.kG)(!1),n=n.slice(0,Math.min(n.length,e+1))}return n.reduceRight(((e,o,i)=>{let c=o.route.id?null==l?void 0:l[o.route.id]:null,s=r?o.route.errorElement||a.createElement(b,null):null,u=t.concat(n.slice(0,i+1)),d=()=>a.createElement(x,{match:o,routeContext:{outlet:e,matches:u}},c?s:void 0!==o.route.element?o.route.element:e);return r&&(o.route.errorElement||0===i)?a.createElement(w,{location:r.location,component:s,error:c,children:d(),routeContext:{outlet:null,matches:u}}):d()}),null)}($&&$.map((e=>Object.assign({},e,{params:Object.assign({},s,e.params),pathname:(0,o.RQ)([u,r.encodeLocation?r.encodeLocation(e.pathname).pathname:e.pathname]),pathnameBase:"/"===e.pathnameBase?u:(0,o.RQ)([u,r.encodeLocation?r.encodeLocation(e.pathnameBase).pathname:e.pathnameBase])}))),i,n||void 0);return t&&Z?a.createElement(m.Provider,{value:{location:l({pathname:"/",search:"",hash:"",state:null,key:"default"},d),navigationType:o.aU.Pop}},Z):Z}(n&&!t?n.router.routes:R(t),r)}function R(e,t){void 0===t&&(t=[]);let r=[];return a.Children.forEach(e,((e,n)=>{if(!a.isValidElement(e))return;if(e.type===a.Fragment)return void r.push.apply(r,R(e.props.children,t));e.type!==$&&(0,o.kG)(!1),e.props.index&&e.props.children&&(0,o.kG)(!1);let l=[...t,n],i={id:e.props.id||l.join("-"),caseSensitive:e.props.caseSensitive,element:e.props.element,index:e.props.index,path:e.props.path,loader:e.props.loader,action:e.props.action,errorElement:e.props.errorElement,hasErrorBoundary:null!=e.props.errorElement,shouldRevalidate:e.props.shouldRevalidate,handle:e.props.handle};e.props.children&&(i.children=R(e.props.children,l)),r.push(i)})),r}!function(e){e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator"}(E||(E={})),function(e){e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator"}(k||(k={})),function(e){e[e.pending=0]="pending",e[e.success=1]="success",e[e.error=2]="error"}(C||(C={})),new Promise((()=>{})),a.Component},2784:(e,t,r)=>{e.exports=r(83426)},3554:(e,t,r)=>{r.d(t,{B:()=>l});var n=r(2784),o=r(41195);const a={YAxis:o.default.div`
    display: flex;
    flex-direction: column;
    align-items: ${({alignX:e})=>{switch(e){case"left":return"flex-start";case"right":return"flex-end";case"center":return"center"}}};
  `},l=e=>{var{children:t}=e,r=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]])}return r}(e,["children"]);return n.createElement(a.YAxis,Object.assign({},r),t)}},54660:(e,t,r)=>{r.d(t,{I1:()=>o.I1,zx:()=>n.z});var n=r(22639),o=r(98661)},98661:(e,t,r)=>{r.d(t,{I1:()=>a,z0:()=>i});var n=r(41195),o=r(35150);const a=e=>n.css`
    color: ${e};
    svg {
      fill: ${e};
      stroke: ${e};
    }
  `,l={primary:{light:{fill:{enabled:n.css`
          background-color: ${o.VZ["blue-400"]};

          ${a(o.VZ.white)}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.1;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["blue-400"]};

          ::after {
            background-color: ${o.VZ["gray-300"]};
            opacity: 0.4;
          }

          ${a(o.VZ.white)}
        `}},dark:{fill:{enabled:n.css`
          background-color: ${o.VZ["blue-400"]};

          ${a(o.VZ.white)}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.3;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["blue-400"]};

          ::after {
            background-color: ${o.VZ["gray-600"]};
            opacity: 0.7;
          }

          ${a(o.VZ.white)}
        `}}},secondary:{light:{fill:{enabled:n.css`
          background-color: ${o.VZ["blue-50"]};

          ${a(o.VZ["blue-400"])}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.02;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["blue-50"]};

          ${a(o.VZ["blue-200"])}
        `}},dark:{fill:{enabled:n.css`
          background-color: ${o.VZ["gray-400"]};

          ${a(o.VZ.white)}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.2;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["gray-400"]};

          ::after {
            background-color: ${o.VZ["gray-600"]};
            opacity: 0.7;
          }

          ${a(o.VZ.white)}
        `}}},danger:{light:{fill:{enabled:n.css`
          background-color: ${o.VZ["red-100"]};

          ${a(o.VZ["red-400"])}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.05;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["red-100"]};

          ::after {
            background-color: ${o.VZ["gray-300"]};
            opacity: 0.2;
          }

          ${a(o.VZ["red-400"])}
        `}},dark:{fill:{enabled:n.css`
          background-color: ${o.VZ["red-100"]};

          ${a(o.VZ["red-400"])}

          :hover {
            ::after {
              background-color: ${o.VZ["gray-500"]};
              opacity: 0.2;
            }
          }
        `,disabled:n.css`
          background-color: ${o.VZ["gray-400"]};

          ::after {
            background-color: ${o.VZ["gray-600"]};
            opacity: 0.7;
          }

          ${a(o.VZ.white)}
        `}}}},i={Container:n.default.div`
    // Used for making button fill parent horizontally.
    display: flex;
    flex-direction: column;
    align-items: center;
  `,Button:n.default.button`
    width: 100%;
    height: ${({size:e})=>`${(e=>{switch(e){case"extraSmall":return 2;case"small":return 2.25;case"large":return 3.25;default:return 2.75}})(e)}rem`};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${"0.375rem"};
    cursor: ${({disabled:e,isLoading:t})=>e?"not-allowed":t?"progress":"pointer"};
    overflow: hidden;

    // Default font style.
    // Override these in "buttonStyleFromColorAndMode" if needed.
    font-weight: 500;
    font-size: ${({size:e})=>"large"===e?"1rem":"0.875rem"};
    letter-spacing: 0.2px;

    white-space: nowrap;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    padding: 0 0.75rem;

    // For hovering.
    position: relative;
    ::after {
      content: "";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    ${({color:e,theme:t,mode:r,disabled:n})=>l[e||"primary"][t.mode||"dark"][r||"fill"][n?"disabled":"enabled"]}
  `,Left:n.default.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
  `,Right:n.default.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,Loading:n.default.div`
    display: flex;
    align-items: center;

    position: absolute;
    color: ${({buttonColor:e})=>(e=>{switch(e){case"primary":default:return o.VZ["blue-200"];case"secondary":return o.VZ["gray-200"];case"danger":return o.VZ["red-400"]}})(e)};
  `,TextOverrideIcon:n.default.div`
    display: flex;
    align-items: center;

    position: absolute;
    svg {
      fill: none;
    }
  `}},68218:(e,t,r)=>{r.d(t,{s:()=>a});var n=r(2784);const o={Container:r(41195).default.div`
    flex: ${({weight:e})=>`${e} ${e} 0%`};
  `},a=({children:e,weight:t})=>(t<0&&(t=0),n.createElement(o.Container,{weight:t},e))},3645:(e,t,r)=>{r.d(t,{o:()=>n.o}),r(68218);var n=r(98331)},4922:(e,t,r)=>{r.d(t,{i0:()=>n.i,mI:()=>c.m,pN:()=>s.p,H2:()=>o.H2,H3:()=>a,d1:()=>l.d,Tj:()=>i.T});var n=r(25300),o=(r(49353),r(41267));const a=(0,r(41195).default)(n.i)`
  font-weight: 600;
  font-size: 1.25rem;
`;r(33219),r(61432);var l=r(94018),i=r(89587),c=(r(27977),r(34855),r(14832)),s=r(90879);r(34715),r(42280),r(18650),r(9458),r(17305)},96624:(e,t,r)=>{r.d(t,{B3:()=>d,C2:()=>a,Ce:()=>n,IZ:()=>s,R9:()=>u,eR:()=>i,gV:()=>c,ld:()=>l,yh:()=>o});const n="https://api-indexer.keplr.app",o="/v1/price",a="https://eth-mainnet.g.alchemy.com/v2/5SWF_6egZkfk2Cu21XpralMdJe9q9ouN",l="https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws/",i=[{currency:"usd",symbol:"$",maxDecimals:2,locale:"en-US"},{currency:"eur",symbol:"€",maxDecimals:2,locale:"de-DE"},{currency:"gbp",symbol:"£",maxDecimals:2,locale:"en-GB"},{currency:"cad",symbol:"CA$",maxDecimals:2,locale:"en-CA"},{currency:"aud",symbol:"AU$",maxDecimals:2,locale:"en-AU"},{currency:"rub",symbol:"₽",maxDecimals:0,locale:"ru"},{currency:"krw",symbol:"₩",maxDecimals:0,locale:"ko-KR"},{currency:"hkd",symbol:"HK$",maxDecimals:1,locale:"en-HK"},{currency:"cny",symbol:"¥",maxDecimals:1,locale:"zh-CN"},{currency:"jpy",symbol:"¥",maxDecimals:0,locale:"ja-JP"},{currency:"inr",symbol:"₹",maxDecimals:1,locale:"en-IN"},{currency:"chf",symbol:"₣",maxDecimals:2,locale:"gsw"},{currency:"pkr",symbol:"Rs",maxDecimals:0,locale:"en-PK"}],c="G-GBM7FFDB7T",s="J2NwxIs6RvqxTr8KQ75Uzw",u={chainId:"osmosis-1",resolverContractAddress:"osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd"},d={name:"osmosis-poolmanager",chainId:"osmosis-1"}},95556:(e,t,r)=>{r.d(t,{N:()=>a});var n=r(2784),o=r(90414);const a=()=>{const e=n.useContext(o.s);if(!e)throw new Error("You have forgot to use ConfirmProvider");return e}},90414:(e,t,r)=>{r.d(t,{s:()=>n});const n=(0,r(2784).createContext)(null)},72121:(e,t,r)=>{var n,o,a=r(2784),l=r(28316),i=r(73557),c=r(16060);function s(e){let{basename:t,children:r,window:n}=e,o=a.useRef();null==o.current&&(o.current=(0,c.q_)({window:n,v5Compat:!0}));let l=o.current,[s,u]=a.useState({action:l.action,location:l.location});return a.useLayoutEffect((()=>l.listen(u)),[l]),a.createElement(i.F0,{basename:t,children:r,location:s.location,navigationType:s.action,navigator:l})}"undefined"!=typeof window&&void 0!==window.document&&window.document.createElement,function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmitImpl="useSubmitImpl",e.UseFetcher="useFetcher"}(n||(n={})),function(e){e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"}(o||(o={}));var u=r(45493),d=r(35150),p=r(79089),h=r(66949),m=r(94337),f=r(80075),g=r(65397),y=r(98049),v=r(63197),b=r(98095),w=r(65264),x=r(84860),E=r(27660),k=r(95700),C=r(4922),$=r(22386),Z=r(54660),S=r(3645),R=r(28432),A=r(64318),_=r(28646),V=r(84581),O=r(15138),L=r(30527),I=r(10642),P=r(87972),T=(r(7632),r(83112)),D=r(42670),U=r(41195),j=r(72424),W=function(e,t,r,n){return new(r||(r=Promise))((function(o,a){function l(e){try{c(n.next(e))}catch(e){a(e)}}function i(e){try{c(n.throw(e))}catch(e){a(e)}}function c(e){var t;e.done?o(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(l,i)}c((n=n.apply(e,t||[])).next())}))};r(66985),(0,f.configure)({enforceActions:"always"}),window.keplr=new p.Keplr(h.i8,"core",new m.InExtensionMessageRequester);const B=(0,b.Pi)((()=>((0,x.b)(),null))),H=(0,b.Pi)((()=>{const{uiConfigStore:e}=(0,u.oR)(),t=(0,U.useTheme)(),n=(0,y.N)(),o=(0,T.Z)(),[l,i]=(0,a.useState)(""),[c,s]=(0,a.useState)("select");return a.createElement($.x,{width:"100vw",height:"100vh",alignX:"center",alignY:"center"},a.createElement($.x,{maxWidth:"47.75rem"},a.createElement("img",{src:r("light"===t.mode?35127:93451),alt:"Keplr logo",style:{width:"10.625rem",aspectRatio:"453 / 153"}}),a.createElement(E.T,{size:"2.25rem"}),a.createElement(k.F5,{color:"light"===t.mode?d.VZ["gray-700"]:d.VZ["gray-50"]},a.createElement(D.Z,{id:"page.ledger-grant.title"})),a.createElement(E.T,{size:"1rem"}),a.createElement(C.H3,{color:"light"===t.mode?d.VZ["gray-200"]:d.VZ["gray-300"]},a.createElement(D.Z,{id:"page.ledger-grant.paragraph"})),a.createElement(E.T,{size:"1.625rem"}),(()=>{switch(c){case"failed":return a.createElement($.x,{cursor:"pointer",onClick:e=>{e.preventDefault(),s("select")}},a.createElement(R.K,{alignY:"center"},a.createElement(C.mI,{color:d.VZ["red-400"]},"Failed! Try Again"),a.createElement(E.T,{size:"0.25rem"}),a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"1.5rem",height:"1.5rem",fill:"none",viewBox:"0 0 24 25"},a.createElement("path",{stroke:d.VZ["red-400"],strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M12.563 5.75l6.75 6.75-6.75 6.75m5.812-6.75H4.687"}))));case"success":return a.createElement(C.mI,{color:d.VZ["green-400"]},"Success! You can close this web page.");case"select":return a.createElement(a.Fragment,null,a.createElement(R.K,{alignY:"center"},a.createElement(A.XZ,{checked:e.useWebHIDLedger,onChange:t=>W(void 0,void 0,void 0,(function*(){if(t&&!window.navigator.hid)return yield n.confirm(o.formatMessage({id:"pages.register.connect-ledger.use-hid-confirm-title"}),o.formatMessage({id:"pages.register.connect-ledger.use-hid-confirm-paragraph"}),{forceYes:!0}),yield browser.tabs.create({url:"chrome://flags/#enable-experimental-web-platform-features"}),void window.close();e.setUseWebHIDLedger(t)}))}),a.createElement(E.T,{size:"0.5rem"}),a.createElement(C.Tj,{color:d.VZ["gray-300"]},a.createElement(D.Z,{id:"pages.register.connect-ledger.use-hid-text"}))),a.createElement(E.T,{size:"1.625rem"}),a.createElement(S.o,{sum:1,gutter:"1rem"},a.createElement(Z.zx,{color:"secondary",text:"Cosmos app",isLoading:"Cosmos"===l,disabled:!!l&&"Cosmos"!==l,onClick:()=>W(void 0,void 0,void 0,(function*(){if(l)return;let t;i("Cosmos");try{t=e.useWebHIDLedger?yield _.Z.create():yield V.Z.create();let r=new L.CosmosApp("Cosmos",t);if("Cosmos"===(yield r.getAppInfo()).app_name)return void s("success");if(t=yield O.Hn.tryAppOpen(t,"Cosmos"),r=new L.CosmosApp("Cosmos",t),"Cosmos"===(yield r.getAppInfo()).app_name)return void s("success");s("failed")}catch(e){console.log(e),s("failed")}finally{null==t||t.close().catch(console.log),i("")}}))}),a.createElement(Z.zx,{color:"secondary",text:"Terra app",isLoading:"Terra"===l,disabled:!!l&&"Terra"!==l,onClick:()=>W(void 0,void 0,void 0,(function*(){if(l)return;let t;i("Terra");try{t=e.useWebHIDLedger?yield _.Z.create():yield V.Z.create();let r=new L.CosmosApp("Terra",t);if("Terra"===(yield r.getAppInfo()).app_name)return void s("success");if(t=yield O.Hn.tryAppOpen(t,"Terra"),r=new L.CosmosApp("Terra",t),"Terra"===(yield r.getAppInfo()).app_name)return void s("success");s("failed")}catch(e){console.log(e),s("failed")}finally{null==t||t.close().catch(console.log),i("")}}))}),a.createElement(Z.zx,{color:"secondary",text:"Secret app",isLoading:"Secret"===l,disabled:!!l&&"Secret"!==l,onClick:()=>W(void 0,void 0,void 0,(function*(){if(l)return;let t;i("Secret");try{t=e.useWebHIDLedger?yield _.Z.create():yield V.Z.create();let r=new L.CosmosApp("Secret",t);if("Secret"===(yield r.getAppInfo()).app_name)return void s("success");if(t=yield O.Hn.tryAppOpen(t,"Secret"),r=new L.CosmosApp("Secret",t),"Secret "===(yield r.getAppInfo()).app_name)return void s("success");s("failed")}catch(e){console.log(e),s("failed")}finally{null==t||t.close().catch(console.log),i("")}}))}),a.createElement(Z.zx,{color:"secondary",text:"Ethereum app",isLoading:"Ethereum"===l,disabled:!!l&&"Ethereum"!==l,onClick:()=>W(void 0,void 0,void 0,(function*(){if(l)return;let t;i("Ethereum");try{t=e.useWebHIDLedger?yield _.Z.create():yield V.Z.create();let r=new P.Z(t);try{return yield r.getAddress("m/44'/60'/0'/0/0"),void s("success")}catch(e){console.log(e)}return t=yield O.Hn.tryAppOpen(t,"Ethereum"),r=new P.Z(t),yield r.getAddress("m/44'/60'/0'/0/0"),void s("success")}catch(e){console.log(e),s("failed")}finally{null==t||t.close().catch(console.log),i("")}}))})))}})()))})),z=()=>((0,w.i)(),a.createElement(s,null,a.createElement(j.N,{prefix:"/ledger-grant"}),a.createElement(i.Z5,null,a.createElement(i.AW,{path:"/",element:a.createElement(H,null)}))));l.render(a.createElement((()=>a.createElement(u.g3,null,a.createElement(I.p,null,a.createElement(v.u,null,a.createElement(g.C,null,a.createElement(y.W,null,a.createElement(d.ZL,null),a.createElement(d.nW,null),a.createElement(B,null),a.createElement(z,null))))))),null),document.getElementById("app"))},45493:(e,t,r)=>{r.d(t,{g3:()=>c,oR:()=>s});var n=r(2784),o=r(91474),a=r(2125),l=r(80075);r(93172);const i=n.createContext(null),c=({children:e})=>{const[t]=(0,n.useState)((()=>(0,o.r)()));return(0,n.useEffect)((()=>{(0,a.getKeplrFromWindow)().then((e=>{e&&e.__core__getAnalyticsId&&e.__core__getAnalyticsId().then((e=>{t.analyticsStore.setUserId(e)}))}))}),[t.analyticsStore]),(0,n.useEffect)((()=>{const e=(0,l.autorun)((()=>{if(!t.keyRingStore.isInitialized)return;if(!t.uiConfigStore.isInitialized)return;const e={};for(const r of t.keyRingStore.keyInfos){let t=r.insensitive.keyRingType;if("private-key"===t){const e=r.insensitive.keyRingMeta;e.web3Auth&&e.web3Auth.type&&(t="web3_auth_"+e.web3Auth.type)}t&&(t="keyring_"+t+"_num",e[t]||(e[t]=0),e[t]+=1)}let r="none";if(t.keyRingStore.selectedKeyInfo&&(r=t.keyRingStore.selectedKeyInfo.insensitive.keyRingType,"private-key"===r)){const e=t.keyRingStore.selectedKeyInfo.insensitive.keyRingMeta;e.web3Auth&&e.web3Auth.type&&(r="web3_auth_"+e.web3Auth.type)}t.analyticsStore.setUserProperties(Object.assign({account_count:t.keyRingStore.keyInfos.length,is_developer_mode:t.uiConfigStore.isDeveloper,current_keyring_type:r},e))}));return()=>{e&&e()}}),[]),n.createElement(i.Provider,{value:t},e)},s=()=>{const e=n.useContext(i);if(!e)throw new Error("You have forgot to use StoreProvider");return e}},26564:(e,t,r)=>{r.d(t,{l:()=>a});var n=r(2784),o=r(48570);function a(e){return n.Children.toArray(e).reduce(((e,t)=>(0,o.isFragment)(t)?t.props.children?e.concat(a(t.props.children)):e:(e.push(t),e)),[])}}}]);