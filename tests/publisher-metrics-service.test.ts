import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getPublisherMetrics } from "../src/services/publisherMetricsService.ts";

const originalFetch = globalThis.fetch;

afterEach(() => { globalThis.fetch = originalFetch; });

test("solicita estadísticas con el período seleccionado", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } });
  };

  await getPublisherMetrics(90);
  assert.equal(request?.method, "GET");
  assert.match(request?.url ?? "", /\/api\/publisher\/metrics\?period=90$/);
});

test("mantiene el endpoint sin filtro para pantallas que consultan el acumulado", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } });
  };

  await getPublisherMetrics();
  assert.match(request?.url ?? "", /\/api\/publisher\/metrics$/);
});
