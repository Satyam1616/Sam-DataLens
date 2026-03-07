import Image from "next/image";

export default function Features() {
  const features = [
    {
      title: "Chat with structured data",
      description: "SAM AI Lens allows users to interact with enterprise datasets using natural language. No need for SQL or DAX, just ask questions and get instant answers.",
      image: "Power BI Embed Chat",
      imgColor: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "User guidance",
      description: "Delivers intelligent question suggestions and personalized investigative recommendations to help new users effectively explore and understand their data from the very beginning.",
      image: "Power BI Embed Guidance",
      imgColor: "from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Semantic relevance",
      description: "Understands the true intent behind user questions by analyzing metadata and context, ensuring accurate and meaningful responses.",
      image: "Power BI Embed Semantic",
      imgColor: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Automated visual generation",
      description: "Automatically generates relevant charts and visuals from user queries. This eliminates manual effort and helps users quickly interpret the data visually.",
      image: "Power BI Embed Visuals",
      imgColor: "from-orange-500/20 to-red-500/20",
    },
    {
      title: "Insight generation",
      description: "Beyond raw data, the system generates narratives, titles, and summaries to present insights in a business-friendly format for decision-making and provides recommendations.",
      image: "Power BI Embed Insights",
      imgColor: "from-indigo-500/20 to-blue-500/20",
    },
    {
      title: "Metadata agent & column pruning",
      description: "SAM AI Lens transforms raw data into an intelligent, indexed schema—powering faster, more accurate queries with minimal effort.",
      image: "Power BI Embed Schema",
      imgColor: "from-fuchsia-500/20 to-purple-500/20",
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 animate-on-scroll">
          <div className="inline-block px-4 py-1.5 rounded-full glass border border-primary/30 text-primary text-sm font-semibold tracking-wider mb-4 uppercase bg-muted/30">
            Key Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Discover how SAM AI Lens turns data into actionable insights
          </h2>
        </div>

        <div className="space-y-20 md:space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 1;
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 animate-on-scroll`}>
                
                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm font-medium text-primary hover:text-foreground transition-colors cursor-pointer w-max lg:mx-0 mx-auto">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                {/* Conceptual Image / Power BI Mock */}
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    
                    <div className="relative aspect-[16/10] rounded-2xl glass border border-border overflow-hidden flex flex-col group-hover:border-primary/50 transition-colors duration-500 bg-card">
                      
                      {/* Dashboard Header */}
                      <div className="h-10 bg-muted/80 border-b border-border flex items-center px-4 justify-between">
                         <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                         </div>
                         <div className="text-xs text-muted-foreground font-medium">Power BI Embed</div>
                      </div>

                      {/* Dashboard Body Placeholder */}
                      <div className={`flex-1 bg-gradient-to-br ${feature.imgColor} flex items-center justify-center p-8 relative overflow-hidden`}>
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                         
                         <div className="glass px-6 py-4 rounded-xl border-border shadow-2xl backdrop-blur-md relative z-10 flex flex-col items-center gap-3 bg-card/80">
                           <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                             <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                           </div>
                           <span className="text-foreground font-medium text-sm tracking-wide text-center">
                             {feature.image} Simulation
                           </span>
                         </div>
                      </div>
                      
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
