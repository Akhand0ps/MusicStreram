import { google } from 'googleapis';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const youtube = google.youtube('v3');

const GENIUS_API_KEY = process.env.GENIUS_API_KEY;
const GENIUS_BASE_URL = 'https://api.genius.com';

const router = express.Router();
const HUGGING_FACE_API_KEY = process.env.VITE_HUGGING_FACE_API_KEY;
const MODEL_URL = 'https://api-inference.huggingface.co/models/gpt2-large';

export const searchSongs = async (req, res) => {
  try {
    const { query } = req.query;

    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: 10
    });

    const songs = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url
    }));

    res.json(songs);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
};

export const getLyrics = async (req, res) => {
  try {
    const { title, artist } = req.query;

    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `Generate lyrics for the song "${title}" by ${artist}:\n\n`,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          num_return_sequences: 1,
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }

    const data = await response.json();
    const lyrics = data[0].generated_text;

    // Clean up the generated lyrics
    const cleanedLyrics = lyrics
      .replace(/Generate lyrics for the song.*?\n\n/g, '') // Remove the prompt
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0) // Remove empty lines
      .join('\n');

    return res.json({
      title,
      artist,
      lyrics: cleanedLyrics
    });

  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { mood } = req.query;
    
    // Implement mood-based recommendations logic here
    // This could involve using a recommendation algorithm or AI model
    
    res.json([
      // Sample response structure
      {
        id: 'sample-id',
        title: 'Sample Song',
        artist: 'Sample Artist',
        thumbnail: 'sample-thumbnail-url',
        mood: mood
      }
    ]);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

export default router; 