const Footer = () => {
    return (
      <footer className="bg-gray-950 border-t border-gray-800">
  
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold">
                  <span className="text-white">Beat The</span>
                  <span className="text-yellow-500">Majority</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                The premier destination for strategic players who know when to go against the crowd.
              </p>
              <div className="mt-4 flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <span className="sr-only">Telegram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
              </div>
            </div>
  
            {/* Quick Links */}
            <div className="md:col-span-1">
              <h3 className="text-yellow-500 font-bold uppercase mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">How to Play</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Leaderboard</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">VIP Access</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Game Statistics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Tournaments</a></li>
              </ul>
            </div>
  
            {/* Support */}
            <div className="md:col-span-1">
              <h3 className="text-yellow-500 font-bold uppercase mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors text-sm">Privacy Policy</a></li>
              </ul>
            </div>
  
            {/* Newsletter */}
            <div className="md:col-span-1">
              <h3 className="text-yellow-500 font-bold uppercase mb-4">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">Subscribe to receive exclusive offers and updates about upcoming tournaments.</p>
              <form className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none border border-gray-700"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-r-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-500 text-xs italic">We respect your privacy and will never share your information.</p>
              </form>
            </div>
          </div>
  
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Beat The Majority. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <div className="inline-block px-4 py-1 bg-black rounded-full border border-yellow-600">
                  <span className="text-yellow-500 text-xs font-bold">PROVABLY FAIR GAMEPLAY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;