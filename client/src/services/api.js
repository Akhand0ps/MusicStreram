import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const searchSongs = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

export const getLyrics = async (songId) => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/${songId}/lyrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    throw error;
  }
};

export const getRecommendations = async (mood) => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/recommendations`, {
      params: { mood }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}; 