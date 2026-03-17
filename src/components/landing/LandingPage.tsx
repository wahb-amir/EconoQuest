'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Globe, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Users,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[160px] animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-headline tracking-tighter">ECONOQUEST</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#sim" className="hover:text-accent transition-colors">Simulation</a>
            <a href="#leaderboard" className="hover:text-accent transition-colors">Rankings</a>
            <Button onClick={onStart} variant="outline" className="border-accent/20 hover:bg-accent/10 text-accent">
              Enter Platform
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary rounded-full animate-bounce">
              Now in V2.0 Beta — Advanced Trade Engine
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold font-headline leading-[0.9] tracking-tighter">
              The World's Most <span className="text-gradient">Advanced</span> Economic Sandbox.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Design your nation, manipulate global trade, and steer your economy through real-world crises. 
              EconoQuest is the definitive simulator for strategic governance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-16 px-10 bg-primary hover:bg-primary/90 text-white text-xl font-headline rounded-2xl neon-glow transition-all hover:scale-105"
            >
              Start Your Mandate <Play className="ml-3 w-5 h-5 fill-current" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="h-16 px-10 text-xl font-headline rounded-2xl hover:bg-white/5 border border-white/10"
            >
              Watch Trailer <Zap className="ml-3 w-5 h-5 text-accent" />
            </Button>
          </motion.div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
            <FeatureItem 
              icon={<TrendingUp className="text-accent" />}
              title="Real-Time Macro Model"
              description="Simulate inflation, GDP, and unemployment with a proprietary linked-variable engine."
            />
            <FeatureItem 
              icon={<Globe className="text-primary" />}
              title="Global Trade Network"
              description="Manage tariffs, currency strength, and foreign lending to dominate international markets."
            />
            <FeatureItem 
              icon={<Cpu className="text-purple-400" />}
              title="R&D & Innovation"
              description="Invest in technological progress to decouple your economy from traditional commodity cycles."
            />
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-white/2 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem value="1.2M+" label="Simulations Executed" />
            <StatItem value="190+" label="Nations Built" />
            <StatItem value="98.4%" label="Model Accuracy" />
            <StatItem value="24/7" label="Real-time Events" />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                Designed for Educators, <br />
                <span className="text-accent">Played by Strategists.</span>
              </h2>
              <div className="space-y-6">
                <CheckItem title="Enterprise-Grade Data Models" description="Our engine accounts for over 50 interconnected economic variables." />
                <CheckItem title="Adaptive AI Advisory" description="Get socratic hints from our neural-trained economic advisor." />
                <CheckItem title="Global Leaderboards" description="Compete for the title of Grand Architect of the Global Economy." />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative glass-card p-8 rounded-3xl border-primary/20 transform rotate-2">
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(i => <Zap key={i} className="w-5 h-5 text-accent fill-accent" />)}
                </div>
                <p className="text-lg italic font-light leading-relaxed text-muted-foreground mb-6">
                  "EconoQuest has completely changed how we teach macroeconomic theory. It's not just a game; it's a high-fidelity laboratory for human governance."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20" />
                  <div>
                    <p className="font-bold">Dr. Elena Volkov</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">Head of Macro at Global Inst.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 border-t border-white/5 bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="text-primary w-6 h-6" />
              <span className="text-xl font-bold font-headline tracking-tighter">ECONOQUEST</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering the next generation of global leaders through deep simulation.
            </p>
          </div>
          <div className="flex gap-12">
            <FooterList title="Platform" items={['Dashboard', 'Leaderboard', 'API Docs', 'Simulation Engine']} />
            <FooterList title="Company" items={['About Us', 'Careers', 'Contact', 'Terms']} />
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-10 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-2 group">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-headline mb-4">{title}</h3>
    <p className="text-muted-foreground font-light leading-relaxed">{description}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="space-y-2">
    <div className="text-4xl md:text-5xl font-bold font-headline text-accent">{value}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">{label}</div>
  </div>
);

const CheckItem = ({ title, description }: { title: string, description: string }) => (
  <div className="flex gap-4">
    <div className="mt-1">
      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
        <ShieldCheck className="w-4 h-4 text-accent" />
      </div>
    </div>
    <div>
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-sm text-muted-foreground font-light leading-snug">{description}</p>
    </div>
  </div>
);

const FooterList = ({ title, items }: { title: string, items: string[] }) => (
  <div className="space-y-4">
    <h4 className="text-xs font-bold uppercase tracking-widest text-accent">{title}</h4>
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item}>
          <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">{item}</a>
        </li>
      ))}
    </ul>
  </div>
);