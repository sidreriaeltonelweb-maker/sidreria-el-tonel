self.addEventListener("install", () => {
  console.log("Service worker instalado");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});