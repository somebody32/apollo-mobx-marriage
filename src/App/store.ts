import { gql } from "@apollo/client";
import { makeAutoObservable, runInAction } from "mobx";
import client from "../apolloClient";

class Store {
  loading = false;
  error: null | string = null;
  countries = [];

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCountries() {
    this.loading = true;
    this.error = null;

    const GET_CALENDARS = gql`
      query GetCountries {
        countries {
          code
          name
          emoji
        }
      }
    `;

    try {
      const response = await client.query({ query: GET_CALENDARS });
      console.log(response);
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
