import axios from "axios";
import md5 from "md5";
import { EErrorMessages } from "./enums/EErrorMessages";

const PASSWORD = "Valantis";
const API_URL = "http://api.valantis.store:40000/";

const generateAuthHeader = () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const authString = `${PASSWORD}_${timestamp}`;
  return md5(authString);
};

const fetchAPI = async (action: string, params?: any) => {
  const authHeader = generateAuthHeader();
  try {
    const response = await axios.post(
      API_URL,
      {
        action,
        params,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth": authHeader,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(EErrorMessages.FAILED_TO_FETCH_DATA);
  }
};

export { fetchAPI };
