import axios from "axios";
const baseURL = "http://127.0.0.1:8080";
export const registerUserRequest = async (newUser) => {
  const response = await axios.post(`${baseURL}/api/users/register`, newUser);
  return response.data;
};
