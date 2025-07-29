import { useState, useEffect } from "react";
import { Brain, Timer, Kanban, Coffee, Sparkles, Zap, Rocket, Star, ListTodo, MoreHorizontal, Focus, Mail, Heart, Users, Shield, MoreHorizontalIcon, Video } from "lucide-react";

function LandingPage() {
  const [theme, setTheme] = useState("night");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Topluluğumuza Katılın bölümü - Daha sonra kullanılmak üzere tanımlandı
  const joinOurCom = (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-3xl border border-primary/20">
      <h3 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h3>
      <p className="text-lg text-base-content/70 mb-6 max-w-2xl mx-auto">
        Stay updated with the latest features, tips, and productivity insights.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="input input-bordered input-lg w-full max-w-xs" // Mobil için tam genişlik
        />
        <button className="btn btn-primary btn-lg hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
          Subscribe
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === "retro" ? "night" : "retro");
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 transition-all duration-1000 overflow-x-hidden relative" // `overflow-x-hidden` eklendi
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.05,
            top: mousePosition.y * 0.05,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Navigation/Header with glassmorphism */}
      <div className="navbar bg-base-100/80 backdrop-blur-xl shadow-2xl border-b border-primary/20 sticky top-0 z-50 px-4 sm:px-8">
        <div className="navbar-start">
          <div className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary animate-bounce" />
            Productivie
          </div>
        </div>
        <div className="navbar-end gap-2 sm:gap-3">
          <a
            href="https://buymeacoffee.com/dengobey"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm hover:scale-110 transition-transform duration-300 flex items-center gap-2 group"
          >
            <Coffee size={16} className="group-hover:animate-bounce" /> 
            <span className="hidden sm:inline">Support</span>
          </a>
          
          <a 
            href="/app" 
            className="btn btn-primary btn-md sm:btn-lg hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-r from-primary to-secondary border-0 group"
          >
            <Rocket className="w-5 h-5 group-hover:animate-bounce" />
            <span className="hidden sm:inline">Launch App</span>
            <span className="sm:hidden">Launch</span> {/* Mobil için daha kısa metin */}
          </a>
        </div>
      </div>

      {/* Hero Section with dynamic animations */}
      <div className="hero min-h-screen relative px-4">
        <div className="hero-content flex-col lg:flex-row gap-12 max-w-7xl text-center lg:text-left">
          {/* Hero Image with advanced effects */}
          <div className={`relative transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl transform rotate-6" />
            <div className="relative bg-gradient-to-br from-base-200 to-base-300 p-4 sm:p-8 rounded-2xl shadow-2xl border border-primary/20">
              <img
                src="hero-sec-photo.webp"
                className="w-full max-w-sm sm:max-w-md rounded-xl shadow-xl hover:scale-105 transition-transform duration-500" // `w-full` ve `max-w-sm` eklendi
                alt="Productivity workspace"
              />
              <Timer className="absolute -top-4 -left-4 w-8 h-8 text-primary animate-pulse bg-base-100 p-1 rounded-full shadow-lg" />
              <Brain className="absolute -top-4 -right-4 w-8 h-8 text-secondary animate-pulse bg-base-100 p-1 rounded-full shadow-lg" />
              <Kanban className="absolute -bottom-4 -left-4 w-8 h-8 text-accent animate-pulse bg-base-100 p-1 rounded-full shadow-lg" />
              <Zap className="absolute -bottom-4 -right-4 w-8 h-8 text-warning animate-pulse bg-base-100 p-1 rounded-full shadow-lg" />
            </div>
          </div>

          {/* Hero Text with staggered animations */}
          <div className={`max-w-2xl transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="mb-6">
              <div className="badge badge-primary badge-lg mb-4 animate-pulse">
                ✨ 100% Free Forever
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight"> {/* Duyarlı metin boyutu */}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                  Build Your
                </span>
                <br />
                <span className="text-base-content relative">
                  Dream Workspace
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl -z-10 animate-pulse" />
                </span>
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl lg:text-2xl py-8 leading-relaxed text-base-content/80"> {/* Duyarlı metin boyutu */}
              🚀 Create your ultimate productivity dashboard with 
              <span className="font-bold text-primary"> drag-and-drop simplicity</span>. 
              Combine Pomodoro timers, Kanban boards, mind maps and more into 
              <span className="font-bold text-secondary"> your perfect workflow</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"> {/* Mobil için hizalama */}
              <a 
                href="/app" 
                className="btn btn-primary btn-lg text-lg hover:scale-110 transition-all duration-300 shadow-2xl bg-gradient-to-r from-primary to-secondary border-0 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                Start Building Now
              </a>
              <a
                href="https://buymeacoffee.com/dengobey"
                className="btn btn-outline btn-lg text-lg hover:scale-110 transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Coffee className="w-6 h-6 group-hover:animate-bounce" />
                Support the Project
              </a>

              <a
                href="https://www.youtube.com/watch?v=MjUNvBgMLHU"
                className="btn btn-outline btn-lg text-lg hover:scale-110 transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="w-6 h-6 group-hover:animate-bounce" />
                Watch The Demo
              </a>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start"> {/* Mobil için hizalama */}
              {['No Sign-up', 'Drag & Drop', 'Save Layouts', 'Flexible Experience'].map((feature, i) => (
                <div 
                  key={feature}
                  className="badge badge-outline badge-lg transition-all duration-500 hover:scale-110 hover:shadow-lg"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  ⭐ {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-base-100 to-base-200 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"> {/* Duyarlı metin boyutu */}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Supercharge
              </span>
              <br />
              Your Productivity
            </h2>
            <p className="text-lg sm:text-xl text-base-content/70 max-w-3xl mx-auto">
              Powerful tools, infinite possibilities. Create your perfect workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* `lg` için 3 sütun eklendi */}
            {[
              { icon: Timer, title: "Pomodoro Timer", description: "Improve productivity with simple Pomodoro sessions.", color: "from-red-500 to-pink-500", bgColor: "bg-red-500/10" },
              { icon: Kanban, title: "Kanban Board", description: "Track your workflow with clean, customizable Kanban-style boards.", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
              { icon: Brain, title: "Mind Map", description: "Map out your thoughts on an infinite canvas — export and share with ease.", color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-500/10" },
              { icon: ListTodo, title: "To-Do List", description: "Plan, prioritize, and progress — all in one streamlined task list.", color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
              { icon: Focus, title: "Daily Focus", description: "Set your daily motivation and track your progress toward goals", color: "from-orange-500 to-yellow-500", bgColor: "bg-orange-500/10" },
              { icon: MoreHorizontalIcon, title: "More Tools coming soon.", description: "Don't forget to tell us what you need", color: "from-gray-500 to-gray-600", bgColor: "bg-gray-500/10" }
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-base-200 to-base-300 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-primary/20 hover:border-primary/40 ${feature.bgColor}`}
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-base-content/70 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore Feature</span>
                    <Zap className="w-4 h-4 ml-2 animate-bounce" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-base-200 to-base-100 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"> {/* Duyarlı metin boyutu */}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About
              </span>
              <br />
              Productivie
            </h2>
            <p className="text-lg sm:text-xl text-base-content/70 max-w-3xl mx-auto">
              Born from the need for a truly customizable productivity experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-base-300 to-base-200 p-8 rounded-3xl shadow-xl border border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-lg text-base-content/80 leading-relaxed">
                  We believe productivity tools should adapt to you, not the other way around. 
                  That's why we created a platform where you can build your perfect workspace 
                  with drag-and-drop simplicity, combining all the tools you need in one place.
                </p>
              </div>

              <div className="bg-gradient-to-br from-base-300 to-base-200 p-8 rounded-3xl shadow-xl border border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Community Driven</h3>
                </div>
                <p className="text-lg text-base-content/80 leading-relaxed">
                  Every feature we build is inspired by our amazing community of users. 
                  From students to professionals, freelancers to teams - we listen to your 
                  feedback and continuously improve the platform.
                </p>
              </div>
            </div>

            <div className="relative mt-12 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl transform rotate-3" />
              <div className="relative bg-gradient-to-br from-base-300 to-base-200 p-8 sm:p-12 rounded-3xl shadow-2xl border border-primary/20">
                <div className="text-center space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-primary mb-2">1000+</div>
                      <div className="text-sm text-base-content/70">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-secondary mb-2">6</div>
                      <div className="text-sm text-base-content/70">Productivity Tools</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-accent mb-2">100%</div>
                      <div className="text-sm text-base-content/70">Free Forever</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-warning mb-2">24/7</div>
                      <div className="text-sm text-base-content/70">Available</div>
                    </div>
                  </div>
                  <div className="pt-6">
                    <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-lg font-semibold text-base-content">
                      Privacy First • Ad-Free
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-base-100 to-base-200 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"> {/* Duyarlı metin boyutu */}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get In Touch
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto">
              Have questions, suggestions, or just want to say hello? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-base-300 to-base-200 p-8 rounded-3xl shadow-xl border border-primary/20 group hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Email Us</h3>
              <p className="text-base-content/70 mb-6">
                For support, feature requests, or general inquiries
              </p>
              <a 
                href="mailto:productivie1@gmail.com" 
                className="btn btn-primary btn-lg hover:scale-105 transition-transform duration-300"
              >
                productivie1@gmail.com
              </a>
            </div>

            <div className="bg-gradient-to-br from-base-300 to-base-200 p-8 rounded-3xl shadow-xl border border-primary/20 group hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Support Us</h3>
              <p className="text-base-content/70 mb-6">
                Help us keep the platform free and continuously improving
              </p>
              <a 
                href="https://buymeacoffee.com/dengobey"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg hover:scale-105 transition-transform duration-300"
              >
                Buy Me a Coffee
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl animate-pulse"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                left: `${i * 25}%`,
                top: `${i * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8"> {/* Duyarlı metin boyutu */}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ready to Transform
            </span>
            <br />
            Your Productivity?
          </h2>
          
          <p className="text-xl sm:text-2xl mb-12 text-base-content/80">
            Join thousands of users who've revolutionized their workflow
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="/app" 
              className="btn btn-primary btn-lg text-xl px-8 sm:px-12 py-4 hover:scale-110 transition-all duration-300 shadow-2xl bg-gradient-to-r from-primary to-secondary border-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Star className="w-6 h-6 group-hover:animate-spin" />
              Launch Your Workspace
            </a>
            
            <div className="text-sm text-base-content/60">
              ✨ No account required • 🚀 Start in seconds
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center bg-gradient-to-t from-base-300 to-base-200 text-base-content p-10 sm:p-16 border-t border-primary/20">
        <aside className="max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <p className="font-black text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Productivie
            </p>
          </div>
          <p className="text-lg leading-relaxed text-base-content/70">
            The ultimate customizable productivity dashboard. 
            <br />
            <span className="font-semibold text-primary"> 100% Free.</span> 
            <span className="font-semibold text-secondary"> Powerful.</span>
          </p>
        </aside>
        
        <nav className="grid grid-flow-col gap-6 sm:gap-8 text-lg">
          <a href="/privacy.html" className="link link-hover hover:text-primary transition-colors">Privacy</a>
          <a href="/terms.html" className="link link-hover hover:text-secondary transition-colors">Terms</a>
          <a 
            href="https://buymeacoffee.com/dengobey"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover hover:text-warning transition-colors flex items-center gap-2"
          >
            <Coffee size={16} />
            Support
          </a>
        </nav>
        
        <div className="mt-8 text-base-content/50">
          Made with ❤️ for productivity enthusiasts worldwide
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;