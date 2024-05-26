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

  reset() {
    this.loading = false;
    this.error = null;
    this._countries = [];
    this.pageSize = 10;
    this.page = 1;
  }

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
      const variables = { filter: nameStarts ? `^${nameStarts}` : "" };
      const response = await client.query({ query: GET_COUNTRIES, variables });
      runInAction(() => {
        this._countries = response.data.countries;
        this.loading = false;
        this.page = 1;
      });
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = String(error);
        }
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
}

const store = new Store();

export default store;
