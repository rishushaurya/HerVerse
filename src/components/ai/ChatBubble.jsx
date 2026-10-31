import React from 'react';
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { Heart } from "lucide-react";

export default function ChatBubble({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
          style={{ background: 'var(--app-accent-gradient)' }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${isUser
            ? 'rounded-br-md text-white'
            : 'rounded-bl-md border'
          }`}
        style={isUser
          ? { background: 'var(--app-accent-gradient)' }
          : {
            background: 'var(--app-card-bg)',
            borderColor: 'var(--app-card-border)',
            color: 'var(--app-text-primary)',
            boxShadow: 'var(--app-shadow)'
          }
        }
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
            components={{
              p: ({ children }) => <p className="my-1" style={{ color: 'var(--app-text-primary)' }}>{children}</p>,
              ul: ({ children }) => <ul className="my-1 pl-4 list-disc">{children}</ul>,
              li: ({ children }) => <li className="my-0.5" style={{ color: 'var(--app-text-primary)' }}>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

        {message.timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : ''}`} style={!isUser ? { color: 'var(--app-text-muted)' } : undefined}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}