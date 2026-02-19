import { useNavigate } from 'react-router-dom';
import { Shield, Zap, TrendingUp, Globe, ChevronRight, Activity, Lock, BarChart3, AlertTriangle } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const stats = [
    { value: '$45M+', label: 'Total Payouts', icon: TrendingUp },
    { value: '99.9%', label: 'Uptime SLA', icon: Activity },
    { value: '12ms', label: 'Response Time', icon: Zap },
    { value: '4,200+', label: 'Active Affiliates', icon: Globe },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Adaptive Ratio Control',
      description: 'Dynamically calibrate conversion rates in real-time. Smart thresholds auto-adjust to keep your CR% within optimal performance bands.',
      color: 'indigo',
    },
    {
      icon: Shield,
      title: 'Fraud Guard',
      description: 'Military-grade click deduplication with daily cap enforcement. Every request is fingerprinted and validated before processing.',
      color: 'pink',
    },
    {
      icon: Lock,
      title: 'Secure Tracking Engine',
      description: 'End-to-end encrypted redirect chains with Firestore-backed analytics. Zero latency, zero compromise.',
      color: 'cyan',
    },
    {
      icon: AlertTriangle,
      title: 'Data Recovery Wizard',
      description: 'Inject or restore click/conversion snapshots instantly. Never lose mission-critical performance data again.',
      color: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Animated blobs */}
      <div className="blob blob-indigo w-96 h-96 top-0 left-1/4" />
      <div className="blob blob-pink w-80 h-80 top-20 right-1/4" />
      <div className="blob blob-cyan w-64 h-64 bottom-40 left-1/3" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Pyronex Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-outfit font-bold text-xl gradient-text">Pyronex</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-solid-indigo"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 glass-panel-light rounded-full px-4 py-1.5 mb-8 border border-neon-indigo/20">
          <span className="pulse-dot" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neon-indigo">Live Intelligence Platform</span>
        </div>

        <h1 className="font-outfit font-black text-6xl md:text-8xl leading-none mb-6 animate-fade-in-up">
          Engineered for{' '}
          <span className="gradient-text">Dominance</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          The most advanced affiliate intelligence system. Real-time tracking, adaptive conversion control, and military-grade fraud protection — all in one platform.
        </p>

        <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-solid-indigo text-base px-8 py-3"
          >
            Access Portal
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-neon-indigo text-base px-8 py-3"
          >
            Our Ecosystem
          </button>
        </div>
      </section>

      {/* Stats grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-card text-center animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-neon-indigo" />
              <div className="font-outfit font-black text-3xl gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="ecosystem" className="relative z-10 max-w-6xl mx-auto px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-4">
            The <span className="gradient-text">Pyronex Ecosystem</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every component is engineered for maximum performance and precision control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className={`glass-panel rounded-xl p-6 border animate-fade-in-up hover:border-neon-indigo/40 transition-all duration-300 ${feat.color === 'indigo' ? 'neon-border-indigo' : feat.color === 'pink' ? 'neon-border-pink' : 'border-neon-cyan/20'
                }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color === 'indigo' ? 'bg-neon-indigo/10' : feat.color === 'pink' ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'
                }`}>
                <feat.icon className={`w-6 h-6 ${feat.color === 'indigo' ? 'text-neon-indigo' : feat.color === 'pink' ? 'text-neon-pink' : 'text-neon-cyan'
                  }`} />
              </div>
              <h3 className="font-outfit font-bold text-xl mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pyronex Logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-outfit font-bold text-sm gradient-text">Pyronex</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <button onClick={() => navigate('/login?role=admin')} className="hover:text-neon-indigo cursor-pointer transition-colors">
              Admin Access
            </button>
            <span>© 2025 Pyronex</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
