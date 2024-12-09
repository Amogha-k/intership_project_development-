import { useMutation } from 'react-query';

interface LLMResponse {
  model: string;
  response: string;
}

// Function to fetch LLM response for Hugging Face's TinyLlama
const fetchHuggingFaceLLMResponse = async (prompt: string, apiKey: string) => {
    const repoId = "TinyLlama/TinyLlama-1.1B-Chat-v1.0";
    console.log("Fetching response for prompt:", prompt); // Log the prompt to verify the message being passed
    
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${repoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 200 },
          task: 'text-generation',
        }),
      });
  
      // Log response status
      console.log('Response Status:', response.status);
  
      // Log raw response text for debugging purposes
      const responseText = await response.text();
      console.log('Response Text:', responseText);
  
      if (!response.ok) {
        throw new Error(`Error fetching response from Hugging Face for prompt: ${prompt}`);
      }
  
      // Parse the response as JSON
      const data = JSON.parse(responseText);
      console.log('Parsed Data:', data); // Log the parsed data to check its structure
      
      const generatedText = data[0]?.generated_text;
      console.log('Generated Text:', generatedText); // Log the generated text
      
      return { model: 'TinyLlama', response: generatedText|| 'No response' };
  
    } catch (error) {
      console.error('Error in fetchHuggingFaceLLMResponse:', error);
      throw error;
    }
  };
  
  

// Function to fetch LLM response for Gemini API
const fetchGeminiLLMResponse = async (prompt: string, apiKey: string) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/gemini:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        parameters: { maxOutputTokens: 200 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching response from Gemini API for prompt: ${prompt}`);
  }

  const data = await response.json();
  return { model: 'Gemini', response: data?.candidates?.[0]?.output || 'No response' };
};

// Custom hook for handling API calls with React Query
export const useFetchLLMResponse = () => {
  return useMutation(
    async (params: { prompt: string; models: string[] }) => {
      const apiKeys = {
        huggingFace: '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', // Replace with your actual Hugging Face API key
        gemini: 'AIzaSyD5nrU7BqcSFpIx4RcQ3Efs7eRHykLTZLg', // Your Gemini API key
      };

      // Fetch responses from all selected models
      const responses = await Promise.all(
        params.models.map((model) => {
          if (model === 'TinyLlama') {
            return fetchHuggingFaceLLMResponse(params.prompt, apiKeys.huggingFace);
          } else if (model === 'Gemini') {
            return fetchGeminiLLMResponse(params.prompt, apiKeys.gemini);
          } else {
            throw new Error(`Unsupported model: ${model}`);
          }
        })
      );

      return responses;
    }
  );
};
