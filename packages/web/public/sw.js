if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + ".js", n).href),
    s[i] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const c =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[c]) return;
    let o = {};
    const r = (e) => i(e, c),
      d = { module: { uri: c }, exports: o, require: r };
    s[c] = Promise.all(n.map((e) => d[e] || r(e))).then((e) => (a(...e), o));
  };
}
define(["./workbox-c5ed321c"], function (e) {
  "use strict";
  importScripts("fallback-G_gfdum9c30zPEguK1a0Z.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/G_gfdum9c30zPEguK1a0Z/_buildManifest.js",
          revision: "b88ea63058a32533911ad51af2f55c0d",
        },
        {
          url: "/_next/static/G_gfdum9c30zPEguK1a0Z/_middlewareManifest.js",
          revision: "fb2823d66b3e778e04a3f681d0d2fb19",
        },
        {
          url: "/_next/static/G_gfdum9c30zPEguK1a0Z/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/129.41f7b4aa52f12b8d.js",
          revision: "41f7b4aa52f12b8d",
        },
        {
          url: "/_next/static/chunks/195.a207234179d944d1.js",
          revision: "a207234179d944d1",
        },
        {
          url: "/_next/static/chunks/2.3088f8c9a3c803bc.js",
          revision: "3088f8c9a3c803bc",
        },
        {
          url: "/_next/static/chunks/230.00ec256310362974.js",
          revision: "00ec256310362974",
        },
        {
          url: "/_next/static/chunks/252.13520110b7b0c43e.js",
          revision: "13520110b7b0c43e",
        },
        {
          url: "/_next/static/chunks/268-a22e8bc48cb62d67.js",
          revision: "a22e8bc48cb62d67",
        },
        {
          url: "/_next/static/chunks/327.6463450f62796a82.js",
          revision: "6463450f62796a82",
        },
        {
          url: "/_next/static/chunks/332.78aed7ba0b46d005.js",
          revision: "78aed7ba0b46d005",
        },
        {
          url: "/_next/static/chunks/402.ecfe522e38333e41.js",
          revision: "ecfe522e38333e41",
        },
        {
          url: "/_next/static/chunks/471.eefe4452cd78aa60.js",
          revision: "eefe4452cd78aa60",
        },
        {
          url: "/_next/static/chunks/498.81e5f023e4e2df83.js",
          revision: "81e5f023e4e2df83",
        },
        {
          url: "/_next/static/chunks/506.bbb64610defefb13.js",
          revision: "bbb64610defefb13",
        },
        {
          url: "/_next/static/chunks/508.3bbe7e63e1dd8e03.js",
          revision: "3bbe7e63e1dd8e03",
        },
        {
          url: "/_next/static/chunks/520.2fe53866660046ed.js",
          revision: "2fe53866660046ed",
        },
        {
          url: "/_next/static/chunks/540.888d9391885715a2.js",
          revision: "888d9391885715a2",
        },
        {
          url: "/_next/static/chunks/542.7f665ed0e5b44aeb.js",
          revision: "7f665ed0e5b44aeb",
        },
        {
          url: "/_next/static/chunks/639.10d793d18074faba.js",
          revision: "10d793d18074faba",
        },
        {
          url: "/_next/static/chunks/655.5127c2af8f3bd47b.js",
          revision: "5127c2af8f3bd47b",
        },
        {
          url: "/_next/static/chunks/715.83cd857be289bc6b.js",
          revision: "83cd857be289bc6b",
        },
        {
          url: "/_next/static/chunks/719.11d674c47d8981fb.js",
          revision: "11d674c47d8981fb",
        },
        {
          url: "/_next/static/chunks/741af68d.72f51f798f9d11e6.js",
          revision: "72f51f798f9d11e6",
        },
        {
          url: "/_next/static/chunks/75.f966669ba71b664f.js",
          revision: "f966669ba71b664f",
        },
        {
          url: "/_next/static/chunks/760.ddb33f04b5b2a7fd.js",
          revision: "ddb33f04b5b2a7fd",
        },
        {
          url: "/_next/static/chunks/797.82c26898fbaf92db.js",
          revision: "82c26898fbaf92db",
        },
        {
          url: "/_next/static/chunks/852.a92b5ab8193e7d10.js",
          revision: "a92b5ab8193e7d10",
        },
        {
          url: "/_next/static/chunks/906.68ba1671ccd3afc4.js",
          revision: "68ba1671ccd3afc4",
        },
        {
          url: "/_next/static/chunks/928.8b19458282c51607.js",
          revision: "8b19458282c51607",
        },
        {
          url: "/_next/static/chunks/94a7ad86.3cd302899e169776.js",
          revision: "3cd302899e169776",
        },
        {
          url: "/_next/static/chunks/951.59ec6938428edd4b.js",
          revision: "59ec6938428edd4b",
        },
        {
          url: "/_next/static/chunks/978.38b847ab8628825c.js",
          revision: "38b847ab8628825c",
        },
        {
          url: "/_next/static/chunks/b0ff5eae.e0bd39aeedbafad7.js",
          revision: "e0bd39aeedbafad7",
        },
        {
          url: "/_next/static/chunks/ee7bdd82.b8491424087036fb.js",
          revision: "b8491424087036fb",
        },
        {
          url: "/_next/static/chunks/f3c66533.73638ed16762394b.js",
          revision: "73638ed16762394b",
        },
        {
          url: "/_next/static/chunks/framework-70134ee1270fb32c.js",
          revision: "70134ee1270fb32c",
        },
        {
          url: "/_next/static/chunks/main-f403eaed05d204b3.js",
          revision: "f403eaed05d204b3",
        },
        {
          url: "/_next/static/chunks/pages/404-2e61d41451793699.js",
          revision: "2e61d41451793699",
        },
        {
          url: "/_next/static/chunks/pages/500-d3846044c748777f.js",
          revision: "d3846044c748777f",
        },
        {
          url: "/_next/static/chunks/pages/_error-5a714c45c50a8db4.js",
          revision: "5a714c45c50a8db4",
        },
        {
          url: "/_next/static/chunks/pages/_offline-8a01f9d98b8a303f.js",
          revision: "8a01f9d98b8a303f",
        },
        {
          url: "/_next/static/chunks/pages/assets-a5b0ad8eab40d299.js",
          revision: "a5b0ad8eab40d299",
        },
        {
          url: "/_next/static/chunks/pages/bootstrap-c6c5702347af22b4.js",
          revision: "c6c5702347af22b4",
        },
        {
          url: "/_next/static/chunks/pages/disclaimer-68fd15b1a70161db.js",
          revision: "68fd15b1a70161db",
        },
        {
          url: "/_next/static/chunks/pages/index-54800bfe88462fae.js",
          revision: "54800bfe88462fae",
        },
        {
          url: "/_next/static/chunks/pages/pixels-267f92a9e6856bd6.js",
          revision: "267f92a9e6856bd6",
        },
        {
          url: "/_next/static/chunks/pages/pool/%5Bid%5D-304817028cefd1a6.js",
          revision: "304817028cefd1a6",
        },
        {
          url: "/_next/static/chunks/pages/pools-8be6e4981f20c83e.js",
          revision: "8be6e4981f20c83e",
        },
        {
          url: "/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",
          revision: "99442aec5788bccac9b2f0ead2afdd6b",
        },
        {
          url: "/_next/static/chunks/webpack-d1c58c73ebafe6d5.js",
          revision: "d1c58c73ebafe6d5",
        },
        {
          url: "/_next/static/css/c34b616f4b7ce921.css",
          revision: "c34b616f4b7ce921",
        },
        {
          url: "/_next/static/media/osmosis-logo-wc.e0464b48.png",
          revision: "0a855dd0d664c48a9125f48b4ba90c16",
        },
        { url: "/_offline", revision: "G_gfdum9c30zPEguK1a0Z" },
        { url: "/favicon.ico", revision: "a599b4630f1a3b12d70092c59bc7fe51" },
        {
          url: "/icons/OSMO.svg",
          revision: "c8435ecb488d905a03d84e881fb3ea9f",
        },
        { url: "/icons/add.svg", revision: "57fed0d0d14abc6f4963b23473d7ba8d" },
        {
          url: "/icons/alert-circle.svg",
          revision: "2e1be842cc75fd38dab7d801a5962012",
        },
        {
          url: "/icons/android/android-launchericon-144-144.png",
          revision: "2078a185bcdc12dc82427898743f5b1b",
        },
        {
          url: "/icons/android/android-launchericon-192-192.png",
          revision: "71cb32febe32c06a8423977362925a61",
        },
        {
          url: "/icons/android/android-launchericon-48-48.png",
          revision: "3186b5b369cbd27b9188f1986a0fbc94",
        },
        {
          url: "/icons/android/android-launchericon-512-512.png",
          revision: "fd77a478a84934916f2bec5a7115f190",
        },
        {
          url: "/icons/android/android-launchericon-72-72.png",
          revision: "03bd732358deafab6aea41c0c8b5f90c",
        },
        {
          url: "/icons/android/android-launchericon-96-96.png",
          revision: "c11a48d054abe30cd265546622751196",
        },
        {
          url: "/icons/arrow-down.svg",
          revision: "cf324f6cf96fe207881720b67412e7a5",
        },
        {
          url: "/icons/arrow-right-superfluid.svg",
          revision: "5dd164dad9e457f0339afba469b3dd73",
        },
        {
          url: "/icons/arrow-right-wosmongton-300.svg",
          revision: "4f3a4be2890e32ae3bc3639c70c18dcf",
        },
        {
          url: "/icons/arrow-right.svg",
          revision: "3e30387888861d0ab8fe736347e31320",
        },
        {
          url: "/icons/asset-white.svg",
          revision: "c8e9b6515da7ff47397d0abf436a1dca",
        },
        {
          url: "/icons/axelar.svg",
          revision: "790ec58887e1e86d2a2d404c55ed1ca2",
        },
        {
          url: "/icons/chart-white.svg",
          revision: "27ef1e6ea2b7bdf8b3ab87f95564e723",
        },
        {
          url: "/icons/check-box.svg",
          revision: "aef89d2a1ead074548b41ba3d4980604",
        },
        {
          url: "/icons/check-circle.svg",
          revision: "6804a29b57a7c315830df8ef26e40c50",
        },
        {
          url: "/icons/check-mark-dark.svg",
          revision: "e1c28fd0cb58d37305386c67cead965c",
        },
        {
          url: "/icons/check-mark.svg",
          revision: "86092e5f19567097eda470e7a7d1934e",
        },
        {
          url: "/icons/checkmark-circle.svg",
          revision: "81fff9424688a0d1a2ed07acfd03bfd2",
        },
        {
          url: "/icons/chevron-down-disabled.svg",
          revision: "6534516f41ac7d79777273423ae49a3b",
        },
        {
          url: "/icons/chevron-down.svg",
          revision: "38963523ad8231d5b3c9ab5451a9d340",
        },
        {
          url: "/icons/chevron-left.svg",
          revision: "afeeb66ffcd770bd558d02598efefb59",
        },
        {
          url: "/icons/chevron-right-disabled.svg",
          revision: "7c08e5f2e8d4afc5ced4f6b754cce07c",
        },
        {
          url: "/icons/chevron-right-rust.svg",
          revision: "bd9bcc45c47d61a22ed613d7ca0e321c",
        },
        {
          url: "/icons/chevron-right.svg",
          revision: "59d8fffab6b4b5a5e899e02af12949db",
        },
        {
          url: "/icons/chevron-up-osmoverse-400.svg",
          revision: "e87df3978d5007d3e551137303702e24",
        },
        {
          url: "/icons/chevron-up.svg",
          revision: "dc3e66bf5fea8578ca4e9424e50563cb",
        },
        {
          url: "/icons/close-circle-large.svg",
          revision: "0ffa700b076dfde58a06359ef96a4793",
        },
        {
          url: "/icons/close-circle.svg",
          revision: "dc1d6ba686bda3bbb011fd0e12749742",
        },
        {
          url: "/icons/close-dark.svg",
          revision: "303e3c8d1e14bedfa0369ab93aeb6696",
        },
        {
          url: "/icons/close.svg",
          revision: "51b7f291b64af8a7e2688c7e8367fe65",
        },
        {
          url: "/icons/copy-white.svg",
          revision: "468c9d101cf72a4f7c8bcf1dcec176c9",
        },
        {
          url: "/icons/copy.svg",
          revision: "12f8e460b29e81c1eafac55191908727",
        },
        {
          url: "/icons/discord.svg",
          revision: "0e6ff61f0eba797a79838f640aac7a5e",
        },
        { url: "/icons/dot.svg", revision: "6f4e4112af2ec2cdc2e10cabc6de3c8c" },
        {
          url: "/icons/down-arrow.svg",
          revision: "f40780c585ae13695277771c3f2dc3e2",
        },
        {
          url: "/icons/error-x.svg",
          revision: "ed0e05416621192db8aa060f1c7c7905",
        },
        {
          url: "/icons/external-link-white.svg",
          revision: "cd570e59e7cfd5cf7fe30a8c85147a09",
        },
        {
          url: "/icons/external-link.svg",
          revision: "9a3dd1c47780f0d2ef44b886e1e9d94a",
        },
        {
          url: "/icons/hamburger.svg",
          revision: "91c094167ca072c3a78e30117cdfd152",
        },
        {
          url: "/icons/icons.json",
          revision: "4b00c8d3f335ee495b2b5e1dc66d9bc3",
        },
        {
          url: "/icons/info-white-emphasis.svg",
          revision: "c21f72c63321384f2ee3d9de887de75a",
        },
        {
          url: "/icons/info.svg",
          revision: "9fe73b9452aa1950048f51b6bd3bef7b",
        },
        {
          url: "/icons/ios/100.png",
          revision: "1b196530687f6667a1736242701a70b9",
        },
        {
          url: "/icons/ios/1024.png",
          revision: "7b6e29e80b7c1534a73ccc56386d8a53",
        },
        {
          url: "/icons/ios/114.png",
          revision: "184a5bd8cb698276ed1dbeb3f9370760",
        },
        {
          url: "/icons/ios/120.png",
          revision: "b7c35ad9a47bf2cc260c10096c5aa9ba",
        },
        {
          url: "/icons/ios/128.png",
          revision: "c28ed97c1a15ef9b3975a973027e0f2a",
        },
        {
          url: "/icons/ios/144.png",
          revision: "2078a185bcdc12dc82427898743f5b1b",
        },
        {
          url: "/icons/ios/152.png",
          revision: "cd84287256c00c2a81b7af26d94cdaeb",
        },
        {
          url: "/icons/ios/16.png",
          revision: "27ac59e57df5856f4405c5e21a1cb958",
        },
        {
          url: "/icons/ios/167.png",
          revision: "b65b2de08774b1d6bebd1400d9c4af72",
        },
        {
          url: "/icons/ios/180.png",
          revision: "330da04fa3982f06984d5480fb2eb5dc",
        },
        {
          url: "/icons/ios/192.png",
          revision: "71cb32febe32c06a8423977362925a61",
        },
        {
          url: "/icons/ios/20.png",
          revision: "768199008697e62498d48ba28582502a",
        },
        {
          url: "/icons/ios/256.png",
          revision: "e8969733d81f7c684d77600538d943f1",
        },
        {
          url: "/icons/ios/29.png",
          revision: "878a49acc8cb5fabc3e92cbc370534f8",
        },
        {
          url: "/icons/ios/32.png",
          revision: "44bf924d512a75347e64866641e0e54d",
        },
        {
          url: "/icons/ios/40.png",
          revision: "f02e026db45a3659013ec517dacbc7dd",
        },
        {
          url: "/icons/ios/50.png",
          revision: "1a6c074552abf919395ed1e6624b6036",
        },
        {
          url: "/icons/ios/512.png",
          revision: "fd77a478a84934916f2bec5a7115f190",
        },
        {
          url: "/icons/ios/57.png",
          revision: "667a3a700e5f03336f9727718b83b1f2",
        },
        {
          url: "/icons/ios/58.png",
          revision: "baac481838cf9da138418521ca6a592d",
        },
        {
          url: "/icons/ios/60.png",
          revision: "30c0fb208ebc9b209ee048059e01981a",
        },
        {
          url: "/icons/ios/64.png",
          revision: "91103698914a2aa01bb68627f7208b5b",
        },
        {
          url: "/icons/ios/72.png",
          revision: "03bd732358deafab6aea41c0c8b5f90c",
        },
        {
          url: "/icons/ios/76.png",
          revision: "b7aa2d0cecabf6825fad726c7f0ac398",
        },
        {
          url: "/icons/ios/80.png",
          revision: "2ba478473b95ab5d57cf336b3c3acef1",
        },
        {
          url: "/icons/ios/87.png",
          revision: "2969c478f8daf3aca338b19e5c75d0e2",
        },
        {
          url: "/icons/left-right.svg",
          revision: "760ca6d78d6f3b20b328bbb0638413cf",
        },
        {
          url: "/icons/left.svg",
          revision: "084b9383ea13d9cac3a55be7c7c25c49",
        },
        {
          url: "/icons/link-deco-real-white.svg",
          revision: "19fd23599ac327fb2a5055e6b3b68784",
        },
        {
          url: "/icons/link-deco-white.svg",
          revision: "585834308224fae28e75d2768f8e719b",
        },
        {
          url: "/icons/link-deco.svg",
          revision: "ea426b1338504a2f253d2a558e32129b",
        },
        {
          url: "/icons/loading-blue.svg",
          revision: "80303006ea745361a3e0c8e37a892343",
        },
        {
          url: "/icons/loading.svg",
          revision: "6f7bdead78385ee36949f875053412db",
        },
        {
          url: "/icons/metamask-fox.svg",
          revision: "0380ff40d43e2e1a90cb5e1a05e8cf2b",
        },
        {
          url: "/icons/more-menu.svg",
          revision: "46cb183217a331083a6c486934d81040",
        },
        {
          url: "/icons/osmopixel.png",
          revision: "2e04296f806174f89e85c5db2c033b3a",
        },
        {
          url: "/icons/pool-white.svg",
          revision: "0a8942cb6ab18708de1679b6a37bbeb2",
        },
        {
          url: "/icons/profile.svg",
          revision: "0db4277e35273030d5e92b5860c73983",
        },
        {
          url: "/icons/question-mark.svg",
          revision: "7d6ecd84e161de1ac97099f1d162cdba",
        },
        {
          url: "/icons/search.svg",
          revision: "f83faae4f94df1476439f01217e6d46c",
        },
        {
          url: "/icons/setting-white.svg",
          revision: "6e57799e010c83c7b2729eedc5e69937",
        },
        {
          url: "/icons/setting.svg",
          revision: "4badc0f5abceea55cf1fccd069224021",
        },
        {
          url: "/icons/sort-down-white.svg",
          revision: "92f79724a207f4de1f4c624e877077a5",
        },
        {
          url: "/icons/sort-down.svg",
          revision: "30b923da094a1c03006cc7b6f35320d6",
        },
        {
          url: "/icons/sort-up-white.svg",
          revision: "4c7e2682690283cfb93d45d3be264a9e",
        },
        {
          url: "/icons/sort-up.svg",
          revision: "796bae428ad4eeea37b939381a08a57b",
        },
        {
          url: "/icons/stable-pool.svg",
          revision: "1dc950946b55efc8fd024036288201ab",
        },
        {
          url: "/icons/stableswap-pool.svg",
          revision: "9bfb6ae28d02037ea1eb1443e81bddc4",
        },
        {
          url: "/icons/star-filled.svg",
          revision: "969aca958ce267e007eb31379e97b80f",
        },
        {
          url: "/icons/star.svg",
          revision: "e4c2372c2f3717b7f7e54f49370471d5",
        },
        {
          url: "/icons/superfluid-osmo.svg",
          revision: "160122b5485225796e2e16df4691bf88",
        },
        {
          url: "/icons/support-lab.svg",
          revision: "b14588a8baa7c5f742c26f5d4877f5c4",
        },
        {
          url: "/icons/swap.svg",
          revision: "e0a61ea01f8e8d2da95c8a8ec16fdd4f",
        },
        {
          url: "/icons/ticket-white.svg",
          revision: "87e2a0703f90aaa853342a0c69080f15",
        },
        {
          url: "/icons/trade-white.svg",
          revision: "5681cdc2d1306e875ec5774a93831725",
        },
        {
          url: "/icons/up-down-arrow.svg",
          revision: "8477f859347d5d51a7ac736e6a9bb6ac",
        },
        {
          url: "/icons/vote-white.svg",
          revision: "fc3c3df72948c11565ad058ed108acbd",
        },
        {
          url: "/icons/wallet.svg",
          revision: "793e048c49576df27d4262f6a812df66",
        },
        {
          url: "/icons/walletconnect.svg",
          revision: "1dc6f187a99b20677ddc5b1b5f526774",
        },
        {
          url: "/icons/warning.svg",
          revision: "9608d94767808fbb3090917e0b1edf05",
        },
        {
          url: "/icons/weighted-pool.svg",
          revision: "15b350e026ff430a74d368a8517fc170",
        },
        {
          url: "/icons/windows11/LargeTile.scale-100.png",
          revision: "9d81b1fc9f23ffcb050412b74cca8331",
        },
        {
          url: "/icons/windows11/LargeTile.scale-125.png",
          revision: "a1466962afe304f5a2bbd930712ff282",
        },
        {
          url: "/icons/windows11/LargeTile.scale-150.png",
          revision: "26525fbfa2e47a33368ed72ea5edc7ca",
        },
        {
          url: "/icons/windows11/LargeTile.scale-200.png",
          revision: "d978362e248f33b755543ddf71e2d75f",
        },
        {
          url: "/icons/windows11/LargeTile.scale-400.png",
          revision: "10e6413f1ebc29f5f7389e1321a19cd5",
        },
        {
          url: "/icons/windows11/SmallTile.scale-100.png",
          revision: "68d27b0823e9c8976c0d67848a31f71b",
        },
        {
          url: "/icons/windows11/SmallTile.scale-125.png",
          revision: "0f5aa4bdfe141082aefd84e580d486e3",
        },
        {
          url: "/icons/windows11/SmallTile.scale-150.png",
          revision: "09f266bbe9832c856e2d8a12d52080e9",
        },
        {
          url: "/icons/windows11/SmallTile.scale-200.png",
          revision: "0f92a7b03d7bc46a0a2139921680fc93",
        },
        {
          url: "/icons/windows11/SmallTile.scale-400.png",
          revision: "9fd6c523f63787cad961e7919884e9a3",
        },
        {
          url: "/icons/windows11/SplashScreen.scale-100.png",
          revision: "fb7a99ba4136f1e1fc96d49929126b44",
        },
        {
          url: "/icons/windows11/SplashScreen.scale-125.png",
          revision: "be8916bd4d47fd74d30e5eef4737268d",
        },
        {
          url: "/icons/windows11/SplashScreen.scale-150.png",
          revision: "c87588d762013fdbc66b36ca5725029b",
        },
        {
          url: "/icons/windows11/SplashScreen.scale-200.png",
          revision: "211f6a5b22408d0e70ff3bcdf8ec68ae",
        },
        {
          url: "/icons/windows11/SplashScreen.scale-400.png",
          revision: "a30016dfa508f733e87807c43ddb68a1",
        },
        {
          url: "/icons/windows11/Square150x150Logo.scale-100.png",
          revision: "1c1efd34f2c3de2ad9bd549e7bb302ba",
        },
        {
          url: "/icons/windows11/Square150x150Logo.scale-125.png",
          revision: "e6d455fd52fb18f36bddbbca7e32aaf9",
        },
        {
          url: "/icons/windows11/Square150x150Logo.scale-150.png",
          revision: "ff8ffbe9134eb7374d22dcec164e0e04",
        },
        {
          url: "/icons/windows11/Square150x150Logo.scale-200.png",
          revision: "e72b1e83a5f1b3e03d49ce39ec5e9ddd",
        },
        {
          url: "/icons/windows11/Square150x150Logo.scale-400.png",
          revision: "18f79a0453ae0914ee16acb939c92f21",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",
          revision: "4f7b2e1796ecccb637324b82dac18988",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",
          revision: "bb5b5226c1f46b58931e3100f0873ae2",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",
          revision: "7fa13c79e6728a1462446375746955b4",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",
          revision: "8a319a036ba6ca6f6137aadc8e87f3b3",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",
          revision: "1097e2b28c9db4721c57887622b1ad57",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",
          revision: "d0f8f7a923158e9d124105081e7ea938",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",
          revision: "6f2081e517954cab3ccf071d9b0ef20f",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",
          revision: "ab878409f8195a53b292ac1f11532443",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",
          revision: "b93b727ea7f9558b379fce03c43bd9bf",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",
          revision: "8b737ed8c2fb750d2419befe6a06eb39",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",
          revision: "b67fbdca7ac8468e26ee3f9826d958a1",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",
          revision: "496f395cdd53da76eaad26d68ba2e53e",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",
          revision: "7db17a62fecc5f90252306587488cfea",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",
          revision: "4aac9c031a6bdef5479146f88a07ace9",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",
          revision: "4402b2801cef3b55e39ceadada8f3bb3",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",
          revision: "4f7b2e1796ecccb637324b82dac18988",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",
          revision: "bb5b5226c1f46b58931e3100f0873ae2",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",
          revision: "7fa13c79e6728a1462446375746955b4",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",
          revision: "8a319a036ba6ca6f6137aadc8e87f3b3",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",
          revision: "1097e2b28c9db4721c57887622b1ad57",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",
          revision: "d0f8f7a923158e9d124105081e7ea938",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",
          revision: "6f2081e517954cab3ccf071d9b0ef20f",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",
          revision: "ab878409f8195a53b292ac1f11532443",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",
          revision: "b93b727ea7f9558b379fce03c43bd9bf",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",
          revision: "8b737ed8c2fb750d2419befe6a06eb39",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",
          revision: "b67fbdca7ac8468e26ee3f9826d958a1",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",
          revision: "496f395cdd53da76eaad26d68ba2e53e",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",
          revision: "7db17a62fecc5f90252306587488cfea",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",
          revision: "4aac9c031a6bdef5479146f88a07ace9",
        },
        {
          url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",
          revision: "4402b2801cef3b55e39ceadada8f3bb3",
        },
        {
          url: "/icons/windows11/Square44x44Logo.scale-100.png",
          revision: "b93b727ea7f9558b379fce03c43bd9bf",
        },
        {
          url: "/icons/windows11/Square44x44Logo.scale-125.png",
          revision: "2bd050b186e4a1ea173d1dd5c3701c33",
        },
        {
          url: "/icons/windows11/Square44x44Logo.scale-150.png",
          revision: "b601cbe47276073d43799d4273c4e3e5",
        },
        {
          url: "/icons/windows11/Square44x44Logo.scale-200.png",
          revision: "b1ec011ebcbb90a55681d5c89833bad9",
        },
        {
          url: "/icons/windows11/Square44x44Logo.scale-400.png",
          revision: "c4c4b86ced64a799ca447899c6dbf453",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-16.png",
          revision: "4f7b2e1796ecccb637324b82dac18988",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-20.png",
          revision: "bb5b5226c1f46b58931e3100f0873ae2",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-24.png",
          revision: "7fa13c79e6728a1462446375746955b4",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-256.png",
          revision: "8a319a036ba6ca6f6137aadc8e87f3b3",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-30.png",
          revision: "1097e2b28c9db4721c57887622b1ad57",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-32.png",
          revision: "d0f8f7a923158e9d124105081e7ea938",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-36.png",
          revision: "6f2081e517954cab3ccf071d9b0ef20f",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-40.png",
          revision: "ab878409f8195a53b292ac1f11532443",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-44.png",
          revision: "b93b727ea7f9558b379fce03c43bd9bf",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-48.png",
          revision: "8b737ed8c2fb750d2419befe6a06eb39",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-60.png",
          revision: "b67fbdca7ac8468e26ee3f9826d958a1",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-64.png",
          revision: "496f395cdd53da76eaad26d68ba2e53e",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-72.png",
          revision: "7db17a62fecc5f90252306587488cfea",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-80.png",
          revision: "4aac9c031a6bdef5479146f88a07ace9",
        },
        {
          url: "/icons/windows11/Square44x44Logo.targetsize-96.png",
          revision: "4402b2801cef3b55e39ceadada8f3bb3",
        },
        {
          url: "/icons/windows11/StoreLogo.scale-100.png",
          revision: "1a6c074552abf919395ed1e6624b6036",
        },
        {
          url: "/icons/windows11/StoreLogo.scale-125.png",
          revision: "84bed258e2cdfc923f1e578bad8d2f30",
        },
        {
          url: "/icons/windows11/StoreLogo.scale-150.png",
          revision: "46222d5e0282ee1f38ac2944de976aaa",
        },
        {
          url: "/icons/windows11/StoreLogo.scale-200.png",
          revision: "1b196530687f6667a1736242701a70b9",
        },
        {
          url: "/icons/windows11/StoreLogo.scale-400.png",
          revision: "d5005b4af796f540b3b48d29a6d476c2",
        },
        {
          url: "/icons/windows11/Wide310x150Logo.scale-100.png",
          revision: "824aecabc6261f48ccc880988c26cb21",
        },
        {
          url: "/icons/windows11/Wide310x150Logo.scale-125.png",
          revision: "cc4eb3d79409426bf5a22e3e467a6d61",
        },
        {
          url: "/icons/windows11/Wide310x150Logo.scale-150.png",
          revision: "618b947a4f797a355c88717f86f233d3",
        },
        {
          url: "/icons/windows11/Wide310x150Logo.scale-200.png",
          revision: "fb7a99ba4136f1e1fc96d49929126b44",
        },
        {
          url: "/icons/windows11/Wide310x150Logo.scale-400.png",
          revision: "211f6a5b22408d0e70ff3bcdf8ec68ae",
        },
        {
          url: "/images/bubbles.svg",
          revision: "2d0889442ef7e485b96d5090ef30806f",
        },
        {
          url: "/images/keplr-logo.svg",
          revision: "af65184030a609ae2799e979aaa9d2e5",
        },
        {
          url: "/images/lab-machine.svg",
          revision: "90c95cb60ee0065da11d7d642df57f82",
        },
        {
          url: "/images/large-vial.svg",
          revision: "e37a7b42e9ccb432e4235ae1c1788fd5",
        },
        {
          url: "/images/medium-vial.svg",
          revision: "aee0afd1fe5c7c58e2a0c8b2014c8d6c",
        },
        {
          url: "/images/osmosis-cowboy-woz-low.png",
          revision: "fd4eff366ce552548ce31fb3a96c0506",
        },
        {
          url: "/images/osmosis-cowboy-woz.png",
          revision: "eb50f9ced7bff38c8821ff3920253a41",
        },
        {
          url: "/images/osmosis-home-bg-low.png",
          revision: "ff2178b1706d4032339cd6b7cf8762b5",
        },
        {
          url: "/images/osmosis-home-bg-pattern-frontier.svg",
          revision: "2e76a97e91e85364135ce9da5b2527fe",
        },
        {
          url: "/images/osmosis-home-bg-pattern.svg",
          revision: "7f1357e5cd3c4a0bacd5522e5622829f",
        },
        {
          url: "/images/osmosis-home-bg.png",
          revision: "8c82afeb6dc7a4d35e72e93fc16e3f97",
        },
        {
          url: "/images/osmosis-home-fg-low.png",
          revision: "bcc4ecc720c667ec26a9e00662edcdc6",
        },
        {
          url: "/images/osmosis-home-fg.png",
          revision: "774961a995d21d29d6419a50ffa23dd0",
        },
        {
          url: "/images/osmosis-pool-machine.png",
          revision: "59a8dfa9321c5d68d02074e60f5243fa",
        },
        {
          url: "/images/preview.jpg",
          revision: "1f0ce69b777d0eb1343133dc7b2e287b",
        },
        {
          url: "/images/small-vial.svg",
          revision: "bb0ea3a8f63da5d5c8fc890e1546f1e6",
        },
        {
          url: "/logos/kado.svg",
          revision: "676e38bf6cd8227a9c49df900810a7c5",
        },
        {
          url: "/logos/transak.svg",
          revision: "674c9a347b997735592d354dd4621726",
        },
        { url: "/manifest.json", revision: "8c722ab931c3d0ae2569886296fdb755" },
        {
          url: "/networks/avalanche.svg",
          revision: "21fdd54e206f0cb464dbb6deb9c4b82d",
        },
        {
          url: "/networks/binance.svg",
          revision: "03d1607eadd0ce42ab56254dd4ce4c4e",
        },
        {
          url: "/networks/ethereum.svg",
          revision: "ff4749cdc726a96e05e2e8ca0363389c",
        },
        {
          url: "/networks/fantom.svg",
          revision: "fcffb60439b77b531310fb539c29f5b1",
        },
        {
          url: "/networks/moonbeam.svg",
          revision: "d24d90de7e850dfb08fc60ca45d2b420",
        },
        {
          url: "/networks/polygon.svg",
          revision: "b5e831b96929e9721c2153f2b844d47e",
        },
        {
          url: "/osmosis-logo-frontier.svg",
          revision: "350b0b168b9fe7b1e6aa44b37990009d",
        },
        {
          url: "/osmosis-logo-main.svg",
          revision: "7c423fef34bf16cc0584c46c4f620732",
        },
        {
          url: "/osmosis-logo-wc.png",
          revision: "0a855dd0d664c48a9125f48b4ba90c16",
        },
        {
          url: "/tokens/aave.svg",
          revision: "4c4787f378f6571004436bbbb4a2b77c",
        },
        {
          url: "/tokens/acre.png",
          revision: "58d6ce2d72abc53ffa00605511f63ab4",
        },
        {
          url: "/tokens/acre.svg",
          revision: "93042bcdef3bf00c0fcfcb04d0c8f2b2",
        },
        {
          url: "/tokens/akt.svg",
          revision: "3030e2bf212cd5cd2167842a7e53333b",
        },
        {
          url: "/tokens/alter.svg",
          revision: "5d04e2011aa38d2ec0199d8ee0136f9b",
        },
        {
          url: "/tokens/amber.png",
          revision: "5ad5ac94c227fdb6a5d9875e66d94ae9",
        },
        {
          url: "/tokens/amber.svg",
          revision: "7ca497ede477d3331f16a4fa42dac6ca",
        },
        {
          url: "/tokens/ape.svg",
          revision: "cbb7e15d469ce8f1de51587c2a547ea3",
        },
        {
          url: "/tokens/asvt.png",
          revision: "c100e91362b812c3883a786992514e40",
        },
        {
          url: "/tokens/atolo.png",
          revision: "c8911df5be032a2a04852ddfd51e7f76",
        },
        {
          url: "/tokens/atolo.svg",
          revision: "ee3d915299b7bef5623ec2d4513688c2",
        },
        {
          url: "/tokens/atom.svg",
          revision: "9373655964f4f55f4fd1ee67f5231e27",
        },
        {
          url: "/tokens/axl.svg",
          revision: "fbd1ba27b0864b2dd48d9b802eaef66c",
        },
        {
          url: "/tokens/axs.svg",
          revision: "e7ec5a74b0c6943eaf3e4b54a01d9509",
        },
        {
          url: "/tokens/band.svg",
          revision: "8e9a3826b078a9fb8cc8ad469e986211",
        },
        {
          url: "/tokens/bcna.svg",
          revision: "9eb1e5af555aff50f8eaffdf6dc9ed1f",
        },
        {
          url: "/tokens/bjuno.png",
          revision: "88e55254ca53419aae1eff38767372bb",
        },
        {
          url: "/tokens/bjuno.svg",
          revision: "3bb0faad7f6c37a9a4cb75ca5e2795ab",
        },
        {
          url: "/tokens/bld.png",
          revision: "6b89854e984fe3a93b7e1724a1cfdf56",
        },
        {
          url: "/tokens/block.png",
          revision: "024c8dd85eb3cb9dec3cea9d66194878",
        },
        {
          url: "/tokens/block.svg",
          revision: "008e7c467da7411fef77bdb8479fbfb6",
        },
        {
          url: "/tokens/boot.png",
          revision: "28aa247dfc37b42435595e88f46a7e12",
        },
        {
          url: "/tokens/btsg.svg",
          revision: "a01a4e19c76d146f84b9e54d4c1ab336",
        },
        {
          url: "/tokens/busd.png",
          revision: "e0820c85e4908030a84c1a82c81d9e4b",
        },
        {
          url: "/tokens/butt.svg",
          revision: "64cff6a9d057b060f6c58e7a05368211",
        },
        {
          url: "/tokens/bze.svg",
          revision: "8a90056e141d00c82fbd38dbd1b4f201",
        },
        {
          url: "/tokens/cheq.svg",
          revision: "7c691bedd06463119e7f4703cb1684bd",
        },
        {
          url: "/tokens/cmdx.png",
          revision: "f5b125aa484c43ce8e8e48627818300a",
        },
        {
          url: "/tokens/cmst.png",
          revision: "c130a5fc1e58c3cecfc7ed6217138ef7",
        },
        {
          url: "/tokens/crbrus.png",
          revision: "413ad2ab271b02e64df561672340f4e2",
        },
        {
          url: "/tokens/cre.png",
          revision: "d71c39387d01f1c4c183f2ea910ad6a0",
        },
        {
          url: "/tokens/cre.svg",
          revision: "946c690c622521241d80c6019c2074cc",
        },
        {
          url: "/tokens/cro.png",
          revision: "e7d7a5a3763aa527e1efae52750d0865",
        },
        {
          url: "/tokens/ctk.png",
          revision: "5af75320d0bc315ba5bff4b696a01acc",
        },
        {
          url: "/tokens/cudos.png",
          revision: "adcf862b277d4094948c4c0ec5202b70",
        },
        {
          url: "/tokens/cudos.svg",
          revision: "dff0562f7936bb0d0f37b2e29fc2338a",
        },
        {
          url: "/tokens/dai.png",
          revision: "26d4501f9d3f49e0a1fa9e86cd462de3",
        },
        {
          url: "/tokens/dai.svg",
          revision: "6e40fa47db30e70800ca29e40a17ec74",
        },
        {
          url: "/tokens/darc.svg",
          revision: "6e4e479e7b288455f75ad2d23c682c0d",
        },
        {
          url: "/tokens/dec.png",
          revision: "a01e61b535e4e7d5e0e11473206e77d0",
        },
        {
          url: "/tokens/dec.svg",
          revision: "c96b71a5d1e08b6de41a09b4f7545143",
        },
        {
          url: "/tokens/dhk.png",
          revision: "8c13a1480b03874dc6c50de875950c8a",
        },
        {
          url: "/tokens/dhk.svg",
          revision: "bc964209206bb4201f4aed6b362668cc",
        },
        {
          url: "/tokens/dig.png",
          revision: "cb03117aca43a1f4e85c0c800d32f28d",
        },
        {
          url: "/tokens/dot.png",
          revision: "6882618442abadadc23f377e5d4e1d16",
        },
        {
          url: "/tokens/dot.svg",
          revision: "03a555b344f21e9f579eae101b8df843",
        },
        {
          url: "/tokens/dsm.svg",
          revision: "f25f5addf66767ed02ece2a929666384",
        },
        {
          url: "/tokens/dvpn.png",
          revision: "7785d55a859332016dd2c2f7bb801008",
        },
        {
          url: "/tokens/ech.png",
          revision: "dc9ea24acc61118b1ed2a3fe28012929",
        },
        {
          url: "/tokens/eeur.png",
          revision: "8906fed804a1f4236d6cf32a001b138a",
        },
        {
          url: "/tokens/evmos.png",
          revision: "487a456e9091dec9ddf18892531401f8",
        },
        {
          url: "/tokens/evmos.svg",
          revision: "bec2a515075c833dfcef65b76aa89a02",
        },
        {
          url: "/tokens/fanfury.png",
          revision: "986b0ae7ea3b2a3680ee013300c75f59",
        },
        {
          url: "/tokens/fet.png",
          revision: "08822ba23f06a52177b28dad549fef06",
        },
        {
          url: "/tokens/frax.svg",
          revision: "332f9daf79f0b16b9504ff4c0c65c65d",
        },
        {
          url: "/tokens/ft24C9FA4F10B0F235F4A815B15FC774E046A2B2EB.png",
          revision: "762cd3c6d42e913642c82e0bfea6b7f7",
        },
        {
          url: "/tokens/ft25B30C386CDDEBD1413D5AE1180956AE9EB3B9F7.png",
          revision: "b5825aeacde84ad312b6ecdf2c352b09",
        },
        {
          url: "/tokens/ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09.png",
          revision: "9868d60f764805b84c5093c2d79bf6d0",
        },
        {
          url: "/tokens/ft2DD67F5D99E9A141142B48474FA7B6B3FF00A3FE.png",
          revision: "b819c662b1859fd2be06c2b655fdb307",
        },
        {
          url: "/tokens/ft387C1C279D962ED80C09C1D592A92C4275FD7C5D.png",
          revision: "a2a48628fa229396c32a398a33325302",
        },
        {
          url: "/tokens/ft4B030260D99E3ABE2B604EA2B33BAF3C085CDA12.png",
          revision: "d234ca3f16f054415d5d4d0e6d686f61",
        },
        {
          url: "/tokens/ft52EEB0EE509AC546ED92EAC8591F731F213DDD16.png",
          revision: "71083366835fcbf2381af836072a0cd9",
        },
        {
          url: "/tokens/ft56664FC98A2CF5F4FBAC3566D1A11D891AD88305.png",
          revision: "da27fdecc3793f37bc29fef0fd644ba4",
        },
        {
          url: "/tokens/ft575B10B0CEE2C164D9ED6A96313496F164A9607C.png",
          revision: "0c6ee85ac51bec6531dc934358d1deae",
        },
        {
          url: "/tokens/ft7020C2A8E984EEBCBB383E91CD6FBB067BB2272B.png",
          revision: "da2c48df175482d0e0b0f3b67d5bca69",
        },
        {
          url: "/tokens/ft85AE1716C5E39EA6D64BBD7898C3899A7B500626.png",
          revision: "30c1676d84a0146ccee60c6b1bb697a4",
        },
        {
          url: "/tokens/ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A.png",
          revision: "5946e95eb7bdbb35203025b35169ca67",
        },
        {
          url: "/tokens/ftD4B6290EDEE1EC7B97AB5A1DC6C177EFD08ADCC3.png",
          revision: "a94bc9e6ccc9a3142e52dd7a27c104a2",
        },
        {
          url: "/tokens/ftE4903ECC861CA45F2C2BC7EAB8255D2E6E87A33A.png",
          revision: "58054ca34a2cefbc1ebb848b997a472e",
        },
        {
          url: "/tokens/fund.png",
          revision: "1d088191d51f741224d7ec8cbd7422cf",
        },
        {
          url: "/tokens/gdai.png",
          revision: "bcf42077d04371e671392155b8bb56eb",
        },
        {
          url: "/tokens/geo.png",
          revision: "208070f1384ab76f17e8b4c8cf2881d4",
        },
        {
          url: "/tokens/geo.svg",
          revision: "3727647a329e21a9250ee90780c46463",
        },
        {
          url: "/tokens/gkey.svg",
          revision: "3b5211be9d4322231991ea11363ee2a6",
        },
        {
          url: "/tokens/glmr.png",
          revision: "81a7ff8537677c7bcd7e7e3c5a8e38ff",
        },
        {
          url: "/tokens/glmr.svg",
          revision: "688198b2ae41e59954cc815cc4d06c63",
        },
        {
          url: "/tokens/glto.svg",
          revision: "7086e5a699acb90d0e110a3f7e670fe7",
        },
        {
          url: "/tokens/glx.png",
          revision: "d0cca270a9ca7d424d42675263966362",
        },
        {
          url: "/tokens/glx.svg",
          revision: "7fd15708315fc0225fe878864a3cdfc4",
        },
        {
          url: "/tokens/grav.png",
          revision: "81692ba85202a050350439aa93049ba9",
        },
        {
          url: "/tokens/grav.svg",
          revision: "6d6f9634898b39cf0442fc6dfb801901",
        },
        {
          url: "/tokens/gusdc.png",
          revision: "476cdaa3335e3a1b0fa6c88f66488cde",
        },
        {
          url: "/tokens/gusdt.png",
          revision: "e387496ab93c15c48e7cf6a12d998cae",
        },
        {
          url: "/tokens/gwbtc.png",
          revision: "a7ec95c56e1309880a7537504e501c0d",
        },
        {
          url: "/tokens/gweth.png",
          revision: "8a8525de8b5012b8df57422747c523d1",
        },
        {
          url: "/tokens/hard.png",
          revision: "b9e5ea9517ac9caf2fafc45dca3e3f5c",
        },
        {
          url: "/tokens/hard.svg",
          revision: "a5791aff82dfefb27be738a1a81e79ba",
        },
        {
          url: "/tokens/hash.png",
          revision: "e0399a394636967ab1a2c819976cc80b",
        },
        {
          url: "/tokens/hash.svg",
          revision: "bbded9c21f87dc3c74811b5fc7d22c7e",
        },
        {
          url: "/tokens/hope.png",
          revision: "14aed7f36c9bb6757a59ccf3742ae4b8",
        },
        {
          url: "/tokens/hope.svg",
          revision: "14797b2d8d5e66c64eee81c5bdb82ef0",
        },
        {
          url: "/tokens/huahua.png",
          revision: "f0ba8427522833bba44962e87e982412",
        },
        {
          url: "/tokens/ibcx.svg",
          revision: "ab0679f02deabd67a4cc4256385daa30",
        },
        {
          url: "/tokens/imversed.svg",
          revision: "879d08b20cf40d6e62fc4425b7b0a194",
        },
        {
          url: "/tokens/inj.svg",
          revision: "fbd76887e5a3fe04dfd8e8b28f7ec00a",
        },
        {
          url: "/tokens/ion.png",
          revision: "3090660bf4af3197e21c08345fcd7b13",
        },
        {
          url: "/tokens/iov.png",
          revision: "0c5520173eb96e15ef21c22df4d24f14",
        },
        {
          url: "/tokens/iris.svg",
          revision: "637a3d762c3daeb93c17844b21d947d3",
        },
        {
          url: "/tokens/ist.png",
          revision: "a0a67a88857e90fd7ce1b93f80d9531e",
        },
        {
          url: "/tokens/ixo.png",
          revision: "46042cb75341ac28f04a01db031dec17",
        },
        {
          url: "/tokens/jkl.svg",
          revision: "21a5bbd456ef180a7210b0999afd6226",
        },
        {
          url: "/tokens/joe.png",
          revision: "764f772ff5788f29371be4a6daf0d153",
        },
        {
          url: "/tokens/juno.svg",
          revision: "f88cd3cf1c43d101bbe27c938bb901ff",
        },
        {
          url: "/tokens/kava.png",
          revision: "7114b57c27a6e896a51b96beb1bbaac7",
        },
        {
          url: "/tokens/krtc.png",
          revision: "3c603df05ca4ceb1659e6e62d506bbbf",
        },
        {
          url: "/tokens/kuji.png",
          revision: "9c31e679007e5ae16fc28e067d907f79",
        },
        { url: "/tokens/l1.png", revision: "bcae9336b5bcfaa955ce28758e0786ff" },
        { url: "/tokens/l1.svg", revision: "1fef13b4845631aa6ca689e33c190752" },
        {
          url: "/tokens/lambda.png",
          revision: "71cfa1cbf89b7fff14fa97cd5c475df4",
        },
        {
          url: "/tokens/like.svg",
          revision: "3b942b5d536f2de7c7e6c67e030cfaf9",
        },
        {
          url: "/tokens/link.png",
          revision: "306269e2ac4cb42a5adc5cb97663b421",
        },
        {
          url: "/tokens/link.svg",
          revision: "4b02bc11930246d53d859deaa960862f",
        },
        {
          url: "/tokens/lum.svg",
          revision: "eaa6e1c36adc4651b3d64824421568a7",
        },
        {
          url: "/tokens/lumen.png",
          revision: "0c9d8c4e020c8fc7a9c0ec92dd0ccd80",
        },
        {
          url: "/tokens/luna.png",
          revision: "baa48980ff4e878240006a9a101eb505",
        },
        {
          url: "/tokens/luna.svg",
          revision: "7a9ded5286f5722764176d76c83e448d",
        },
        {
          url: "/tokens/lunc.png",
          revision: "09fb2c979cf1db664de3a35421327a40",
        },
        {
          url: "/tokens/lvn.png",
          revision: "aa0661ce966e6316091dc89cfe852366",
        },
        {
          url: "/tokens/marble.png",
          revision: "ae3a004e88c6eb23d645e8cef02278c3",
        },
        {
          url: "/tokens/marble.svg",
          revision: "a200d4826bbb0d17cfbc840ce6cafdba",
        },
        {
          url: "/tokens/med.png",
          revision: "8e9b8a245bcad77c4e9780d4c4ff6b2e",
        },
        {
          url: "/tokens/medas.png",
          revision: "f093580333c0f6d1a364db72eee45429",
        },
        {
          url: "/tokens/medas.svg",
          revision: "307b421fa03e38ed0deaf8fd3de02234",
        },
        {
          url: "/tokens/meme.png",
          revision: "1e96f0a97825bc8749253afe5f933d63",
        },
        {
          url: "/tokens/mkr.svg",
          revision: "216efb8dd6a1b0d686f211a6116ace00",
        },
        {
          url: "/tokens/mntl.png",
          revision: "94258a0c25b4f958f9ca1fcb2613d2b2",
        },
        {
          url: "/tokens/mobx.png",
          revision: "0355359eb6930338c5d7b2632e227725",
        },
        {
          url: "/tokens/muse.svg",
          revision: "3a0e09b03a82f13124fa26f1ac2f9f58",
        },
        {
          url: "/tokens/neta.svg",
          revision: "66ad434037d060099f3f91dcea7e17bb",
        },
        {
          url: "/tokens/ngm.png",
          revision: "ee3ee5028168253595a70e09fe413497",
        },
        {
          url: "/tokens/o9w.png",
          revision: "fe83540f4396dd123357434444c372ac",
        },
        {
          url: "/tokens/o9w.svg",
          revision: "502c441c67ad8ad667bf7a112a1855af",
        },
        {
          url: "/tokens/odin.png",
          revision: "a62c5cf3a34d85fc85cfcf3a3cb05343",
        },
        {
          url: "/tokens/odin.svg",
          revision: "ab9719939225cd1b8b28408617cf194d",
        },
        {
          url: "/tokens/orai.png",
          revision: "4ef59eef17ce6d0411206d8d53fb8eb9",
        },
        {
          url: "/tokens/orai.svg",
          revision: "a680ee624bdb46aefce843029a34aa2d",
        },
        {
          url: "/tokens/osmo.svg",
          revision: "a16a8181956de3631f7a1c8ec2644cc4",
        },
        {
          url: "/tokens/phmn.png",
          revision: "03c86a4076b7b29856ff5f8e26473a69",
        },
        {
          url: "/tokens/phmn.svg",
          revision: "b8bff6e9f7d60b156d32f09a77cdbbed",
        },
        {
          url: "/tokens/pstake.png",
          revision: "43fd328807fe497c58ac3df24245238d",
        },
        {
          url: "/tokens/rac.png",
          revision: "db96dd33741478539baf264acad629b4",
        },
        {
          url: "/tokens/rac.svg",
          revision: "6039e82b309824d0f963361e607624df",
        },
        {
          url: "/tokens/rai.svg",
          revision: "6c10cf34d3c7b3075e8835e882bded3c",
        },
        {
          url: "/tokens/raw.png",
          revision: "3addaf71c1ada889ebbfd291410d3bc0",
        },
        {
          url: "/tokens/rebus.png",
          revision: "096fc592d8984263b773905b751fdba9",
        },
        {
          url: "/tokens/regen.png",
          revision: "8cbb8a95fe9134af44e9a34ff7287b72",
        },
        {
          url: "/tokens/rowan.svg",
          revision: "737a53a5ae422c032bfb516ce2e4ac54",
        },
        {
          url: "/tokens/scrt.svg",
          revision: "88605f180b30be99219d56bed0e5792f",
        },
        {
          url: "/tokens/seasy.svg",
          revision: "0d8434723e6e4235b506663c698bf8d5",
        },
        {
          url: "/tokens/sejuno.png",
          revision: "243c6414daa9e6445ebd65b7343eb3b3",
        },
        {
          url: "/tokens/sejuno.svg",
          revision: "8b3ebd1cbb7c5845ef7e43f06db9b9ee",
        },
        {
          url: "/tokens/shd.svg",
          revision: "ba4340d2a0c9216e6271088a26f3e9c4",
        },
        {
          url: "/tokens/shib.svg",
          revision: "2e3b637ef60b0d0d5a21e08cf4072b2f",
        },
        {
          url: "/tokens/sienna.svg",
          revision: "39a5b58890b0aa86b61cb91d98125356",
        },
        {
          url: "/tokens/solar.png",
          revision: "2c861ba7a0d2b4048ac26d663a67fb85",
        },
        {
          url: "/tokens/solar.svg",
          revision: "7e2aca7d9787de4d0861335459e684b0",
        },
        {
          url: "/tokens/somm.png",
          revision: "0008973ff152e7948d3718e2f8713735",
        },
        {
          url: "/tokens/somm.svg",
          revision: "0e8c4513cd4ce18c90b967fe525989a6",
        },
        {
          url: "/tokens/stars.png",
          revision: "56d0bd40e52f010c7267eb78c53138f2",
        },
        {
          url: "/tokens/statom.svg",
          revision: "f55176073a4bbc538c65cbca905d1482",
        },
        {
          url: "/tokens/steth.svg",
          revision: "64ad2c1d6434e70db52235ef7d156a7a",
        },
        {
          url: "/tokens/stjuno.svg",
          revision: "18cc667d99eef18b06bf796142183bec",
        },
        {
          url: "/tokens/stkd-scrt.svg",
          revision: "0c2a51729312f0b1937173a1ba5f4971",
        },
        {
          url: "/tokens/stosmo.svg",
          revision: "e2a0fc26d35ccd5c35edddec13b0eb59",
        },
        {
          url: "/tokens/strd.svg",
          revision: "b5ef1ac0e2ca48455630ff24c8bce0b9",
        },
        {
          url: "/tokens/stscrt.svg",
          revision: "d435feda77fe0141c67f7db8261edbdc",
        },
        {
          url: "/tokens/ststars.svg",
          revision: "583eb2ff204aa54b1fe5d5d5214b81a9",
        },
        {
          url: "/tokens/swp.png",
          revision: "5d71a041b945cc4376366678bdcf8255",
        },
        {
          url: "/tokens/swp.svg",
          revision: "0fde9549d5299d0a335b9847ac7104f8",
        },
        {
          url: "/tokens/swth.png",
          revision: "6920923f9e0ab8554819fb5251891959",
        },
        {
          url: "/tokens/swth.svg",
          revision: "85be69ff3771cf0c318dfe2b89534373",
        },
        {
          url: "/tokens/tgrade.svg",
          revision: "11bdf4ffb651dc281b0f5bebdd509961",
        },
        {
          url: "/tokens/tick.svg",
          revision: "703a246cdd4deef89eefd60d4a7654a9",
        },
        {
          url: "/tokens/umee.png",
          revision: "c70814f3f0e49d6c195d87bad7d147aa",
        },
        {
          url: "/tokens/uni.svg",
          revision: "8b3119d78649606408379e67d2e70cee",
        },
        {
          url: "/tokens/usdc.png",
          revision: "4190115c066cac7b036add996db3477d",
        },
        {
          url: "/tokens/usdc.svg",
          revision: "7fa638680c42c45987032ef86236e7e1",
        },
        {
          url: "/tokens/usdt.png",
          revision: "a440d4b512f4d2b9b63d3ab8818fc9e3",
        },
        {
          url: "/tokens/usdt.svg",
          revision: "43f688a0313c926433ef60c377c7cc51",
        },
        {
          url: "/tokens/usdx.png",
          revision: "9b6349e35751283515c5f1c7844a59bf",
        },
        {
          url: "/tokens/usk.png",
          revision: "f032ddcb127f49dea6b99fd88b3d1269",
        },
        {
          url: "/tokens/ustc.png",
          revision: "bf4af193c3a7035077c9577eecb32f78",
        },
        {
          url: "/tokens/utori.png",
          revision: "53f4f782389ad7dbe48313d7f8278c6f",
        },
        {
          url: "/tokens/utori.svg",
          revision: "5c30ad59d563c6f8636e682c03e45d78",
        },
        {
          url: "/tokens/vdl.svg",
          revision: "92522dc22cf637e1661df7e6bfbcbe9b",
        },
        {
          url: "/tokens/wbnb.svg",
          revision: "1aa88810b9f05826b0ce034c0799f7e6",
        },
        {
          url: "/tokens/wbtc.png",
          revision: "e7cf280d43c61e683a89c2ce96f4d332",
        },
        {
          url: "/tokens/weth.png",
          revision: "6f8e0f5eb5640d53e04df622f8a42e0a",
        },
        {
          url: "/tokens/weth.svg",
          revision: "52d04c88d8fd68ce75fca3b862160486",
        },
        {
          url: "/tokens/wmatic.svg",
          revision: "612242e63481e1ed241f375cb2b94b7d",
        },
        {
          url: "/tokens/xcn.svg",
          revision: "bc45cc6f8b4a26f5cc8d995217c5ce78",
        },
        {
          url: "/tokens/xki.svg",
          revision: "c3168a7d84725f5c85e96596a7a80fc3",
        },
        {
          url: "/tokens/xprt.png",
          revision: "f91610c5507171070b54fb09822fadc1",
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: n,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    );
});
