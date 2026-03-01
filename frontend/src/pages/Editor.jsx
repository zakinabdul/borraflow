import React, { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from "../api/axios"
import ToolBar from '../components/ToolBar'
import ChatInterface from '../components/ChatInterface'
import DocumentContent from '../components/DocumentContent'

function EditorPage() {

  const location = useLocation();
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);


  const sendMessage = async (message) => {
    setLoading(true);

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) =>  [...prev, userMessage]);
    console.log(userMessage)
    

    const documentation = "report";

    try {
      const response = await api.post("/v2/agent/format_agent", {
        raw_text: message,
        user_request: documentation,
      });
      console.log(response);
      const reply = response.data.code;
      console.log(reply);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      console.log(assistantMessage)
      

      setAnswer(reply);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;

    if (!firstMessage || hasInitialized.current) return;

    hasInitialized.current = true;
    sendMessage(firstMessage);
  }, [location.state?.firstMessage]);


  return (
    <>
        <div className='flex h-full bg-gray-100 min-w-full'>
            <ChatInterface 
              messages={messages}
              loading={loading}
              onSend={sendMessage}
            />

            <div className="w-px border-r border-gray-800/90"></div>

            <div className='flex-1 bg-white overflow-y-auto'>
    
                <ToolBar />

                <DocumentContent 
                  answer={answer}
                  loading={loading}
                />

                
            </div>
        </div>
    </>
  )
}

export default EditorPage