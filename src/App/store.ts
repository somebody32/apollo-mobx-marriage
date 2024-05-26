import { makeAutoObservable, runInAction } from "mobx";
import client from "../apolloClient";
import { gql } from "../__generated__/gql";

type Country = {
  code: string;
  name: string;
  emoji: string;
};
class Store {
  loading = false;
  error: null | string = null;
  countries: Country[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCountries() {
    this.loading = true;
    this.error = null;

    const GET_COUNTRIES = gql(`
      query GetCountries {
        countries {
          code
          name
          emoji
        }
      }
    `);

    try {
      const response = await client.query({ query: GET_COUNTRIES });
      runInAction(() => {
        this.countries = response.data.countries;
        this.loading = false;
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
}

const store = new Store();

export default store;
export { Store };
