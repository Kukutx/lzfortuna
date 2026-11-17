// npm run deploy: provider selection and the per-host configuration it writes.
import assert from "node:assert/strict";
import test from "node:test";
import { firebaseConfig, target, wranglerConfig } from "../scripts/deploy.mjs";
import { nextRedirects, profileRedirects } from "../src/config/redirects.mjs";

const profile = {
  site: { origin: "https://example.vercel.app" },
  deployment: {
    provider: "vercel",
    providers: {
      vercel: { project: "example" },
      cloudflare: {
        accountId: "0123456789abcdef0123456789abcdef",
        worker: "example",
        origin: "https://example.someone.workers.dev",
      },
    },
  },
};

test("the profile's provider is the default; another listed one can be named", () => {
  assert.equal(target(profile).provider, "vercel");
  assert.equal(target(profile, "cloudflare").provider, "cloudflare");
});

test("each provider builds with its own address, else the site's", () => {
  assert.equal(target(profile).origin, "https://example.vercel.app");
  assert.equal(target(profile, "cloudflare").origin, "https://example.someone.workers.dev");
});

test("the Cloudflare Worker config carries what the Next adapter needs", () => {
  const config = wranglerConfig(profile.deployment.providers.cloudflare);
  assert.equal(config.name, "example");
  assert.equal(config.account_id, "0123456789abcdef0123456789abcdef");
  assert.equal(config.main, ".open-next/worker.js");
  assert.ok(config.compatibility_flags.includes("nodejs_compat"));
  assert.deepEqual(config.assets, { directory: ".open-next/assets", binding: "ASSETS" });
  assert.equal(config.services[0].service, "example", "the Worker can call itself");
  assert.equal(config.keep_names, false);
});

test("Firebase serves the export with the site's headers and the weather service allowed", () => {
  const { hosting } = firebaseConfig("example-site");
  assert.equal(hosting.site, "example-site");
  assert.equal(hosting.public, "out");
  const headers = Object.fromEntries(hosting.headers[0].headers.map((h) => [h.key, h.value]));
  assert.match(headers["Content-Security-Policy"], /connect-src 'self'[^;]*https:\/\/api\.open-meteo\.com/);
  assert.match(headers["Strict-Transport-Security"], /max-age=/);
});

test("a profile's redirects reach every host in its own form", () => {
  const redirects = [
    { from: "/services/sewing", to: "/sartoria", subpaths: true },
    { from: "/old", to: "/#services" },
  ];
  const routed = target({ ...profile, deployment: { ...profile.deployment, redirects } }, "cloudflare");
  assert.deepEqual(routed.redirects, redirects);
  assert.deepEqual(nextRedirects(redirects), [
    { source: "/services/sewing/:rest*", destination: "/sartoria", permanent: true },
    { source: "/old", destination: "/#services", permanent: true },
  ]);
  const { hosting } = firebaseConfig("example-site", redirects);
  assert.deepEqual(hosting.redirects, [
    { source: "/services/sewing", destination: "/sartoria", type: 301 },
    { source: "/services/sewing/**", destination: "/sartoria", type: 301 },
    { source: "/old", destination: "/#services", type: 301 },
  ]);
  assert.deepEqual(firebaseConfig("example-site").hosting.redirects, []);
});

test("a redirect whose destination is itself redirected is refused", () => {
  const looping = { deployment: { redirects: [
    { from: "/zh", to: "/", subpaths: true },
    { from: "/a", to: "/zh/b" },
  ] } };
  assert.throws(() => profileRedirects(looping), /"\/zh\/b" is itself redirected by "\/zh"/);
});

test("Next's hashed build output is cached for good on Firebase", () => {
  const { hosting } = firebaseConfig("example-site");
  const immutable = hosting.headers.find((h) => h.source === "/_next/static/**");
  assert.match(immutable.headers[0].value, /immutable/);
});
