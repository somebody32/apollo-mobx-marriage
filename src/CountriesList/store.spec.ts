import { expect, it, beforeAll, afterEach, afterAll } from "vitest";
import store from "./store";
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

const responseHandler = graphql.query("GetCountries", (req) => {
  if (req.variables.filter === "^Uni") {
    return HttpResponse.json({
      data: {
        countries: [{ code: "US", name: "United States", emoji: "🇺🇸" }],
      },
    });
  }

  return HttpResponse.json({
    data: {
      countries: [
        { code: "US", name: "United States", emoji: "🇺🇸" },
        { code: "CA", name: "Canada", emoji: "🇨🇦" },
        { code: "MX", name: "Mexico", emoji: "🇲🇽" },
        { code: "BR", name: "Brazil", emoji: "🇧🇷" },
        { code: "AR", name: "Argentina", emoji: "🇦🇷" },
        { code: "CL", name: "Chile", emoji: "🇨🇱" },
        { code: "CO", name: "Colombia", emoji: "🇨🇴" },
        { code: "PE", name: "Peru", emoji: "🇵🇪" },
      ],
    },
  });
});

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  client.resetStore();
  store.reset();
});
afterAll(() => server.close());

it("fetches countries successfully", async () => {
  server.use(responseHandler);

  await store.fetchCountries();

  expect(store.countries).toHaveLength(8);
  expect(store.countries[0].name).toBe("United States");
  expect(store.countries[1].name).toBe("Canada");
  expect(store.loading).toBe(false);
  expect(store.error).toBe(null);
});

it("resets the store", async () => {
  server.use(responseHandler);

  await store.fetchCountries();
  store.reset();

  expect(store.countries).toHaveLength(0);
  expect(store.loading).toBe(false);
  expect(store.error).toBe(null);
});

it("handles errors", async () => {
  server.use(errorHandler);
  expect(store.countries).toHaveLength(0);

  await store.fetchCountries();

  expect(store.countries).toHaveLength(0);
  expect(store.loading).toBe(false);
  expect(store.error).toBe("Something went wrong");
});

it("filters countries successfully", async () => {
  server.use(responseHandler);
  await store.fetchCountries({ nameStarts: "Uni" });

  expect(store.countries).toHaveLength(1);
  expect(store.countries[0].name).toBe("United States");
  expect(store.loading).toBe(false);
  expect(store.error).toBe(null);
});

it("paginates countries successfully", async () => {
  server.use(responseHandler);
  store.pageSize = 2;
  await store.fetchCountries();

  expect(store.countries).toHaveLength(2);
  expect(store.totalPages).toBe(4);
  expect(store.countries[0].name).toBe("United States");
  expect(store.countries[1].name).toBe("Canada");

  store.getNextPage();

  expect(store.countries).toHaveLength(4);
  expect(store.countries[0].name).toBe("United States");
  expect(store.countries[1].name).toBe("Canada");
  expect(store.countries[2].name).toBe("Mexico");
  expect(store.countries[3].name).toBe("Brazil");

  expect(store.loading).toBe(false);
  expect(store.error).toBe(null);
});
