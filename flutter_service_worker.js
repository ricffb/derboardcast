'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "audio/daily_6.mp3": "9fa959ccb248c07e522251611743ac43",
"audio/Boardcast_Unearthed_final.mp3": "b4d87ce307f9769c5441fb609865e8f4",
"audio/BT1_Hager_fin_v0_1.mp3": "c536ae1521559b9cbc3a0b2c78a14925",
"audio/Boardcast_Weihnachtsspiele.mp3": "679172e8d996e20a6d6f6b38a3e5d099",
"audio/Daily_2.mp3": "4870f323fd35831cad70c88fe11c234f",
"audio/EP1_Secret_Hitler_fin.mp3": "184cfca9976b77fa0827caf2b49c79c3",
"audio/Daily_7.mp3": "8083d679ac65335bece5f4bf185fa4cc",
"audio/DerBoardcast_Schocktober.mp3": "9283bdfbfc2ef3276c395b44e61e833e",
"audio/QD5.mp3": "be4f90794efeb0be12cae675d6083dd7",
"audio/EP4_Liegewiesenspiele_final.mp3": "421800dc4d42a13b8b58a862380ed180",
"audio/Daily_3.mp3": "33ae4a9201f95859ac6e1f41c7d2318b",
"audio/EP5+-+Unstable+Unicorn+fin.mp3": "f45bf36006dee9301bdcfc864b68aeb8",
"audio/Daily_1.mp3": "a682e26d965ff68599bb4f8e8739b4a6",
"audio/BT2_Zeno_final.mp3": "53a94146c0c9a732e12fc5d925c2f7da",
"audio/Boardcast_Silvesterspiele.mp3": "70328b0da14d9f83e78bd344bfd859c8",
"audio/Boardcast_Agent+Undercover.mp3": "c223610ede6a26a8ea5e73c7df49cd01",
"audio/QD4.mp3": "d964d8ae4491a55bc7a277c742bb8531",
"audio/EP_6_Azul_fin.mp3": "7e14b254fec26d19a4a9c124bbf5cefe",
"main.dart.js": "0b05013f641396e96ef060d5b3267451",
"feed.xml": "623e705ebb12011890a26a395786d90b",
"assets/NOTICES": "da90e60904f5b55cf18f0af5c10fa361",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/FontManifest.json": "ffef466a50fbc9ba6a16887682586d0d",
"assets/packages/flutter_markdown/assets/logo.png": "67642a0b80f3d50277c44cde8f450e50",
"assets/packages/open_iconic_flutter/assets/open-iconic.woff": "3cf97837524dd7445e9d1462e3c4afe2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/AssetManifest.json": "e47ff1ab0af5dab889b9f000e3acb0cd",
"favicon.png": "898dff13424ef89cd152ae54d875754f",
"manifest.json": "0d2ef5bf43d0a5d981e8400f48458541",
"img/icon.jpg": "900666dc913f9acaa2d76127a2972814",
"img/spotify.png": "0a5ef7a942cb1d9a64169f57ba1a05c3",
"img/secret_hitler.png": "2f3baeb8db8eb399538f323e4b91d0f6",
"img/icon.png": "bab8379a3c81615fdc1cce519169ccc2",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"index.html": "2dfdade837632d9630a6ca0d4a420179",
"/": "2dfdade837632d9630a6ca0d4a420179"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
