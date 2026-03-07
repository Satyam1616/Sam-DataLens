import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          
          {/* Services */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 group relative cursor-pointer mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                S
              </div>
              <span className="font-bold text-2xl tracking-wide text-foreground">SAM</span>
            </div>
            <h3 className="text-foreground font-semibold mb-4 tracking-wide text-sm">Services</h3>
            <ul className="space-y-3">
              {['Agentic AI & machine learning', 'Data & analytics', 'Reporting & visualization', 'Application modernization', 'Cloud optimization', 'Security'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="font-semibold text-lg mb-6 text-foreground">Our Products</h3>
            <ul className="space-y-4">
              {['SAM AI Lens', 'EmbedFAST', 'CertyFAST', 'LoadFAST', 'MigrateFAST'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & About */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="text-foreground font-semibold mb-4 tracking-wide text-sm">Resources</h3>
            <ul className="space-y-3 mb-8">
              {['Case Studies', 'Consulting offers', 'Power BI custom visual guide', 'Best practice guides'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
            <h3 className="text-foreground font-semibold mb-4 tracking-wide text-sm">About us</h3>
            <ul className="space-y-3">
              {['Who we are', 'News', 'Careers', 'Social impact', 'Sustainability'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications & Microsoft Specs */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col sm:flex-row gap-8 lg:justify-end">
            <div>
              <h3 className="text-foreground font-semibold mb-4 tracking-wide text-sm">Our Microsoft Specializations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>AI Platform on Microsoft Azure</li>
                <li>Analytics on Microsoft Azure</li>
                <li>Build AI Apps on Microsoft Azure</li>
                <li>Data Warehouse Migration</li>
                <li>Kubernetes on Microsoft Azure</li>
                <li>Copilot / Cloud Security</li>
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4 tracking-wide text-sm">ISO Certifications</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ISO/IEC 27701:2019 - Privacy Repo</li>
                <li>ISO 27001:2022 - Security</li>
                <li>ISO/IEC 27018:2019 - Cloud</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 SAM. All rights reserved.</span>
            <span className="hidden md:inline text-muted-foreground/50">|</span>
            <span>2027 152nd Avenue NE Redmond, WA 98052</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
