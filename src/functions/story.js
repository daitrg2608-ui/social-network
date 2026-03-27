import axios from "axios";

export const createStory = async (text, media, token) => {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/createStory`,
      { text, media },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { status: "ok", data };
  } catch (error) {
    return error.response?.data?.message || "Create story failed.";
  }
};

export const getStories = async (token) => {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/getStories`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    return error.response?.data?.message || "Get stories failed.";
  }
};

