import React, { useState } from 'react';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to toggle chatbot visibility
  const [isMaximized, setIsMaximized] = useState(false); // State to toggle maximize/minimize

  // Function to query Hugging Face API
  const queryAPI = async (data) => {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B',
        {
          headers: {
            Authorization: 'Bearer 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',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Function to handle sending messages
  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, fromUser: true }]);
      setLoading(true);
      setError(null);

      try {
        const data = { inputs: input };
        const response = await queryAPI(data);

        if (response && response[0] && response[0].generated_text) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: response[0].generated_text, fromUser: false },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Sorry, there was an issue with the response.', fromUser: false },
          ]);
        }
      } catch (error) {
        setError('Error fetching the response. Please try again.');
      }

      setLoading(false);
      setInput('');
    }
  };

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);
  const toggleMaximize = () => setIsMaximized(!isMaximized);

  return (
    <div className="chatbot-container">
      {/* Chatbot Toggle Button */}
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isChatbotOpen ? 'Minimize' : 'Chat'}
      </button>

      {/* Chatbot Window */}
      {isChatbotOpen && (
        <div className={`chatbot-window ${isMaximized ? 'maximized' : ''}`}>
          <div className="chatbot-header">
            <h3>Chatbot</h3>
            <button onClick={toggleMaximize}>
              {isMaximized ? 'Restore' : 'Maximize'}
            </button>
            <button onClick={toggleChatbot}>Close</button>
          </div>
          <div className="chatbot-body">
            <div className="chat-display">
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.fromUser ? 'user-message' : 'bot-message'}>
                  {msg.text}
                </div>
              ))}
              {loading && <div className="loading-spinner">Loading...</div>}
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleSend} disabled={loading}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
