/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "f18499a354fb565d88db16327039e4ff"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f4fe5720597cfa653e23456d42992157"
  }, {
    "url": "pwa-192x192.png",
    "revision": "fef97643fd4127aa884233a1150198cb"
  }, {
    "url": "index.html",
    "revision": "67f91303a72f72a1da8856bfe530f330"
  }, {
    "url": "icon.svg",
    "revision": "f42a0fe23455045e31105da3ff2813b6"
  }, {
    "url": "icon-maskable.svg",
    "revision": "f42a0fe23455045e31105da3ff2813b6"
  }, {
    "url": "favicon.ico",
    "revision": "a8bfc743c9cfe539148ed983e268f04c"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a578bc328dd0e228ce293e88fa097490"
  }, {
    "url": "assets/index-c6Skx4Bu.js",
    "revision": null
  }, {
    "url": "assets/index-O1darUXu.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a578bc328dd0e228ce293e88fa097490"
  }, {
    "url": "favicon.ico",
    "revision": "a8bfc743c9cfe539148ed983e268f04c"
  }, {
    "url": "icon.svg",
    "revision": "f42a0fe23455045e31105da3ff2813b6"
  }, {
    "url": "pwa-192x192.png",
    "revision": "fef97643fd4127aa884233a1150198cb"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f4fe5720597cfa653e23456d42992157"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "f18499a354fb565d88db16327039e4ff"
  }, {
    "url": "manifest.webmanifest",
    "revision": "d52dd1f7191d12c2ae5a89ae3ebeb6c5"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
