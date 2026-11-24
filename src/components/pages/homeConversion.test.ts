import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const home = readFileSync("src/components/pages/UmbrellaLandingPage.tsx", "utf8");

test("hero primary CTA starts the IP packet directly (no anchor scroll)", () => {
  const hero = home.slice(0, home.indexOf('id="choose-a-path"'));
  assert.match(hero, /href=\{ROUTES\.disclaimer\}[\s\S]*ctaId="home_hero_start_ip"/);
  assert.match(hero, /href=\{ROUTES\.sample\}[\s\S]*ctaId="home_hero_sample"/);
  assert.match(hero, /href=\{ROUTES\.legal\}[\s\S]*ctaId="home_hero_legal"/);
  assert.doesNotMatch(hero, /href="#choose-a-path"/);
});

test("homepage keeps the not-legal-advice boundary above the fold", () => {
  const hero = home.slice(0, home.indexOf('id="choose-a-path"'));
  assert.match(hero, /not legal advice/i);
});

test("internal product-architecture language is gone from the homepage", () => {
  for (const phrase of ["canonical IP record", "flattened into a generic legal form", "internal product structure", "One account direction"]) {
    assert.ok(!home.includes(phrase), phrase);
  }
});

test("every homepage CTA id is a valid GA conversion cta_id", () => {
  const ids = [...home.matchAll(/ctaId="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 5);
  for (const id of ids) assert.match(id, /^[a-z0-9_]{1,40}$/);
  assert.equal(new Set(ids).size, ids.length, "cta ids must be unique");
});

test("site nav primary action starts the packet and IP is reachable on mobile", () => {
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");
  assert.match(nav, /href=\{ROUTES\.disclaimer\} className="btn-primary/);
  assert.match(nav, /href=\{ROUTES\.ip\} className="[^"]*sm:hidden"/);
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\.link-brand \{/);
});
