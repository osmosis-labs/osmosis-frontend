"use strict";(self.webpackChunk_keplr_wallet_extension=self.webpackChunk_keplr_wallet_extension||[]).push([[346],{75413:(e,t,r)=>{function n(){this.cache=Object.create(null)}n.prototype.get=function(e){return this.cache[e]},n.prototype.set=function(e,t){this.cache[e]=t}},32428:(e,t,r)=>{r.d(t,{Z0:()=>n}),r(75413);var n={formats:{},messages:{},timeZone:void 0,defaultLocale:"en",defaultFormats:{},fallbackOnEmptyString:!0,onError:function(e){},onWarn:function(e){}}},28316:(e,t,r)=>{!function e(){if("undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e)}catch(e){console.error(e)}}(),e.exports=r(52967)},89274:(e,t,r)=>{r.d(t,{_y:()=>i});var n=r(2784);r(73463);var a=n.createContext(null),i=(a.Consumer,a.Provider,a)},87576:(e,t,r)=>{r.d(t,{lq:()=>l,wU:()=>c});var n=r(27221),a=r(2784),i=r(73731),o=r(32428);function l(e){(0,i.kG)(e,"[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.")}function c(e,t){if(e===t)return!0;if(!e||!t)return!1;var r=Object.keys(e),n=Object.keys(t),a=r.length;if(n.length!==a)return!1;for(var i=0;i<a;i++){var o=r[i];if(e[o]!==t[o]||!Object.prototype.hasOwnProperty.call(t,o))return!1}return!0}(0,n.pi)((0,n.pi)({},o.Z0),{textComponent:a.Fragment})},27221:(e,t,r)=>{r.d(t,{_T:()=>a,pi:()=>n});var n=function(){return n=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var a in t=arguments[r])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e},n.apply(this,arguments)};function a(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]])}return r}Object.create,Object.create},48570:(e,t,r)=>{e.exports=r(66866)},2784:(e,t,r)=>{e.exports=r(83426)},28432:(e,t,r)=>{r(2784),r(41195).default.div`
    display: flex;
    flex-direction: row;
    align-items: ${({alignY:e})=>{switch(e){case"top":return"flex-start";case"bottom":return"flex-end";case"center":return"center"}}};
  `,r(3554)},3554:(e,t,r)=>{r(2784),r(41195).default.div`
    display: flex;
    flex-direction: column;
    align-items: ${({alignX:e})=>{switch(e){case"left":return"flex-start";case"right":return"flex-end";case"center":return"center"}}};
  `},68218:(e,t,r)=>{r(2784),r(41195).default.div`
    flex: ${({weight:e})=>`${e} ${e} 0%`};
  `},98331:(e,t,r)=>{r(2784);var n=r(41195);r(15138),r(68218),r(27660),n.default.div`
    display: flex;
    flex-direction: row;
    align-items: ${({alignY:e})=>{switch(e){case"top":return"flex-start";case"bottom":return"flex-end";case"center":return"center"}}};
  `},3645:(e,t,r)=>{r(68218),r(98331)},90879:(e,t,r)=>{var n=r(41195),a=r(25300);(0,n.default)(a.i)`
  font-weight: 400;
  font-size: 0.875rem;
`},4922:(e,t,r)=>{r.d(t,{i0:()=>n.i,mI:()=>o.m,H2:()=>a.H2,d1:()=>i.d});var n=r(25300),a=(r(49353),r(41267));(0,r(41195).default)(n.i)`
  font-weight: 600;
  font-size: 1.25rem;
`,r(33219),r(61432);var i=r(94018),o=(r(89587),r(27977),r(34855),r(14832));r(90879),r(34715),r(42280),r(18650),r(9458),r(17305)},89587:(e,t,r)=>{var n=r(41195),a=r(25300);(0,n.default)(a.i)`
  font-weight: 500;
  font-size: 1rem;
`},96624:(e,t,r)=>{},49405:(e,t,r)=>{r.d(t,{q:()=>a});var n=r(2784);const a=e=>{(0,n.useEffect)(e,[])}},64421:(e,t,r)=>{var n=r(2784),a=r(28316),i=r(22386),o=r(41195),l=r(35150),c=r(10642);const s={Inner:o.default.div`
    display: flex;
    align-items: center;

    text-align: left;
    padding: 1.5rem;
    max-width: 64rem;

    gap: 3.375rem;

    @media screen and (max-height: 48rem) {
      flex-direction: column;
      text-align: center;
    }
  `,Image:o.default.img`
    @media screen and (max-height: 48rem) {
      margin: 0 auto;
      max-width: max(60%, 16.25rem);
    }
  `,Title:o.default.div`
    font-weight: 600;
    font-size: 3rem;
    margin: 0;
    color: ${e=>"light"===e.theme.mode?l.VZ["gray-700"]:l.VZ["gray-10"]};

    @media screen and (max-height: 48rem) {
      font-size: 2rem;
    }
  `,Description:o.default.div`
    font-weight: 400;
    font-size: 1rem;
    margin: 1.75rem 0;
    color: ${e=>"light"===e.theme.mode?l.VZ["gray-300"]:l.VZ["gray-100"]};

    @media screen and (max-height: 48rem) {
      max-width: max(75%, 20rem);
      margin: 1.25rem auto;
    }
  `,Link:o.default.button`
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    text-decoration: underline;
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: -0.005em;
    color: ${e=>"light"===e.theme.mode?l.VZ["gray-600"]:l.VZ["gray-50"]};

    display: flex;
    justify-content: center;
  `};a.render(n.createElement(n.Fragment,null,n.createElement(c.p,null,n.createElement(l.ZL,null),n.createElement((()=>{const e=new URLSearchParams(window.location.search).get("origin")||"";return(0,n.useLayoutEffect)((()=>{const t=t=>{try{if("blocklist-url-temp-allowed"!==t.data.type)return;const r=new URL(t.data.origin),n=new URL(e);if(r.origin!==n.origin)throw new Error("origin unmatched");window.location.replace(e)}catch(t){console.log(t),alert(t.message||t.toString())}};return window.addEventListener("message",t),()=>{window.removeEventListener("message",t)}}),[e]),n.createElement(i.x,{width:"100vw",height:"100vh",alignX:"center",alignY:"center"},n.createElement(s.Inner,null,n.createElement(s.Image,{src:r(36461),alt:""}),n.createElement(i.x,null,n.createElement(s.Title,null,"SECURITY ALERT"),n.createElement(s.Description,null,"Keplr has detected that this domain has been flagged as a phishing site. To protect the safety of your assets, we recommend you exit this website immediately."),n.createElement(s.Link,null,n.createElement("div",{onClick:t=>{t.preventDefault(),window.postMessage({type:"allow-temp-blocklist-url",origin:e},window.location.origin)},style:{cursor:"pointer"}},"Continue to ",e," (unsafe)")))))}),null))),document.getElementById("app"))},35150:(e,t,r)=>{r.d(t,{VZ:()=>n.V,ZL:()=>a.Z});var n=r(93043),a=r(52977);r(76948),r(90820)},90820:(e,t,r)=>{var n=r(41195),a=r(93043);n.createGlobalStyle`
  * {
    ::-webkit-scrollbar {
      display: none;
    }

    // For firefox
    scrollbar-width: none;
  }

  .simplebar-scrollbar::before {
    background-color: ${a.V["gray-400"]};
    border-radius: 0;
  }

  .simplebar-scrollbar.simplebar-visible:before {
    opacity: 1;
  }

  .simplebar-track.simplebar-vertical {
    width: 0.625rem;
  }

  .simplebar-track.simplebar-horizontal {
    height: 0.625rem;
  }
`},26564:(e,t,r)=>{r(2784),r(48570)},15138:(e,t,r)=>{r(26564),r(30527),r(84581),r(28646),r(5875)},36461:(e,t,r)=>{e.exports=r.p+"assets/blocklist.svg"}}]);