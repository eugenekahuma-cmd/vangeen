import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const sendMessage = async (message, history = []) => {
  const response = await axios.post(`${SERVER_URL}/api/chat`, {
    message,
    history
  });
  return response.data.reply;
};