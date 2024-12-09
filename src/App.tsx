import React, { useState } from 'react'; 
import Select from 'react-select';
import { Box, Button, TextField, Typography, Grid, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useFetchLLMResponse } from './useFetchLLMResponse.ts';  // Importing the custom hook

const modelOptions = [
  { value: 'TinyLlama', label: 'TinyLlama' },
  { value: 'Gemini', label: 'Gemini' },
];

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<any[]>([]);
  const [responses, setResponses] = useState<any>({});
  const [previewModel, setPreviewModel] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  // Use the custom hook for handling LLM API calls
  const { mutate, isLoading, error, data } = useFetchLLMResponse();

  
  type ResponseData = {
    generated_text?: string;
    data?: string; // Adjust this type based on your actual API response structure
  };
  
  const handleGenerate = async () => {
    const updatedResponses = { ...responses };
  
    if (selectedModels.length === 0 || !prompt) return;
  
    // Flag to check if all responses are fetched
    let isFetchingComplete = false;
  
    // Process each model asynchronously
    await Promise.all(
      selectedModels.map(async (model) => {
        try {
          // Make the API call to generate response
          const response = await mutate({ prompt, models: [model.value] }) as ResponseData | void; // Cast the response to the expected type
          console.log(`Response from ${model.label}:`, response);
  
          // Check if the response is in the expected format
          if (Array.isArray(response)) {
            // If response is an array, check the first item and extract the generated_text
            updatedResponses[model.value] = response[0]?.generated_text || `No response from ${model.label}`;
          } else if (response && 'data' in response) {
            // For models that return a "data" property (e.g., Gemini)
            updatedResponses[model.value] = response.data || `No response from ${model.label}`;
          } else {
            // Log and handle unexpected response formats
            console.error(`Unexpected response format from ${model.label}:`, response);
            updatedResponses[model.value] = `Unexpected response format from ${model.label}`;
          }
        } catch (error) {
          // Log the error and update responses with error message
          console.error("API Error:", error);
          updatedResponses[model.value] = `Error fetching response for ${model.label}: ${error.message}`;
        }
      })
    );
  
    // Once all promises are resolved, we update the state
    isFetchingComplete = true;
  
    // Check if fetching is complete and then update state
    if (isFetchingComplete) {
      setResponses(updatedResponses);
    }
  };
  
  
  
  
  

  const handleRegenerate = (model: string) => {
    setOpenDialog(true);
  };

  const handlePreview = (model: string) => {
    setPreviewModel(model);
  };

  const handleSaveModifications = () => {
    setPrompt(newPrompt); 
    setResponses((prev: any) => ({
      ...prev,
      [selectedModels[0]?.value]: `Updated Response for ${selectedModels[0]?.label}`,
    }));
    setOpenDialog(false);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom, #f3f4f6, #e3e7ea)',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: 'bold',
          color: '#444',
          marginBottom: '20px',
        }}
      >
        AI Tool
      </Typography>

      {/* Prompt Input Section */}
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#f9f9ff',
          borderRadius: '10px',
        }}
      >
        <Box display="flex" gap={2}>
          <TextField
            label="Enter your prompt"
            variant="outlined"
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleGenerate}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Generate
          </Button>
        </Box>
      </Paper>

      {/* Model Selection Section */}
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#eef7ff',
          borderRadius: '10px',
        }}
      >
        <Typography variant="body1" color="textSecondary" marginBottom={1}>
          Select the models to compare:
        </Typography>
        <Select
          options={modelOptions}
          isMulti
          onChange={(options) => setSelectedModels(options|| [])}
          placeholder="Select models"
        />
      </Paper>

      {/* Model Response Windows */}
      <Grid container spacing={3}>
        {selectedModels.map((model) => (
          <Grid item xs={12} sm={6} key={model.value}>
            <Paper
              elevation={3}
              sx={{
                padding: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#444', marginBottom: '10px' }}
              >
                {model.label}
              </Typography>
              <Box
                sx={{
                  height: '150px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  overflow: 'auto',
                }}
              >
                {responses[model.value] || `[Response for ${model.label} goes here]`}
              </Box>
              <Box display="flex" justifyContent="space-between" marginTop={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleRegenerate(model.value)}
                >
                  Regenerate
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePreview(model.value)}
                >
                  Preview
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Preview Section */}
      {previewModel && (
        <Paper
          elevation={3}
          sx={{
            padding: '20px',
            marginTop: '30px',
            backgroundColor: '#f4f4ff',
            borderRadius: '10px',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#444', marginBottom: '10px' }}
          >
            Preview: {selectedModels.find((model) => model.value === previewModel)?.label}
          </Typography>
          <Box
            sx={{
              height: '150px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              overflow: 'auto',
            }}
          >
            {responses[previewModel]}
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setPreviewModel(null)}
            sx={{ marginTop: '10px' }}
          >
            Close Preview
          </Button>
        </Paper>
      )}

      {/* Dialog for Regenerating Prompt */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Modify Your Prompt</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter modifications"
            variant="outlined"
            fullWidth
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveModifications} color="primary">
            Save Modifications
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
