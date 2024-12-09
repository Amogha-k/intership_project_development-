
This is a React + TypeScript application that allows users to compare multiple language models (e.g., GPT-4, GPT-3.5) side-by-side by selecting them from a dropdown and dynamically displaying their responses.

Features:
Multi-Model Selection: Select multiple language models from a dropdown to compare their outputs.
Dynamic Response Windows: Each model selected will have a corresponding response window displaying its output.
API Calls with React Query: Fetch responses using a custom hook (useFetchLLMResponse) and React Query's useMutation for handling API requests.
Preview Functionality: Preview responses from any model in a dedicated preview panel with the option to return to the comparison view.
Real-Time UI Updates: The UI dynamically adds or removes model response windows as models are selected or deselected.

API Integration:
This project simulates fetching responses from different LLMs. The API call is managed through the useFetchLLMResponse hook, which dynamically fetches data based on user selections.
