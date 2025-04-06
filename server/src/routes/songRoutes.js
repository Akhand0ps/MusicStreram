import express from 'express';
import { searchSongs, getLyrics } from '../controllers/songController.js';
import axios from 'axios';

const router = express.Router();

router.get('/search', searchSongs);
router.post('/lyrics', getLyrics);

router.get('/songs/search', async (req, res) => {
  try {
    const { query } = req.query;
    // Your search logic here
    const response = await axios.get(`https://api.genius.com/search`, {
      headers: {
        'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      },
      params: {
        q: query
      }
    });

    const songs = response.data.response.hits.map(hit => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      thumbnail: hit.result.song_art_image_thumbnail_url
    }));

    res.json(songs);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

export default router; 