// Test file to verify APIs are working
import { handleAIRequest } from './services/AIProxyService';

// Test function to check API connectivity
export async function testAPIs() {
  console.log('Testing APIs...');
  
  // Test with English
  try {
    const response = await handleAIRequest({
      query: 'Hello, can you hear me?',
      language: 'en-US',
      systemMessage: 'You are a helpful assistant. Respond briefly.'
    });
    console.log('English API test success:', response);
  } catch (error) {
    console.error('English API test failed:', error);
  }
  

}

// Add to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).testAPIs = testAPIs;
}
