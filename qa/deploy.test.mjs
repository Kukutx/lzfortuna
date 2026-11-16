// npm run deploy: provider selection and the per-host configuration it writes.
import assert from "node:assert/strict";
import test from "node:test";
import { firebaseConfig, target, wranglerConfig } from "../scripts/deploy.mjs";

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
