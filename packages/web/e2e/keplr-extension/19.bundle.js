(self.webpackChunk_keplr_wallet_extension=self.webpackChunk_keplr_wallet_extension||[]).push([[19],{35095:(e,t,r)=>{"use strict";r.d(t,{Y:()=>V});var n=r(2784),o=r(65397),l=r(22386),a=r(35150),i=r(4922),s=r(27660),c=r(34208),d=r(28432),m=r(50597),g=r(98095),u=r(45493),h=r(1522),f=r(39251),p=r(19410),y=r(41195),w=r(83112),v=r(42670),E=r(75263),b=r(45137);const C=(0,y.default)(i.i0)`
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.25;

  margin-left: 0.25rem;
`,V=(0,g.Pi)((({isOpen:e,close:t,historyType:r,recipientConfig:g,memoConfig:V,currency:x,permitSelfKeyInfo:k})=>{var F;const{analyticsStore:$,uiConfigStore:S,keyRingStore:A,chainStore:z}=(0,u.oR)(),O=(0,w.Z)(),M=(0,y.useTheme)(),[B,L]=(0,n.useState)("recent"),[R,D]=(0,n.useState)([]),[T,H]=(0,n.useState)([]);(0,n.useEffect)((()=>{S.addressBookConfig.getRecentSendHistory(g.chainId,r).then((e=>{D(e)}))}),[r,g.chainId,S.addressBookConfig]),(0,n.useEffect)((()=>{var e;S.addressBookConfig.getVaultCosmosKeysSettled(g.chainId,k||null===(e=A.selectedKeyInfo)||void 0===e?void 0:e.id).then((e=>{H(e.filter((e=>"fulfilled"===e.status)).map((e=>{if("fulfilled"===e.status)return e.value;throw new Error("Unexpected status")})))}))}),[null===(F=A.selectedKeyInfo)||void 0===F?void 0:F.id,k,g.chainId,S.addressBookConfig]);const I=void 0!==z.getChain(g.chainId).evm,j="erc20"===new b.DenomHelper(x.coinMinimalDenom).type,Y=(()=>{switch(B){case"recent":return R.map((e=>({timestamp:e.timestamp,address:e.recipient,memo:e.memo}))).filter((e=>!(j&&!e.address.startsWith("0x"))));case"contacts":return S.addressBookConfig.getAddressBook(g.chainId).map((e=>({name:e.name,address:e.address,memo:e.memo}))).filter((e=>!(j&&!e.address.startsWith("0x"))));case"accounts":return T.reduce(((e,t)=>{var r;const n=(null===(r=A.selectedKeyInfo)||void 0===r?void 0:r.id)===t.vaultId;if(j||e.push({name:t.name,address:t.bech32Address,isSelf:n}),I){const r=E.Bech32Address.fromBech32(t.bech32Address).toHex(!0);e.push({name:t.name,address:r,isSelf:n})}return e}),[]);default:return[]}})();return n.createElement(o.u,{isOpen:e,close:t,align:"bottom"},n.createElement(l.x,{backgroundColor:"light"===M.mode?a.VZ.white:a.VZ["gray-600"],paddingX:"0.75rem",paddingTop:"1rem"},n.createElement(l.x,{paddingX:"0.5rem",paddingY:"0.375rem"},n.createElement(i.d1,null,n.createElement(v.Z,{id:"components.address-book-modal.title"}))),n.createElement(s.T,{size:"0.75rem"}),n.createElement(d.B,{alignX:"left"},n.createElement(c.QK,{items:[{key:"recent",text:O.formatMessage({id:"components.address-book-modal.recent-tab"})},{key:"contacts",text:O.formatMessage({id:"components.address-book-modal.contacts-tab"})},{key:"accounts",text:O.formatMessage({id:"components.address-book-modal.my-account-tab"})}],selectedKey:B,onSelect:e=>{$.logEvent("click_addressBook_tab",{tabName:e}),L(e)}})),n.createElement(s.T,{size:"0.75rem"}),Y.length>0?n.createElement(p.Z,{style:{maxHeight:"23.625rem",minHeight:"14.875rem",overflowY:"auto"}},n.createElement(m.K,{gutter:"0.75rem"},(()=>{if("accounts"!==B||!k)return Y.map(((e,r)=>n.createElement(f.U,{key:r,timestamp:e.timestamp,name:e.name,address:e.address,memo:e.memo,isShowMemo:"accounts"!==B,onClick:()=>{var r;g.setValue(e.address),V.setValue(null!==(r=e.memo)&&void 0!==r?r:""),t()}})));const e=Y.find((e=>e.isSelf)),r=Y.filter((e=>!e.isSelf));return n.createElement(n.Fragment,null,e?n.createElement(n.Fragment,null,n.createElement(C,null,n.createElement(v.Z,{id:"components.address-book-modal.current-wallet"})),n.createElement(f.U,{name:e.name,address:e.address,isShowMemo:!1,onClick:()=>{g.setValue(e.address),t()},highlight:!0}),n.createElement(s.T,{size:"1.375rem"})):null,r.length>0?n.createElement(n.Fragment,null,n.createElement(C,null,n.createElement(v.Z,{id:"components.address-book-modal.other-wallet"})),r.map(((e,r)=>n.createElement(f.U,{key:r,name:e.name,address:e.address,isShowMemo:!1,onClick:()=>{g.setValue(e.address),t()}})))):null)})(),n.createElement(s.T,{size:"0.75rem"}))):n.createElement(l.x,{alignX:"center",alignY:"center",style:{height:"14.875rem",color:"light"===M.mode?a.VZ["gray-200"]:a.VZ["gray-400"]}},n.createElement(h.z,{top:"3rem"},n.createElement(d.B,{alignX:"center"},n.createElement(Z,{size:"4.5rem"}),n.createElement(s.T,{size:"1.25rem"}),n.createElement(i.DY,null,"accounts"===B?O.formatMessage({id:"components.address-book-modal.empty-view-accounts"}):O.formatMessage({id:"components.address-book-modal.empty-view-default"})))))))})),Z=({size:e})=>n.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:e,height:e,fill:"none",viewBox:"0 0 72 72"},n.createElement("path",{stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"7.5",d:"M45.5 40.5h-18m12.182-21.568l-6.364-6.364a4.5 4.5 0 00-3.182-1.318H14A6.75 6.75 0 007.25 18v36A6.75 6.75 0 0014 60.75h45A6.75 6.75 0 0065.75 54V27A6.75 6.75 0 0059 20.25H42.864a4.5 4.5 0 01-3.182-1.318z"}))},39251:(e,t,r)=>{"use strict";r.d(t,{U:()=>y});var n=r(2784),o=r(22386),l=r(3645),a=r(4922),i=r(2712),s=r(47556),c=r(35150),d=r(75263),m=r(83112),g=r(42670),u=r(27660),h=r(16468),f=r(28432),p=r(41195);const y=({timestamp:e,name:t,address:r,memo:y,isShowMemo:w,onClick:v,dropdownItems:E,highlight:b})=>{const C=(0,m.Z)(),V=(0,p.useTheme)(),[Z,x]=(0,n.useState)(!1);return n.createElement(o.x,{padding:"1rem",backgroundColor:"light"===V.mode?c.VZ["gray-50"]:c.VZ["gray-600"],hover:{backgroundColor:v?"light"===V.mode?c.VZ["gray-100"]:c.VZ["gray-550"]:void 0},borderRadius:"0.375rem",borderWidth:b?"1px":void 0,borderColor:b?c.VZ["gray-400"]:void 0,cursor:v?"pointer":void 0,onClick:e=>{e.preventDefault(),v&&v()}},n.createElement(l.o,{sum:1,alignY:"center"},n.createElement(l.s,{weight:1},n.createElement(f.B,null,e?n.createElement(n.Fragment,null,n.createElement(a.H5,{style:{color:"light"===V.mode?c.VZ["gray-700"]:c.VZ["gray-10"]}},n.createElement(g.Z,{id:"components.address-item.sent-on-date",values:{date:C.formatDate(new Date(e),{year:"numeric",month:"long",day:"2-digit"})}})),n.createElement(u.T,{size:"0.5rem"})):null,t?n.createElement(n.Fragment,null,n.createElement(a.H5,{style:{color:"light"===V.mode?c.VZ["gray-700"]:c.VZ["gray-10"],width:"16rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},t),n.createElement(u.T,{size:"0.5rem"})):null,n.createElement(f.K,{alignY:"center"},n.createElement(i.m2,{width:"0.75rem",height:"0.75rem",color:"light"===V.mode?c.VZ["gray-300"]:c.VZ["gray-200"]}),n.createElement(u.T,{size:"0.25rem"}),n.createElement(a.pN,{style:{color:"light"===V.mode?c.VZ["gray-300"]:c.VZ["gray-200"]}},r.startsWith("0x")?`${r.slice(0,15)}...${r.slice(-10)}`:d.Bech32Address.shortenAddress(r,30))),n.createElement(u.T,{size:"0.25rem"}),w?n.createElement(f.K,{alignY:"center"},n.createElement(i.YH,{width:"0.75rem",height:"0.75rem",color:"light"===V.mode?c.VZ["gray-300"]:c.VZ["gray-200"]}),n.createElement(u.T,{size:"0.25rem"}),y?n.createElement(a.pN,{style:{color:"light"===V.mode?c.VZ["gray-300"]:c.VZ["gray-200"],width:"15rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},y):n.createElement(a.pN,{style:{color:c.VZ["gray-300"]}},n.createElement(g.Z,{id:"components.address-item.empty-memo"}))):null)),E&&E.length>0?n.createElement(s.Rk,{isOpen:Z,close:()=>x(!1),items:E},n.createElement(h.h,{onClick:()=>x(!Z),color:"light"===V.mode?c.VZ["gray-300"]:c.VZ["gray-10"]},n.createElement(i.ws,{width:"1.5rem",height:"1.5rem"}))):null))}},3554:(e,t,r)=>{"use strict";r.d(t,{B:()=>a});var n=r(2784),o=r(41195);const l={YAxis:o.default.div`
    display: flex;
    flex-direction: column;
    align-items: ${({alignX:e})=>{switch(e){case"left":return"flex-start";case"right":return"flex-end";case"center":return"center"}}};
  `},a=e=>{var{children:t}=e,r=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]])}return r}(e,["children"]);return n.createElement(l.YAxis,Object.assign({},r),t)}},1522:(e,t,r)=>{"use strict";r.d(t,{z:()=>l});var n=r(2784);const o={Container:r(41195).default.div`
    margin-top: ${({top:e,vertical:t})=>e?"-"+e:t?"-"+t:void 0};
    margin-bottom: ${({bottom:e,vertical:t})=>e?"-"+e:t?"-"+t:void 0};
    margin-left: ${({left:e,horizontal:t})=>e?"-"+e:t?"-"+t:void 0};
    margin-right: ${({right:e,horizontal:t})=>e?"-"+e:t?"-"+t:void 0};
  `};const l=e=>{var{children:t}=e,r=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]])}return r}(e,["children"]);return n.createElement(o.Container,Object.assign({},r),t)}},98661:(e,t,r)=>{"use strict";r.d(t,{I1:()=>a,Vm:()=>i,e6:()=>l,z0:()=>c});var n=r(41195),o=r(35150);const l="0.375rem",a=e=>n.css`
    color: ${e};
    svg {
      fill: ${e};
      stroke: ${e};
    }
  `,i=e=>{switch(e){case"extraSmall":return 2;case"small":return 2.25;case"large":return 3.25;default:return 2.75}},s={primary:{light:{fill:{enabled:n.css`
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
        `}}}},c={Container:n.default.div`
    // Used for making button fill parent horizontally.
    display: flex;
    flex-direction: column;
    align-items: center;
  `,Button:n.default.button`
    width: 100%;
    height: ${({size:e})=>`${i(e)}rem`};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${l};
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

    ${({color:e,theme:t,mode:r,disabled:n})=>s[e||"primary"][t.mode||"dark"][r||"fill"][n?"disabled":"enabled"]}
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
  `}},68218:(e,t,r)=>{"use strict";r.d(t,{s:()=>l});var n=r(2784);const o={Container:r(41195).default.div`
    flex: ${({weight:e})=>`${e} ${e} 0%`};
  `},l=({children:e,weight:t})=>(t<0&&(t=0),n.createElement(o.Container,{weight:t},e))},3645:(e,t,r)=>{"use strict";r.d(t,{o:()=>o.o,s:()=>n.s});var n=r(68218),o=r(98331)},47556:(e,t,r)=>{"use strict";r.d(t,{Lt:()=>u,Rk:()=>v});var n=r(2784),o=r(41195),l=r(35150),a=r(4922),i=r(19410);const s={Container:o.default.div`
    position: relative;
  `,SelectedContainer:o.default.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    position: relative;

    width: 100%;
    height: ${({size:e})=>"small"===e?"2.5rem":"3.25rem"};

    padding: 0 1rem;

    color: ${e=>"light"===e.theme.mode?l.VZ["gray-400"]:l.VZ.white};

    border: 1px solid
      ${({isOpen:e,theme:t,color:r})=>"text-input"===r?e?"light"===t.mode?l.VZ["blue-400"]:l.VZ["gray-200"]:"light"===t.mode?l.VZ["gray-100"]:l.VZ["gray-400"]:e?"light"===t.mode?l.VZ["gray-300"]:l.VZ["gray-200"]:"light"===t.mode?l.VZ["gray-100"]:l.VZ["gray-500"]};
    border-radius: 0.5rem;
    background-color: ${e=>"light"===e.theme.mode?l.VZ.white:l.VZ["gray-700"]};

    cursor: pointer;
  `,Text:(0,o.default)(a.pN)`
    color: ${({selectedItemKey:e,theme:t})=>e?"light"===t.mode?l.VZ["gray-400"]:l.VZ["gray-50"]:l.VZ["gray-300"]};
  `,MenuContainer:o.default.div.withConfig({shouldForwardProp:e=>"isOpen"!==e})`
    position: absolute;

    width: 100%;

    margin-top: 0.375rem;

    z-index: 1;

    color: ${e=>"light"===e.theme.mode?l.VZ["gray-300"]:l.VZ["gray-500"]};

    border: 1px solid
      ${e=>"light"===e.theme.mode?l.VZ["gray-100"]:l.VZ["gray-500"]};
    border-radius: 0.375rem;

    overflow: hidden;

    background-color: ${e=>"light"===e.theme.mode?l.VZ["gray-50"]:l.VZ["gray-600"]};

    ${({isOpen:e})=>e?o.css`
          display: block;
        `:o.css`
          display: none;
        `};
  `,MenuContainerScroll:(0,o.default)(i.Z).withConfig({shouldForwardProp:e=>"menuContainerMaxHeight"!==e})`
    max-height: ${({menuContainerMaxHeight:e})=>e||"13rem"};
    overflow: auto;
  `,MenuItem:(0,o.default)(a.pN)`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 2.875rem;

    padding: 0 1.5rem;

    color: ${e=>"light"===e.theme.mode?l.VZ["gray-400"]:l.VZ.white};

    :hover {
      background-color: ${e=>"light"===e.theme.mode?l.VZ["gray-100"]:l.VZ["gray-500"]};
    }

    cursor: pointer;
    user-select: none;
  `};var c=r(3645),d=r(2712),m=r(85713),g=r(22386);const u=({className:e,style:t,placeholder:r,items:o,selectedItemKey:l,onSelect:a,size:i="small",color:u="default",label:h,menuContainerMaxHeight:f,allowSearch:p})=>{var y,w;const[v,E]=n.useState(!1),b=(0,n.useRef)(null),C=(0,n.useRef)(null),[V,Z]=n.useState("");(0,n.useEffect)((()=>{var e;v?p&&(null===(e=C.current)||void 0===e||e.focus()):Z("")}),[p,v]),(0,n.useEffect)((()=>{function e(e){b.current&&!b.current.contains(e.target)&&E(!1)}return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}}),[]);const x=n.useMemo((()=>o.filter((e=>{if(!p)return!0;const t=V.trim();return!(t.length>0)||"string"==typeof e.label&&e.label.toLowerCase().includes(t.toLowerCase())}))),[p,o,V]);return n.createElement(s.Container,{ref:b},h?n.createElement(m.__,{content:h}):null,n.createElement(s.SelectedContainer,{className:e,style:t,placeholder:r,isOpen:v,onClick:()=>E(!v),color:u,size:i},n.createElement(c.o,{sum:1},n.createElement(g.x,{position:"relative",alignY:"center"},n.createElement(g.x,{position:"absolute",style:{opacity:v&&p?1:0,pointerEvents:v&&p?"auto":"none"}},n.createElement(s.Text,null,n.createElement("input",{type:"text",ref:C,style:{padding:0,borderWidth:0,background:"transparent",outline:"none"},value:V,onChange:e=>{e.preventDefault(),Z(e.target.value)}}))),n.createElement(s.Text,{selectedItemKey:l,style:{opacity:v&&p?0:1}},l&&null!==(w=null===(y=o.find((e=>e.key===l)))||void 0===y?void 0:y.label)&&void 0!==w?w:r)),n.createElement(c.s,{weight:1}),n.createElement(d.ch,{width:"1.25rem",height:"1.25rem"}))),n.createElement(s.MenuContainer,{isOpen:v&&x.length>0},n.createElement(s.MenuContainerScroll,{menuContainerMaxHeight:f},x.map((e=>n.createElement(s.MenuItem,{key:e.key,onClick:()=>{a(e.key),E(!1)}},e.label))))))};var h=r(51323),f=r(20189),p=r(40771),y=r(71346),w=r.n(y);const v=({children:e,isOpen:t,close:r,items:o})=>{const{x:i,y:s,strategy:c,refs:d}=(0,h.YF)({middleware:[(0,f.X5)({allowedPlacements:["left","right"]}),(0,f.cv)((({rects:e})=>({mainAxis:-e.reference.width,crossAxis:-(e.reference.height-e.floating.height)/2}))),(0,f.uY)({padding:10,limiter:(0,f.dr)({offset:({rects:e})=>({mainAxis:e.reference.height,crossAxis:e.reference.width})})})],whileElementsMounted:p.Me,open:t}),m=(0,n.useRef)(r);return m.current=r,(0,n.useEffect)((()=>{function e(e){const t=d.floating;t.current&&"contains"in t.current&&!t.current.contains(e.target)&&m.current()}return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}}),[d.floating]),n.createElement(n.Fragment,null,n.createElement("div",{ref:d.setReference,style:{display:"flex",flexDirection:"column"}},e),t&&n.createElement("div",{ref:d.setFloating,style:{position:c,top:null!=s?s:0,left:null!=i?i:0,backgroundColor:l.VZ["gray-400"],borderRadius:"0.375rem",borderStyle:"solid",borderWidth:"1px",borderColor:w()(l.VZ["gray-300"]).alpha(.2).toString()}},o.map(((e,t)=>n.createElement(n.Fragment,{key:e.key},n.createElement(g.x,{alignX:"right",alignY:"center",height:"2.5rem",paddingX:"1rem",paddingY:"0.75rem",cursor:"pointer",color:l.VZ.white,hover:{color:l.VZ["gray-200"]},onClick:t=>{t.preventDefault(),e.onSelect(),r()}},n.createElement(a.DY,null,e.label)),t!==o.length-1?n.createElement("div",{style:{height:"1px",backgroundColor:w()(l.VZ["gray-300"]).alpha(.2).toString()}}):null)))))}},80427:(e,t,r)=>{"use strict";r.d(t,{uo:()=>p});var n=r(41195),o=r(50597),l=r(35150),a=r(71346),i=r.n(a);const s=(e,t)=>{switch(t){case"safe":return"light"===e.mode?l.VZ["green-500"]:l.VZ["green-400"];case"warning":return"light"===e.mode?l.VZ["orange-400"]:l.VZ["yellow-400"];case"danger":return"light"===e.mode?l.VZ["red-400"]:l.VZ["red-300"];default:return"light"===e.mode?l.VZ["gray-500"]:l.VZ["gray-100"]}},c=(e,t)=>{switch(t){case"safe":return"light"===e.mode?i()(l.VZ["green-500"]).alpha(.7).string():l.VZ["green-400"];case"warning":return"light"===e.mode?i()(l.VZ["orange-400"]).alpha(.7).string():i()(l.VZ["yellow-500"]).alpha(.7).string();case"danger":return"light"===e.mode?i()(l.VZ["red-400"]).alpha(.7).string():l.VZ["red-300"];default:return l.VZ["gray-300"]}},d={Container:(0,n.default)(o.K)`
    border-radius: 0.5rem;
    padding: 1.125rem;

    ${({color:e})=>{switch(e){case"safe":return n.css`
            background-color: ${e=>"light"===e.theme.mode?l.VZ["green-50"]:l.VZ["green-800"]};
          }
          svg {
            color: ${e=>s(e.theme,"safe")};
          }
          `;case"warning":return n.css`
            background-color: ${e=>"light"===e.theme.mode?l.VZ["orange-50"]:l.VZ["yellow-800"]};
            }
            svg {
              color: ${e=>s(e.theme,"warning")};
            }
          `;case"danger":return n.css`
            background-color: ${e=>"light"===e.theme.mode?l.VZ["red-50"]:l.VZ["red-800"]};
            svg {
              color: ${e=>s(e.theme,"danger")};
            }
          `;default:return n.css`
            background-color: ${e=>"light"===e.theme.mode?l.VZ["gray-50"]:l.VZ["gray-600"]};
            svg {
              color: ${e=>s(e.theme,"default")};
            }
          `}}};

    ${({backgroundColor:e})=>{if(e)return n.css`
          background-color: ${e};
        `}};
  `};var m=r(2784),g=r(3645),u=r(2712),h=r(22386),f=r(4922);const p=({title:e,paragraph:t,color:r="default",titleRight:o,bottom:l,hideInformationIcon:a,backgroundColor:i})=>{const p=(0,n.useTheme)();return m.createElement(d.Container,{gutter:"0.5rem",color:r,backgroundColor:i},m.createElement(g.o,{sum:1,alignY:"center",gutter:"0.375rem"},a?null:m.createElement(u.Yk,{width:"1.25rem",height:"1.25rem"}),m.createElement(g.s,{weight:1},m.createElement(f.JP,{color:s(p,r)},e)),o),t?m.createElement(f.De,{color:c(p,r)},t):null,l?m.createElement(h.x,null,l):null)}},16468:(e,t,r)=>{"use strict";r.d(t,{h:()=>i});var n=r(2784),o=r(41195),l=r(35150);const a={Container:o.default.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};

    border-radius: 50%;

    padding: ${({padding:e})=>e||void 0};

    color: ${({color:e,theme:t})=>e||("light"===t.mode?l.VZ["gray-300"]:l.VZ["gray-50"])};

    ${({disabled:e,hoverColor:t})=>{if(!e)return o.css`
          :hover {
            background-color: ${({theme:e})=>t||("light"===e.mode?l.VZ["gray-100"]:l.VZ["gray-550"])};
          }
        `}}
  `},i=({children:e,onClick:t,padding:r,hoverColor:o,disabled:l})=>n.createElement(a.Container,{padding:r,hoverColor:o,disabled:l,onClick:e=>{e.preventDefault(),l||t()}},e)},71946:(e,t,r)=>{"use strict";r.d(t,{c:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{d:"M12.9473 16.7822C12.4668 17.3998 11.5332 17.3998 11.0528 16.7822L5.10638 9.13674C4.49331 8.34851 5.05503 7.20001 6.0536 7.20001H17.9465C18.945 7.20001 19.5068 8.34851 18.8937 9.13674L12.9473 16.7822Z",fill:r||"currentColor"}))},70218:(e,t,r)=>{"use strict";r.d(t,{L:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{d:"M8.5 4.5L14.5 12L8.5 19.5",stroke:r||"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}))},17458:(e,t,r)=>{"use strict";r.d(t,{Y:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:e,height:t,fill:"none",viewBox:"0 0 24 24"},n.createElement("path",{fill:r||"currentColor",fillRule:"evenodd",d:"M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z",clipRule:"evenodd"}),n.createElement("path",{fill:r||"currentColor",d:"M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"}))},23799:(e,t,r)=>{"use strict";r.d(t,{w:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10.5 6C10.5 5.17157 11.1716 4.5 12 4.5C12.8284 4.5 13.5 5.17157 13.5 6C13.5 6.82843 12.8284 7.5 12 7.5C11.1716 7.5 10.5 6.82843 10.5 6ZM10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12ZM10.5 18C10.5 17.1716 11.1716 16.5 12 16.5C12.8284 16.5 13.5 17.1716 13.5 18C13.5 18.8284 12.8284 19.5 12 19.5C11.1716 19.5 10.5 18.8284 10.5 18Z",fill:r||"currentColor"}))},12771:(e,t,r)=>{"use strict";r.d(t,{Y:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{d:"M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",fill:r||"currentColor"}))},91709:(e,t,r)=>{"use strict";r.d(t,{_:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.75 1.5C12.0221 1.5 9 4.52208 9 8.25C9 8.64372 9.03379 9.03016 9.0988 9.40639C9.16599 9.79527 9.06678 10.1226 8.87767 10.3117L2.37868 16.8107C1.81607 17.3733 1.5 18.1363 1.5 18.932V21.75C1.5 22.1642 1.83579 22.5 2.25 22.5H6C6.41421 22.5 6.75 22.1642 6.75 21.75V20.25H8.25C8.66421 20.25 9 19.9142 9 19.5V18H10.5C10.6989 18 10.8897 17.921 11.0303 17.7803L13.6883 15.1223C13.8774 14.9332 14.2047 14.834 14.5936 14.9012C14.9698 14.9662 15.3563 15 15.75 15C19.4779 15 22.5 11.9779 22.5 8.25C22.5 4.52208 19.4779 1.5 15.75 1.5ZM15.75 4.5C15.3358 4.5 15 4.83579 15 5.25C15 5.66421 15.3358 6 15.75 6C16.9926 6 18 7.00736 18 8.25C18 8.66421 18.3358 9 18.75 9C19.1642 9 19.5 8.66421 19.5 8.25C19.5 6.17893 17.8211 4.5 15.75 4.5Z",fill:r||"currentColor",stroke:"none"}))},23495:(e,t,r)=>{"use strict";r.d(t,{x:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.75 2.25L21 2.25C21.1989 2.25 21.3897 2.32902 21.5303 2.46967C21.671 2.61032 21.75 2.80109 21.75 3V8.25C21.75 8.66421 21.4142 9 21 9C20.5858 9 20.25 8.66421 20.25 8.25V4.81066L8.03033 17.0303C7.73744 17.3232 7.26256 17.3232 6.96967 17.0303C6.67678 16.7374 6.67678 16.2626 6.96967 15.9697L19.1893 3.75L15.75 3.75C15.3358 3.75 15 3.41421 15 3C15 2.58579 15.3358 2.25 15.75 2.25ZM5.25 6.75C4.42157 6.75 3.75 7.42157 3.75 8.25V18.75C3.75 19.5784 4.42157 20.25 5.25 20.25H15.75C16.5784 20.25 17.25 19.5784 17.25 18.75V10.5C17.25 10.0858 17.5858 9.75 18 9.75C18.4142 9.75 18.75 10.0858 18.75 10.5V18.75C18.75 20.4069 17.4069 21.75 15.75 21.75H5.25C3.59315 21.75 2.25 20.4069 2.25 18.75V8.25C2.25 6.59315 3.59315 5.25 5.25 5.25H13.5C13.9142 5.25 14.25 5.58579 14.25 6C14.25 6.41421 13.9142 6.75 13.5 6.75H5.25Z",fill:r||"currentColor"}))},77525:(e,t,r)=>{"use strict";r.d(t,{m:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:e,height:t,fill:"none",viewBox:"0 0 24 24"},n.createElement("path",{fill:r||"currentColor",fillRule:"evenodd",d:"M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.432-.608-7.812-1.7a.75.75 0 01-.437-.695z",clipRule:"evenodd"}))},79908:(e,t,r)=>{"use strict";r.d(t,{W:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C12.3642 17.25 14.0506 16.4953 15.273 15.273C16.4953 14.0506 17.25 12.3642 17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75ZM2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5C18.75 12.5078 18.032 14.3491 16.8399 15.7793L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L15.7793 16.8399C14.3491 18.032 12.5078 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5Z",fill:r||"currentColor"}))},5550:(e,t,r)=>{"use strict";r.d(t,{a:()=>o});var n=r(2784);const o=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{d:"M11.9998 9.00006V12.7501M2.69653 16.1257C1.83114 17.6257 2.91371 19.5001 4.64544 19.5001H19.3541C21.0858 19.5001 22.1684 17.6257 21.303 16.1257L13.9487 3.37819C13.0828 1.87736 10.9167 1.87736 10.0509 3.37819L2.69653 16.1257ZM11.9998 15.7501H12.0073V15.7576H11.9998V15.7501Z",stroke:r||"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}))},27734:(e,t,r)=>{"use strict";r.d(t,{f:()=>c});var n=r(2784),o=r(22386),l=r(2712),a=r(15877),i=r(35150),s=r(41195);const c=(0,n.forwardRef)(((e,t)=>{const r=(0,s.useTheme)();return n.createElement(a.o,Object.assign({},e,{ref:t,left:n.createElement(o.x,{style:{color:(()=>{if(e.value&&"string"==typeof e.value)return e.value.trim().length>0?"light"===r.mode?i.VZ["blue-400"]:i.VZ["gray-200"]:void 0})()}},n.createElement(l.W1,{width:"1.25rem",height:"1.25rem"}))}))}))},46810:(e,t,r)=>{"use strict";r.d(t,{o:()=>c});var n=r(2784),o=r(30227),l=r(3645),a=r(22386),i=r(41054),s=r(47502);const c=(0,n.forwardRef)(((e,t)=>{var{className:r,style:c,label:m,paragraph:g,error:u,rightLabel:h,left:f,right:p,bottom:y,isLoading:w,autoComplete:v}=e,E=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]])}return r}(e,["className","style","label","paragraph","error","rightLabel","left","right","bottom","isLoading","autoComplete"]);return n.createElement(o.z.Container,{className:r,style:c},n.createElement(l.o,{sum:1,alignY:"center"},m?n.createElement(s._,{content:m,isLoading:w}):null,n.createElement(l.s,{weight:1}),h?n.createElement(a.x,null,h):null),n.createElement(o.z.TextInputContainer,{paragraph:g,error:u,disabled:E.disabled,errorBorder:E.errorBorder},n.createElement(l.o,{sum:1},n.createElement(d,{show:!!f},n.createElement(a.x,{alignY:"center",marginLeft:"1rem"},n.createElement(o.z.Icon,null,n.createElement(a.x,null,f)))),n.createElement(l.s,{weight:1},n.createElement(o.z.TextInput,Object.assign({},E,{autoComplete:v||"off",paragraph:g,error:u,ref:t}))),n.createElement(d,{show:!!p},n.createElement(a.x,{alignY:"center",marginRight:"1rem"},n.createElement(o.z.Icon,null,n.createElement(a.x,null,p)))))),y,n.createElement(i.nL,{transitionAlign:"top"},u||g?n.createElement(o.z.SubText,{error:u,paragraph:g},u||g):null))})),d=({show:e,children:t})=>e?n.createElement(n.Fragment,null,t):null},19274:(e,t,r)=>{"use strict";r.d(t,{v:()=>g});var n=r(65397),o=r(22386),l=r(4922),a=r(2784),i=r(35150),s=r(54660),c=r(41195),d=r(83112),m=r(42670);const g=({isOpen:e,close:t,title:r,paragraph:g})=>{const h=(0,c.useTheme)(),f=(0,d.Z)();return a.createElement(n.u,{isOpen:e,close:t,align:"center"},a.createElement(o.x,{width:"18.6875rem",marginX:"auto",backgroundColor:"light"===h.mode?i.VZ.white:i.VZ["gray-600"],padding:"1.5rem 1.25rem 1.25rem",borderRadius:"0.5rem"},a.createElement(l.d1,null,r),a.createElement(l.pN,{color:"light"===h.mode?i.VZ["gray-300"]:i.VZ["gray-200"],style:{marginTop:"0.5rem"}},g),a.createElement(o.x,{marginTop:"2rem",alignX:"right",style:{flexDirection:"row",width:"100%",alignItems:"center",justifyContent:"flex-end"}},a.createElement(u,{href:"https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419",target:"_blank",rel:"noopener noreferrer",theme:h,onClick:e=>{e.stopPropagation()}},a.createElement(m.Z,{id:"pages.register.connect-keystone.tutorial"})),a.createElement(s.zx,{size:"small",text:f.formatMessage({id:"button.ok"}),style:{width:"4.8125rem"},onClick:t}))))},u=c.default.a`
  margin-right: 1.75rem;
  color: ${e=>"light"===e.theme.mode?i.VZ.black:i.VZ.white};
  text-decoration: none;
  font-size: 0.875rem;
  :hover {
    color: ${i.VZ["blue-400"]};
  }
`},67654:(e,t,r)=>{"use strict";r.d(t,{E:()=>a});var n=r(2784),o=r(41195),l=r(35150);const a=({percent:e,width:t,height:r})=>{const a=(0,o.useTheme)();return n.createElement("div",{style:{backgroundColor:"light"===a.mode?l.VZ["gray-50"]:l.VZ["gray-500"],width:null!=t?t:"7.5rem",height:null!=r?r:"0.375rem",borderRadius:null!=r?r:"0.375rem"}},n.createElement("div",{style:{width:`${e}%`,height:"100%",borderRadius:null!=r?r:"0.375rem",backgroundColor:l.VZ["blue-400"]}}))}},59330:(e,t,r)=>{"use strict";r.d(t,{z:()=>l});var n=r(41195),o=r(35150);const l={Container:n.default.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    background-color: ${e=>"light"===e.theme.mode?o.VZ["gray-50"]:o.VZ["gray-700"]};

    ${({size:e})=>"large"===e?n.css`
            height: 2.625rem;
            border-radius: 1.3125rem;
          `:n.css`
            height: 2.25rem;
            border-radius: 1.125rem;
          `}
  `,Button:n.default.button`
    flex: ${({itemMinWidth:e})=>e?void 0:1};

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: ${({itemMinWidth:e})=>e};

    ${({selected:e})=>e?n.css`
          cursor: auto;
          background-color: ${e=>"light"===e.theme.mode?o.VZ.white:o.VZ["gray-600"]};
          color: ${e=>"light"===e.theme.mode?o.VZ["blue-400"]:o.VZ["gray-50"]};
          font-weight: 500;
        `:n.css`
        cursor: pointer;
        background-color: ${e=>"light"===e.theme.mode?o.VZ["gray-50"]:o.VZ["gray-700"]};
        color: ${o.VZ["gray-300"]};
        font-weight: 400;
      `}

    ${({size:e})=>"large"===e?n.css`
            height: 2.125rem;
            border-radius: 1.0625rem;
            font-size: 0.875rem;

            padding: 0 0.75rem;
          `:n.css`
            height: 1.75rem;
            border-radius: 0.875rem;
            font-size: 0.75rem;

            padding: 0 0.625rem;
          `}
    
    
    white-space: nowrap;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-image: none;
  `}},42887:(e,t,r)=>{"use strict";r.d(t,{h:()=>y});var n=r(2784),o=r(12062),l=r(2712),a=r(22386),i=r(35150),s=r(75868);const c={mass:.6,tension:270,friction:21},d={mass:.6,tension:220,friction:15},m={mass:.6,tension:320,friction:10},g=i.VZ["blue-400"],u="#2C4BE2",h=i.VZ["blue-400"],f="#7A59FF",p="#2723F700",y=({size:e,onClick:t,left:r,text:i,right:y,isLoading:w,disabled:v,textOverrideIcon:E})=>{const b=(0,s.useSpringValue)(g),C=(0,s.useSpringValue)(h),V=(0,s.useSpringValue)(p),Z=(0,s.useSpringValue)(0),x=(0,s.useSpringValue)(1),[k,F]=(0,n.useState)(!1),[$,S]=(0,n.useState)(!1),A=(0,n.useCallback)((()=>Promise.all([b.start(g,{config:d}),C.start(h,{config:d}),x.start(1,{config:c}),V.start(p,{config:c}),Z.start(0,{config:c})])),[V,Z,b,C,x]);return(0,n.useLayoutEffect)((()=>{v&&A()}),[A,v]),(0,n.useLayoutEffect)((()=>{v||(k?(b.start(u,{config:d}),C.start(f,{config:d}),x.start(1.03,{config:c}),V.start("#2723F7FF",{config:c}),Z.start(11,{config:c})):A())}),[A,V,Z,v,b,C,k,x]),(0,n.useLayoutEffect)((()=>{v||$&&(b.start(u,{config:d}),C.start(f,{config:d}),x.start(.98,{config:c}),V.start("#2723F700",{config:c}),Z.start(0,{config:c}))}),[V,Z,v,b,C,$,x]),n.createElement(o.z.Container,null,n.createElement(o.z.Button,{size:e,isLoading:w,disabled:v,type:"button",onClick:()=>{v||w||(S(!1),b.start(g,{config:d}),C.start(h,{config:d}),x.start(1,{config:m}),V.start(p,{config:m}),Z.start(0,{config:m}),t&&t())},onMouseOver:()=>F(!0),onMouseOut:()=>{F(!1),S(!1)},onMouseDown:()=>{w||S(!0)},style:{background:(0,s.to)([b,C],((e,t)=>`linear-gradient(90deg, ${e} 16.15%, ${t} 100%)`)),transform:(0,s.to)(x,(e=>`scale(${e})`)),boxShadow:(0,s.to)([V,Z],((e,t)=>`0px 0px ${t}px ${e}`))}},r?n.createElement(o.z.Left,null,r):null,w?n.createElement(o.z.Loading,null,n.createElement(l.Ho,{width:"1rem",height:"1rem"})):null,!w&&E?n.createElement(o.z.TextOverrideIcon,null,E):null,n.createElement(a.x,{style:{opacity:w||E?0:1}},i),y?n.createElement(o.z.Right,null,y):null))}},50597:(e,t,r)=>{"use strict";r.d(t,{K:()=>s});var n=r(2784),o=r(27660),l=r(41195),a=r(15138);const i={Container:l.default.div`
    ${({flex:e})=>{if(null!=e)return`\n          flex: ${e};\n        `}}

    display: flex;
    flex-direction: column;
    align-items: ${({alignX:e})=>{switch(e){case"left":return"flex-start";case"right":return"flex-end";case"center":return"center"}}};
  `},s=e=>{var{children:t,gutter:r}=e,l=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]])}return r}(e,["children","gutter"]);const s=n.Children.toArray((0,a.lp)(t));return n.createElement(i.Container,Object.assign({},l),s.map(((e,t)=>{if((0,n.isValidElement)(e)&&e.type===o.T)return n.createElement(n.Fragment,{key:t},e);if(!r||t===s.length-1)return n.createElement(n.Fragment,{key:t},e);if(t+1<s.length){const r=s[t+1];if((0,n.isValidElement)(r)&&r.type===o.T)return n.createElement(n.Fragment,{key:t},e)}return n.createElement(n.Fragment,{key:t},e,n.createElement(o.T,{size:r,direction:"vertical"}))})))}},97363:(e,t,r)=>{"use strict";r.d(t,{V:()=>c});var n=r(2784),o=r(22386),l=r(35150),a=r(4922),i=r(680),s=r(41195);const c=({text:e,tooltip:t,whiteSpace:r})=>{const c=(0,s.useTheme)();return n.createElement(i.u,{enabled:!!t,content:t},n.createElement(o.x,{alignX:"center",alignY:"center",backgroundColor:"light"===c.mode?l.VZ["blue-50"]:l.VZ["gray-400"],borderRadius:"0.25rem",height:"1.25rem",paddingX:"0.625rem"},n.createElement(a.dA,{color:"light"===c.mode?l.VZ["blue-400"]:l.VZ["gray-100"],style:{whiteSpace:r}},e)))}},96854:(e,t,r)=>{"use strict";r.d(t,{b:()=>a,p:()=>o});var n=r(2784);const o=e=>{const t=(0,n.useRef)(null),r=(0,n.useRef)(e);r.current=e;const o=(0,n.useRef)(),[l]=(0,n.useState)((()=>new ResizeObserver((e=>{if(e.length>0){const t=e[0],n=(Array.isArray(t.borderBoxSize)?t.borderBoxSize[0]:t.borderBoxSize).blockSize;null!=o.current&&o.current===n||(r.current(n),o.current=n)}}))));return(0,n.useEffect)((()=>{if(t.current){const e=t.current;return l.observe(e,{}),()=>{l.unobserve(e)}}}),[l]),t};var l=r(75868);const a=(0,n.forwardRef)((({children:e,heightPx:t,width:r,transitionAlign:o},a)=>n.createElement(l.animated.div,{style:{position:"relative",overflow:"hidden",width:r,height:t.to((e=>e<0?"auto":`${e}px`)),flexShrink:0}},n.createElement(l.animated.div,{ref:a,style:{top:t.to((e=>e<0?0:"bottom"===o?"auto":"center"===o?"50%":0)),bottom:t.to((e=>e<0?"auto":"bottom"===o?"0":"auto")),transform:t.to((e=>e<0?"none":"center"===o?"translateY(-50%)":"none")),position:t.to((e=>e<0?"relative":"absolute")),left:t.to((e=>e<0?"auto":"0")),right:t.to((e=>e<0?"auto":"0"))}},e))))},19823:(e,t,r)=>{"use strict";r.d(t,{bo:()=>l,sM:()=>a,y3:()=>o});var n=r(2784);const o=n.createContext(null),l=n.createContext(null),a=e=>{const t=n.useContext(l);if(!t)throw new Error("You have forgot to use SceneEventsProvider");t.setEvents(e)};n.createContext(null)},53994:(e,t,r)=>{"use strict";r.d(t,{ht:()=>o.ht,Tx:()=>o.Tx,sM:()=>n.sM,ae:()=>a,X5:()=>o.X5});var n=r(19823),o=(r(35851),r(72131)),l=r(2784);const a=()=>{const e=(0,l.useContext)(n.y3);if(!e)throw new Error("Component is not under SceneTransition");return e}},10293:(e,t,r)=>{"use strict";r.d(t,{T:()=>s});var n=r(2784),o=r(13483),l=r(75868),a=r(38403),i=r(66769);const s=({children:e,collapsed:t,width:r,transitionAlign:s,onTransitionEnd:c,onResize:d})=>{const m=(0,n.useRef)(c);m.current=c;const g=(0,l.useSpringValue)(t?0:-1,{config:i.a,onRest:()=>{m.current&&m.current()}}),[u]=(0,n.useState)((()=>new a.y8(g))),h=(0,a.of)();(0,n.useLayoutEffect)((()=>{if(h){const e=h.registry.registerRegistry(u);return()=>{h.registry.unregisterRegistry(e)}}}),[h,u]);const f=(0,n.useRef)(t?0:-1),p=(0,o.p)((e=>{f.current=e,t||g.set(e),d&&d(e)})),y=(0,l.useSpringValue)(t?.1:1,{config:i.a});(0,n.useEffect)((()=>{t?(g.start(0),y.start(.1)):(g.start(f.current),y.start(1))}),[t,g,y]);const w=(0,n.useMemo)((()=>({registry:u})),[u]);return n.createElement(o.b,{ref:p,heightPx:g,width:r,transitionAlign:s},n.createElement(a.Jh.Provider,{value:w},n.createElement(l.animated.div,{style:{opacity:y}},e)))}},13563:(e,t,r)=>{"use strict";r.d(t,{Jh:()=>a,Y8:()=>o,of:()=>i,y8:()=>l});var n=r(2784);class o{constructor(){this.seq=0,this._registries=[],this.isDescendantAnimatingLast=null}registerRegistry(e){this.seq++;const t=this.seq.toString();return this._registries.push({key:t,value:e}),t}unregisterRegistry(e){const t=this._registries.findIndex((t=>t.key===e));t>=0&&this._registries.splice(t,1)}isDescendantAnimating(){for(const e of this._registries)if(e.value.isDescendantAnimatingWithSelf())return this.isDescendantAnimatingLast=!0,!0;return!(null==this.isDescendantAnimatingLast||!this.isDescendantAnimatingLast||(setTimeout((()=>{this.isDescendantAnimatingLast=null}),1),0))}isDescendantAnimatingWithSelf(){if(this.isAnimating())return!0;for(const e of this._registries)if(e.value.isAnimating())return!0;return!1}}class l extends o{constructor(e){super(),this.heightPx=e}isAnimating(){return this.heightPx.isAnimating}}const a=(0,n.createContext)(null),i=()=>(0,n.useContext)(a)},9458:(e,t,r)=>{"use strict";r.d(t,{d:()=>l});var n=r(41195),o=r(25300);const l=(0,n.default)(o.i)`
  font-weight: 500;
  font-size: 0.75rem;
`},52513:(e,t,r)=>{"use strict";r.d(t,{X:()=>d});var n=r(2784),o=r(22386),l=r(3645),a=r(4922),i=r(35150),s=r(27660),c=r(41195);const d=({title:e,paragraph:t})=>{const r=(0,c.useTheme)();return n.createElement(o.x,{padding:"1.125rem"},n.createElement(l.o,{sum:1,alignY:"center",gutter:"0.25rem"},n.createElement(m,{width:"1.25rem",height:"1.25rem",color:"light"===r.mode?i.VZ["orange-400"]:i.VZ["yellow-400"]}),n.createElement(a.H5,{color:"light"===r.mode?i.VZ["orange-400"]:i.VZ["yellow-500"]},e)),n.createElement(s.T,{size:"0.375rem"}),n.createElement(a.De,{color:"light"===r.mode?i.VZ["gray-400"]:i.VZ.white},t))},m=({width:e="1.5rem",height:t="1.5rem",color:r})=>n.createElement("svg",{width:e,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M9.40123 3.0034C10.5557 1.00229 13.4439 1.00229 14.5983 3.0034L21.9527 15.7509C23.1065 17.7509 21.6631 20.2501 19.3541 20.2501H4.64546C2.33649 20.2501 0.893061 17.7509 2.04691 15.7509L9.40123 3.0034ZM12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V12.75C12.75 13.1642 12.4142 13.5 12 13.5C11.5858 13.5 11.25 13.1642 11.25 12.75V9C11.25 8.58579 11.5858 8.25 12 8.25ZM12 16.5C12.4142 16.5 12.75 16.1642 12.75 15.75C12.75 15.3358 12.4142 15 12 15C11.5858 15 11.25 15.3358 11.25 15.75C11.25 16.1642 11.5858 16.5 12 16.5Z",fill:r||"currentColor"}))},93043:(e,t,r)=>{"use strict";r.d(t,{V:()=>n});const n={"blue-10":"#F6F8FF","blue-50":"#F0F3FF","blue-100":"#E4E9FF","blue-200":"#9DACF4","blue-300":"#566FEC","blue-400":"#2C4BE2","blue-500":"#1633C0","blue-600":"#112377","blue-700":"#09144D","blue-800":"#0A0314","platinum-10":"#EFF3F8","platinum-50":"#E9EEF5","platinum-100":"#CED5E1","platinum-200":"#95A1B4","platinum-300":"#566172","platinum-400":"#323C4A","platinum-500":"#252E3D","platinum-600":"#121924","platinum-700":"#0A101C","green-50":"#ECFDF6","green-100":"#DBF9EC","green-200":"#AAECD0","green-300":"#68EAB2","green-400":"#2DCE89","green-500":"#22AC71","green-600":"#136844","green-700":"#136844","green-800":"#0D2F21","red-50":"#FFF6F8","red-100":"#FFD8E0","red-200":"#FC91A6","red-300":"#FB486C","red-400":"#F0224B","red-500":"#A61F3A","red-600":"#771A2D","red-700":"#5B0A1A","red-800":"#290910","pink-50":"#FDF4F9","pink-100":"#FFE9F4","pink-200":"#FFCFE7","pink-300":"#F891C4","pink-400":"#FF6BB8","orange-50":"#FFF6F1","orange-100":"#FFE3D3","orange-200":"#FFAD80","orange-300":"#FC8441","orange-400":"#FA6410","orange-500":"#D7560E","orange-600":"#8F3A0A","orange-700":"#58270B","orange-800":"#2D1609","yellow-50":"#F8F2E3","yellow-100":"#F2E6C7","yellow-200":"#EDD18A","yellow-300":"#EBBF50","yellow-400":"#F0B622","yellow-500":"#D29C11","yellow-800":"#2F2611",white:"#FEFEFE","gray-10":"#F6F6F9","gray-50":"#F2F2F6","gray-100":"#DCDCE3","gray-200":"#ABABB5","gray-300":"#72747B","gray-400":"#404045","gray-450":"#353539","gray-500":"#2E2E32","gray-550":"#242428","gray-600":"#1D1D1F","gray-700":"#09090A",black:"#020202",transparent:"rgba(255,255,255,0)","light-gradient":"linear-gradient(90deg, #FCFAFF 2.44%, #FBFBFF 96.83%)","skeleton-layer-0":"#ECEBF1","skeleton-layer-1":"#F9F9FC"}},73363:(e,t,r)=>{var n={"./kado.svg":22379,"./moonpay.svg":66857,"./transak.svg":74995};function o(e){var t=l(e);return r(t)}function l(e){if(!r.o(n,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return n[e]}o.keys=function(){return Object.keys(n)},o.resolve=l,e.exports=o,o.id=73363},23080:(e,t,r)=>{"use strict";e.exports=r.p+"assets/chain-icon-alt.png"},22379:(e,t,r)=>{"use strict";e.exports=r.p+"assets/kado.svg"},66857:(e,t,r)=>{"use strict";e.exports=r.p+"assets/moonpay.svg"},74995:(e,t,r)=>{"use strict";e.exports=r.p+"assets/transak.svg"},82319:(e,t,r)=>{"use strict";e.exports=r.p+"assets/logo-256.png"}}]);