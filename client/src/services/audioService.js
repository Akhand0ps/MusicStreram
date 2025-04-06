const AUDIO_SERVICE_URL = 'http://localhost:5002';

export const extractAudio = async (videoId) => {
  try {
    const response = await fetch(`${AUDIO_SERVICE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract audio');
    }

    return await response.json();
  } catch (error) {
    console.error('Audio extraction error:', error);
    throw error;
  }
};

export const getAudioUrl = (videoId) => {
  return `${AUDIO_SERVICE_URL}/audio/${videoId}`;
};

export const cleanupOldFiles = async () => {
  try {
    const response = await fetch(`${AUDIO_SERVICE_URL}/cleanup`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to cleanup old files');
    }

    return await response.json();
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}; 