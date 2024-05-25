import { expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { Store } from "./store";
import { server } from "../../mockServer";
import { HttpResponse, graphql } from "msw";
import client from "../apolloClient";

const errorHandler = graphql.query("GetCountries", () => {
  return HttpResponse.json({
    errors: [
      {
        message: `Something went wrong`,
      },
    ],
  });
});

const responseHandler = graphql.query("GetCountries", () => {
  return HttpResponse.json({
    data: {
      countries: [
        { code: "US", name: "United States", emoji: "🇺🇸" },
        { code: "CA", name: "Canada", emoji: "🇨🇦" },
      ],
    },
  });
});

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  client.resetStore();
});
afterAll(() => server.close());

it("fetches countries successfully", async () => {
  server.use(responseHandler);
  const store = new Store();

  await store.fetchCountries();

  expect(store.countries).toHaveLength(2);
  expect(store.countries[0].name).toBe("United States");
  expect(store.countries[1].name).toBe("Canada");
  expect(store.loading).toBe(false);
  expect(store.error).toBe(null);
});

it("handles errors", async () => {
  server.use(errorHandler);
  const store = new Store();
  expect(store.countries).toHaveLength(0);

  await store.fetchCountries();

  expect(store.countries).toHaveLength(0);
  expect(store.loading).toBe(false);
  expect(store.error).toBe("Something went wrong");
});
