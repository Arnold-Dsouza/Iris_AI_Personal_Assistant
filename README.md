# Iris - Your Voice Assistant

![Iris Voice Assistant Preview](/public/image.png)

## Overview

Iris is a modern, multilingual voice assistant that brings natural conversation to your browser. With support for English and Hindi, Iris makes interaction smooth and intuitive.

### Live Captions (CC)
- Real-time subtitles display what you speak
- AI response captions show Iris’s replies
- A toggle button at the top center lets you show or hide captions
- Auto-scroll keeps the latest conversation visible
- A clean interface shows the most recent exchanges

## Features

### Multilingual Support
- English (US)
- Hindi (India)

### Key Capabilities
- Responsive blob visualization
- Real-time language switching
- Backed by advanced AI models
- Natural voice generation
- Accurate speech recognition

### User Experience
- Smooth animations and transitions
- Dynamic color effects
- Fully responsive design
- Click or voice-based activation

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Iris_AI_Personal_Assistant.git
   cd Iris_AI_Personal_Assistant
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_HUGGING_FACE_API_TOKEN=your_huggingface_api_token
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```


## Voice Commands

### English
- "Switch to Hindi"
- "हिंदी में बोलो" (Speak in Hindi)
- Ask any question naturally

### Hindi
- "अंग्रेजी में बोलो" (Speak in English)
- "Switch to English"
- Ask questions in Hindi

## Tech Stack

- React + TypeScript  
- Tailwind CSS  
- Google Gemini API  
- Hugging Face Models  
- Web Speech API  
- Vite

## Troubleshooting

### Voice Recognition Issues
1. Use Chrome, Edge, or Safari for full compatibility.  
2. Speech recognition works only over HTTPS (except on localhost).  
3. Allow microphone access when prompted.  
4. Check the browser console for any error messages.

### API Issues
1. Verify your `.env` file contains correct API keys:
   ```env
   GEMINI_API_KEY=your_key_here
   VITE_HUGGING_FACE_API_TOKEN=your_token_here
   ```
2. **API Limits**: Check if you've exceeded API rate limits
3. **Network**: Ensure stable internet connection

### Testing APIs
Open browser console and run:
```javascript
window.testAPIs()
```

### What Hugging Face Does
The Hugging Face API acts as a fallback when the Google Gemini API is unavailable or busy. It provides alternative AI models for text generation and enhances multilingual support, especially for Hindi.

## Usage

### Continuous Listening Mode
1. Click the animated blob once to start continuous listening.  
2. Speak multiple questions; Iris will respond automatically to each.  
3. No need to click again—continuous mode stays active until you stop it.  
4. Click the blob again to exit continuous mode.

### Live Captions
- Real-time subtitles appear as you speak.  
- AI response captions show Iris’s answers.  
- Toggle captions from the top center button.  
- Auto-scroll keeps the latest part of the conversation visible.  
- The interface shows only the recent exchanges for clarity.

### Language Commands
- “Speak Hindi” / “Switch to Hindi”  
- “हिंदी में बोलो” / “Speak in Hindi”  
- “अंग्रेजी में बोलो” / “Speak in English”

### Visual Indicators
- A green indicator shows when continuous listening is active.  
- The animated blob changes color to reflect the assistant’s state:
  - Purple: Idle or ready  
  - Blue: Listening  
  - Green: Processing or responding  
  - Purple: Speaking

## Dynamic Visualization

- The blob reacts to voice input.  
- It changes color based on the assistant’s state.  
- Smooth transitions create a polished, modern look.

## Language Support

- Instant switching between English and Hindi.  
- Natural, clear voice responses.  
- Accurate speech recognition for both languages.

## AI Integration

- Context-aware conversation handling.  
- Quick and natural responses.  
- Reliable performance with fallback models.

## License
This project is open source and available under the [MIT License](LICENSE).

## Contributing
Contributions are welcome. You can open a Pull Request with improvements or new features.

## Contact
For questions or support, please open an issue on GitHub.
