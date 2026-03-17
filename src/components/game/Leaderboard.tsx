'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Medal, User } from 'lucide-react';
import { MOCK_LEADERBOARD } from '@/lib/simulation-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const Leaderboard: React.FC = () => {
  return (
    <Card className="glass-morphism border-none h-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Hall of Fame
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-4 pb-4 space-y-2">
            {MOCK_LEADERBOARD.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-headline font-bold text-muted-foreground">
                    {index === 0 && <Medal className="w-5 h-5 text-yellow-500 mx-auto" />}
                    {index === 1 && <Medal className="w-5 h-5 text-slate-400 mx-auto" />}
                    {index === 2 && <Medal className="w-5 h-5 text-amber-600 mx-auto" />}
                    {index > 2 && index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-headline">{user.name}</p>
                    <Badge variant="outline" className="text-[10px] py-0 border-white/10 text-muted-foreground">
                      {user.badge}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-headline text-accent">{user.score}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
