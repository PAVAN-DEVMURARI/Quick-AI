import React from "react";
import { Hash, Sparkle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const BlogTitle = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "LifeStyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate the blog title for the keyword : ${input} in the category ${selectedCategory}`;

      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      if (data.success && data.titles) {
        setTitles(data.titles);
        setSelectedTitle(data.titles[0] || '');
        setContent(data.titles[0] || '');
      } else {
        toast.error(data.message || 'No titles returned');
        setTitles([]);
        setSelectedTitle('');
        setContent('');
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        action=""
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkle className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold"> AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Keyword</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is... "
          required
        />

        <p className="mt-4 text-sm font-medium">Categories</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-500 border-gray-300"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <br />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5" />
          )}
          Generate Titles
        </button>
      </form>

      {/* right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>

        {titles.length === 0 ? (
          <div className="flex-1 flex justify-center items-center h-[331px]">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Hash className="w-9 h-9" />
              <p>Enter a topic and click "Generate Titles" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex-1 overflow-y-auto">
            <div className="text-xs text-gray-500 mb-3">
              Choose your favorite title from {titles.length} options:
            </div>
            
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedTitle(title);
                    setContent(title);
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTitle === title
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-400 mt-1">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{title}</p>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {title.length} characters
                      </p> */}
                    </div>
                    {selectedTitle === title && (
                      <Hash className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedTitle && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Selected Title:</p>
                <p className="text-sm font-medium text-gray-700">{selectedTitle}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitle;
