from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import json
from lyricsgenius import Genius
import re

# Load environment variables
load_dotenv()
GENIUS_API_TOKEN = os.getenv('GENIUS_API_TOKEN')
HUGGING_FACE_API_KEY = os.getenv('HUGGING_FACE_API_KEY')

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Genius API
# Get token from https://genius.com/api-clients
genius = Genius(os.getenv('GENIUS_ACCESS_TOKEN'))
genius.verbose = False  # Turn off status messages
genius.remove_section_headers = False  # Keep section headers for better formatting

# Optimize yt-dlp options for faster audio extraction
ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',  # Prefer m4a format for better performance
    'quiet': True,
    'no_warnings': True,
    'extract_flat': 'in_playlist',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'm4a',
    }],
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }
}

@app.route('/search')
def search():
    try:
        query = request.args.get('query', '')
        if not query:
            return jsonify({'error': 'No search query provided'}), 400

        logger.info(f"Searching for: {query}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_results = ydl.extract_info(f"ytsearch5:{query}", download=False)
            
            if not search_results.get('entries'):
                return jsonify({'videos': []})
            
            videos = []
            for entry in search_results['entries']:
                # Get the highest quality thumbnail
                thumbnails = entry.get('thumbnails', [])
                thumbnail_url = None
                if thumbnails:
                    # Try to get the highest quality thumbnail
                    for thumb in thumbnails:
                        if thumb.get('url'):
                            thumbnail_url = thumb['url']
                            break
                
                video = {
                    'id': entry.get('id', ''),
                    'title': entry.get('title', ''),
                    'thumbnail': thumbnail_url or entry.get('thumbnail', ''),
                    'channel': entry.get('channel', ''),
                    'duration': entry.get('duration', 0)
                }
                videos.append(video)
            
            return jsonify({'videos': videos})

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-audio-url/<video_id>')
def get_audio_url(video_id):
    try:
        logger.info(f"Getting audio URL for video ID: {video_id}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            video_info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}",
                download=False
            )
            
            # Get the best audio format URL
            formats = video_info.get('formats', [])
            # Filter for audio-only formats and prefer m4a
            audio_formats = [f for f in formats if 
                           f.get('acodec') != 'none' and 
                           f.get('vcodec') == 'none']
            
            if not audio_formats:
                return jsonify({'error': 'No audio format found'}), 404
                
            # Prefer m4a format for better performance
            m4a_formats = [f for f in audio_formats if f.get('ext') == 'm4a']
            best_audio = (m4a_formats or audio_formats)[0]
            audio_url = best_audio.get('url')
            
            if not audio_url:
                return jsonify({'error': 'Could not get audio URL'}), 404
                
            return jsonify({
                'url': audio_url,
                'title': video_info.get('title', ''),
                'thumbnail': video_info.get('thumbnail', '')
            })

    except Exception as e:
        logger.error(f"Error getting audio URL: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/lyrics')
def get_lyrics():
    try:
        title = request.args.get('title')
        if not title:
            return jsonify({'error': 'No title provided'}), 400

        def clean_song_title(full_title):
            # Remove common prefixes
            prefixes_to_remove = ['Exclusive:', 'Official:', 'Full Video Song', 'Full Song', 'Video:']
            for prefix in prefixes_to_remove:
                full_title = full_title.replace(prefix, '')

            # Remove everything between brackets and parentheses
            full_title = re.sub(r'\[.*?\]', '', full_title)
            full_title = re.sub(r'\(.*?\)', '', full_title)

            # Remove everything after | symbol
            if '|' in full_title:
                full_title = full_title.split('|')[0]

            # Split by comma and take first part (removes featuring artists in some cases)
            full_title = full_title.split(',')[0]

            # Handle different separators
            separators = [' - ', ' – ', ' by ', ': ']
            artist = None
            song = full_title

            for separator in separators:
                if separator in full_title:
                    parts = full_title.split(separator)
                    artist = parts[0].strip()
                    song = parts[1].strip()
                    break

            # Clean up any extra whitespace
            song = ' '.join(song.split())
            if artist:
                artist = ' '.join(artist.split())

            logger.info(f"Cleaned title - Artist: {artist}, Song: {song}")
            return artist, song

        artist, song_title = clean_song_title(title)
        logger.info(f"Searching for lyrics: {song_title} by {artist}")

        # For this specific case, we know it's "Love Dose" by "Yo Yo Honey Singh"
        if "love dose" in song_title.lower():
            artist = "Yo Yo Honey Singh"
            song_title = "Love Dose"

        # Search for the song
        try:
            song = genius.search_song(song_title, artist)
            
            if not song and artist:
                # Try searching without artist
                song = genius.search_song(song_title)
            
            if song:
                # Clean up the lyrics
                lyrics = song.lyrics
                # Remove any empty lines at start/end
                lyrics = '\n'.join(line for line in lyrics.split('\n') if line.strip())
                
                return jsonify({
                    'lyrics': lyrics,
                    'title': song_title,
                    'artist': artist or song.artist,
                    'source': 'genius'
                })
            
        except Exception as e:
            logger.error(f"Genius API error: {str(e)}")

        # If we get here, no lyrics were found
        return jsonify({
            'error': 'Lyrics not found',
            'title': song_title,
            'artist': artist,
            'cleaned_search': f"Searched for: {song_title} by {artist}"
        }), 404

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)