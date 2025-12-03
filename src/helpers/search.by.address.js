import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const instance = Axios.create();
const axios = setupCache(instance);

const searchByAddress = async (federativeUnit, city, street) => {
  const { data } = await axios.get(
    `https://viacep.com.br/ws/${federativeUnit}/${city}/${street}/json/`
  );

  return data;
};

export default searchByAddress;
