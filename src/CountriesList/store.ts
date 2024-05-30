import { makeAutoObservable, runInAction } from "mobx";
import client from "../apolloClient";
import { gql } from "../__generated__/gql";

type Country = {
  code: string;
  name: string;
  emoji: string;
};

const GET_COUNTRIES = gql(/* GraphQL */ `
  query GetCountries($filter: String) {
    countries(filter: { name: { regex: $filter } }) {
      code
      name
      emoji
    }
  }
`);

class Store {
  loading = false;
  error: null | string = null;
  _countries: Country[] = [];
  pageSize = 10;
  page = 1;

  // DI/configuration for testing
  constructor({ pageSize }: { pageSize?: number } = {}) {
    if (pageSize) {
      this.pageSize = pageSize;
    }

    makeAutoObservable(this);
  }

  async fetchCountries({ nameStarts }: { nameStarts?: string } = {}) {
    this.loading = true;
    this.error = null;

    try {
      const response = await requestCountries({ nameStarts });
      runInAction(() => {
        this._countries = response.data.countries;
        this.page = 1;
      });
    } catch (error) {
      runInAction(() => {
        this.error = errorMessage(error);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  get countries() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this._countries.slice(0, end);
  }

  get totalPages() {
    return Math.ceil(this._countries.length / this.pageSize);
  }

  getNextPage() {
    this.page++;
  }

  reset() {
    this.loading = false;
    this.error = null;
    this._countries = [];
    this.pageSize = 10;
    this.page = 1;
  }
}

// Utils
function requestCountries({ nameStarts }: { nameStarts?: string } = {}) {
  return client.query({
    query: GET_COUNTRIES,
    variables: { filter: nameStarts ? `^${nameStarts}` : "" },
  });
}

function errorMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else {
    return String(error);
  }
}

const store = new Store();
export default store;
