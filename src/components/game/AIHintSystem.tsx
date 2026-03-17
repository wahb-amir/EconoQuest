'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIHintSystemProps {
  metrics: any;
  quarter: number;
}

const SAMPLE_HINTS = [
  "Have you considered the impact of debt on your long-term GDP growth? Borrowing isn't free.",
  "Inflation is the silent thief. Keep an eye on that Interest Rate lever.",
  "Public mood is low. Perhaps a splash of government spending would cheer them up?",
  "Printing money is a dangerous game. Use it only in extreme emergencies!",
  "A balanced budget is a myth, but a sustainable one is a masterpiece.",
  "Why are taxes so high? Business owners are looking for the exit sign.",
  "GDP growth is looking healthy! Don't get complacent, cycles always turn."
];

export const AIHintSystem: React.FC<AIHintSystemProps> = ({ metrics, quarter }) => {
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const requestHint = () => {
    const randomHint = SAMPLE_HINTS[Math.floor(Math.random() * SAMPLE_HINTS.length)];
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: randomHint }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    if (quarter === 1 && messages.length === 0) {
      setMessages([{ role: 'ai', text: "Welcome, Minister! I'm your economic advisor. How can I help you build your empire today?" }]);
    }
  }, [quarter, messages.length]);

  return (
    <Card className="glass-morphism border-none h-[400px] flex flex-col">
      <CardHeader className="pb-2 border-b border-white/10">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Economic Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    msg.role === 'ai' ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'ai' ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                  )}>
                    {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                    msg.role === 'ai' ? "bg-accent/10 text-accent rounded-tl-none" : "bg-card text-card-foreground rounded-tr-none"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <div className="flex gap-2 mr-auto">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-accent/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce delay-75" />
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-white/10 bg-black/10">
          <Button 
            onClick={requestHint} 
            disabled={isTyping}
            className="w-full bg-primary hover:bg-primary/90 text-white accent-glow font-headline h-10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask for Advice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(' ');
}
