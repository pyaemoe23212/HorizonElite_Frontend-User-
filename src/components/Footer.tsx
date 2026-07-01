import React from 'react';

function Footer(): React.JSX.Element {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-serif mb-1">
            Horizon Elite Airways
          </p>
          <p>&copy; {new Date().getFullYear()} Horizon Elite. All premium rights reserved.</p>
        </div>
        
        <div className="flex space-x-6 text-slate-500">
          <a href="#" className="hover:text-amber-400 transition-colors">Terms of Carriage</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;