// AI interaction service using OpenRouter API with Meta-Llama/Llama-4-Maverick

export interface AIResponse {
  text: string;
}

class AIService {
  private apiUrl = '/api/ai'; // Proxy URL to protect API key
  private apiKey = ''; // Will be set using environment variable

  // Get response from AI model via OpenRouter API
  public async getResponse(query: string, language: string): Promise<AIResponse> {
    try {
      // Prepare the system message based on language
      let systemMessage = '';
      if (language.includes('hi')) {
        systemMessage = `आप एक बुद्धिमान व्यक्तिगत सहायक हैं जिसका नाम इरिस है। बिना स्पष्टीकरण प्रश्न पूछे सीधे और संक्षिप्त उत्तर दें। केवल आवश्यक जानकारी दें और उपयोगकर्ता से अतिरिक्त प्रश्न न पूछें।`;
      } else {
        systemMessage = `You are an intelligent personal assistant named Iris. Provide direct, concise answers without asking clarifying questions back. Give only the information requested and do not ask the user additional questions. Respond in American English.`;
      }

      // Make the request to the proxy endpoint
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          language,
          systemMessage
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return { text: data.responseText };
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Return a graceful error message in the appropriate language
      if (language.includes('ar')) {
        return { text: "عذراً، حصل خطأ في الاتصال. الرجاء المحاولة مرة أخرى." };
      } else {
        return { text: "Sorry, there was a connection error. Please try again." };
      }
    }
  }
}

export default new AIService();
