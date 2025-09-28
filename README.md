# Iris AI Personal Assistant 🎙️✨

![Iris AI Personal Assistant Preview](/public/image.png)

## 🌟 Overview

Iris is a modern, multilingual AI voice assistant that brings natural conversation to your browser. With support for English 🇺🇸, Arabic 🇱🇧, and French 🇫🇷, Iris makes interaction seamless and intuitive.

### 💬 Live Captions (CC)
- **Real-time subtitles** show what you're saying as you speak
- **AI response captions** display what Iris is saying back
- **Toggle CC button** at the top center to show/hide captions
- **Auto-scroll** keeps latest conversation visible
- **Clean interface** shows last few exchanges

## ✨ Features

- 🗣️ **Multilingual Support**
  - English (US) 🇺🇸
  - Arabic (Lebanese) 🇱🇧
  - French 🇫🇷

- 🎯 **Key Capabilities**
  - 🎨 Beautiful, responsive blob visualization
  - 🔄 Real-time language switching
  - 🤖 Powered by advanced AI models
  - 🎵 Natural voice synthesis
  - 🎤 Accurate speech recognition

- 💫 **User Experience**
  - 🌊 Smooth animations and transitions
  - 🎨 Dynamic color changes
  - 📱 Fully responsive design
  - 🖱️ Click or voice activation

## 🚀 Getting Started

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

## 🗣️ Voice Commands

- 🇺🇸 **English**
  - "Switch to Arabic"
  - "Switch to French"
  - Ask any question!

- 🇱🇧 **Arabic**
  - "تكلم انجليزي" (Speak English)
  - Ask questions in Arabic!

- 🇫🇷 **French**
  - "Passer à l'anglais" (Switch to English)
  - Ask questions in French!

## 🛠️ Tech Stack

- ⚛️ React + TypeScript
- 🎨 Tailwind CSS
- 🧠 Google Gemini API
- 🤖 Hugging Face Models
- 🎵 Web Speech API
- ⚡ Vite

## 🌈 Features in Detail

## 🔍 Troubleshooting

### Voice Recognition Issues
1. **Browser Support**: Make sure you're using Chrome, Edge, or Safari
2. **HTTPS Required**: Speech recognition only works over HTTPS (except on localhost)
3. **Microphone Permissions**: Allow microphone access when prompted
4. **Check Console**: Open browser DevTools and check for error messages

### API Issues
1. **Environment Variables**: Ensure your `.env` file has the correct API keys:
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

### What Does Hugging Face Do?
The Hugging Face API serves as a **fallback** when Google's Gemini API fails or is overloaded. It provides alternative AI models for text generation, particularly useful for Arabic language support with specialized models like `Salesforce/xgen-7b-8k-arabic`.

## 📱 Usage

### 🎯 Continuous Listening Mode (Like Gemini!)
1. **Click once** on the animated blob to start continuous listening
2. **Speak multiple questions** - the assistant will respond to each one automatically
3. **No need to click again** - it keeps listening after each response
4. **Click the blob again** to stop continuous mode

### � Live Captions (CC)
- **Real-time subtitles** show what you're saying as you speak
- **AI response captions** display what Iris is saying back
- **Toggle CC button** at the top center to show/hide captions
- **Auto-scroll** keeps latest conversation visible
- **Clean interface** shows last few exchanges

### �🗣️ Language Commands
- "Speak Arabic" / "Switch to Arabic"  
- "تكلم انجليزي" / "Speak English"
- "Speak French" / "Switch to French"

### 🎨 Visual Indicators
- **Green indicator** shows when continuous listening is active
- **Animated blob** changes color based on current state:
  - Purple: Idle/Ready
  - Blue: Listening
  - Green: Processing/Responding
  - Purple: Speaking

## 🎨 Features

### 🌟 Dynamic Blob Visualization
- Responds to voice input
- Changes color based on state
- Smooth animations

### 🌐 Language Support
- Seamless language switching
- Natural voice synthesis
- Accurate speech recognition

### 🤖 AI Integration
- Smart context handling
- Natural language processing
- Quick response times


## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with one click!

### Other Platforms
- **Netlify**: Connect GitHub repo and deploy
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Firebase Hosting**: Deploy with `firebase deploy`

## 🌟 Made with Love and AI 🤖

Built with React, TypeScript, and modern web technologies for the best user experience.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
