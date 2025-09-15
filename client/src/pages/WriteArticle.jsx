import React, { useState } from "react";
import { PenTool, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const WriteArticle = () => {
  const articleLengths = [
    { label: "Short (500-800 words)", value: "short" },
    { label: "Medium (800-1200 words)", value: "medium" },
    { label: "Long (1200+ words)", value: "long" }
  ];

  const [selectedLength, setSelectedLength] = useState(articleLengths[0]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    setError(null);
    
    try {
      setLoading(true);
      setContent("");
      toast.loading('Generating article...', { id: 'article-generation' });
      
      if (!topic || !topic.trim()) {
        throw new Error('Please enter a topic');
      }
      
      const prompt = `Write a ${selectedLength.value} article about: ${topic}. Make it engaging, informative, and well-structured with clear sections and professional tone.`;

      console.log('Sending request to generate article...');

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication failed. Please try logging in again.');
      }

      const response = await axios.post(
        '/api/ai/generate-article',
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000
        }
      );

      const data = response.data;
      console.log('Response received:', data);
      
      if (data && data.success && data.content) {
        if (typeof data.content === 'string' && data.content.trim().length > 0) {
          setContent(data.content.trim());
          toast.success('Article generated successfully!', { id: 'article-generation' });
        } else {
          throw new Error('Generated content is empty');
        }
      } else {
        const errorMsg = data?.message || 'Failed to generate article';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Article generation error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to generate article';
      
      // Check if it's an overload error and provide helpful message
      let userFriendlyMessage = errorMessage;
      let isRetryable = false;
      
      if (errorMessage.includes('overloaded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        userFriendlyMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
        isRetryable = true;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        userFriendlyMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        isRetryable = true;
      } else if (errorMessage.includes('quota')) {
        userFriendlyMessage = 'Service quota exceeded. Please try again later.';
        isRetryable = true;
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        userFriendlyMessage = 'Request timed out. The service may be busy, please try again.';
        isRetryable = true;
      } else if (errorMessage.includes('busy') || errorMessage.includes('unavailable')) {
        userFriendlyMessage = 'The AI service is temporarily unavailable. Please try again.';
        isRetryable = true;
      }
      
      setError(userFriendlyMessage);
      setContent("");
      
      // Show different toast messages based on error type
      if (isRetryable) {
        toast.error(`${userFriendlyMessage}`, { 
          id: 'article-generation',
          duration: 6000,
          icon: '⏳'
        });
      } else {
        toast.error(`Error: ${userFriendlyMessage}`, { 
          id: 'article-generation',
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700">
      {/* Left Column - Article Configuration */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <PenTool className="w-5 sm:w-6 text-[#3B82F6]" />
          <h1 className="text-lg sm:text-xl font-semibold">Article Configuration</h1>
        </div>

        <p className="mt-4 sm:mt-6 text-sm font-medium">Article Topic</p>
        <input
          onChange={(e) => setTopic(e.target.value)}
          value={topic}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {articleLengths.map((length) => (
            <span
              key={length.value}
              onClick={() => setSelectedLength(length)}
              className={`text-xs px-3 sm:px-4 py-2 border rounded-full cursor-pointer transition-all duration-200 ${
                selectedLength.value === length.value
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "text-gray-500 border-gray-300 hover:border-blue-200"
              }`}
            >
              {length.label}
            </span>
          ))}
        </div>

        <button
          disabled={loading || !topic.trim()}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white px-4 py-3 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#2563EB] hover:to-[#1E40AF] transition-all duration-200"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <PenTool className="w-5" />
          )}
          Generate article
        </button>
      </form>

      {/* Right Column - Generated Article */}
      <div className="w-full lg:max-w-2xl lg:flex-1 p-4 bg-white rounded-lg border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#3B82F6]" />
          <h1 className="text-lg sm:text-xl font-semibold">Generated article</h1>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center h-[500px]">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-center">Generating your article...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex justify-center items-center h-[500px]">
            <div className="text-sm flex flex-col items-center gap-5 text-red-400">
              <FileText className="w-16 h-16" />
              <p className="text-center text-red-600 max-w-md">Error: {error}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (topic.trim()) {
                      // Add a small delay before retry for overload cases
                      if (error && (error.includes('overloaded') || error.includes('rate limit') || error.includes('busy'))) {
                        toast.loading('Waiting a moment before retry...', { id: 'retry-delay' });
                        setTimeout(() => {
                          toast.dismiss('retry-delay');
                          onSubmitHandler({ preventDefault: () => {} });
                        }, 2000);
                      } else {
                        onSubmitHandler({ preventDefault: () => {} });
                      }
                    } else {
                      setError(null);
                      setContent("");
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {topic.trim() ? '🔄 Retry Generation' : 'Dismiss'}
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setContent("");
                    setTopic("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        ) : !content ? (
          <div className="flex-1 flex justify-center items-center h-[500px]">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-16 h-16" />
              <p className="text-center">Enter a topic and click "Generate article" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-gray-50 rounded-lg max-h-[500px] overflow-y-auto">
                <div className="reset-tw">
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(content);
                    toast.success('Article copied to clipboard!');
                  } catch (clipboardError) {
                    console.error('Clipboard error:', clipboardError);
                    toast.error('Failed to copy to clipboard');
                  }
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors"
              >
                Copy Article
              </button>
              <button
                onClick={() => {
                  setContent("");
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;