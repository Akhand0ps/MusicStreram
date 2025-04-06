import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Search endpoint
app.get('/api/songs/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    if (!process.env.GENIUS_ACCESS_TOKEN) {
      throw new Error('Genius API token not configured');
    }

    const response = await axios.get('https://api.genius.com/search', {
      headers: {
        'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      },
      params: {
        q: query
      }
    });

    if (!response.data?.response?.hits) {
      console.error('Unexpected API response structure:', response.data);
      return res.status(500).json({ error: 'Invalid API response' });
    }

    const songs = response.data.response.hits.map(hit => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      thumbnail: hit.result.song_art_image_thumbnail_url
    }));

    return res.json(songs);

  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid API token' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to search songs. Please try again later.'
    });
  }
});

// Lyrics endpoint
app.post('/api/lyrics', async (req, res) => {
  try {
    const { title, artist } = req.body;
    console.log('Fetching lyrics for:', title, artist);

    const searchResponse = await axios.get('https://api.genius.com/search', {
      headers: {
        'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      },
      params: {
        q: `${title} ${artist}`
      }
    });

    const hits = searchResponse.data.response.hits;
    if (hits.length === 0) {
      return res.json({ lyrics: 'Lyrics not found' });
    }

    const url = hits[0].result.url;
    const pageResponse = await axios.get(url);
    const $ = cheerio.load(pageResponse.data);

    let lyrics = '';
    $('[data-lyrics-container="true"]').each((i, elem) => {
      lyrics += $(elem).text() + '\n';
    });

    lyrics = lyrics.trim();
    res.json({ lyrics: lyrics || 'Lyrics not found' });
  } catch (error) {
    console.error('Lyrics error:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 