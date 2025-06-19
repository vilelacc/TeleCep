import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const instance = Axios.create();
const axios = setupCache(instance);

const searchByZipCode = async (zipCode) => {
    const { data } = await axios.get(`https://viacep.com.br/ws/${zipCode}/json/`);

  return data;
};

export default searchByZipCode;
