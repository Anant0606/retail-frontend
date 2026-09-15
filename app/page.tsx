// Connection state hook with auto-fallback after 3 seconds
const [isConnected, setIsConnected] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(true);

useEffect(() => {
  // Try connecting, but DO NOT block the UI
  const timer = setTimeout(() => {
    setIsLoading(false); // 2.5 seconds ke baad dashboard automatically open ho jayega
  }, 2500);

  return () => clearTimeout(timer);
}, []);

// Loading Screen ko aise replace karein jo dismiss ho sake:
if (isLoading) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-lg font-bold text-slate-800">Connecting to Edge Gateway...</h2>
      <p className="text-xs text-slate-500 mt-1 mb-5">Handshaking with Vision Terminal</p>
      
      {/* Emergency Bypass Button */}
      <button 
        onClick={() => setIsLoading(false)}
        className="text-xs bg-slate-900 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-800"
      >
        Skip & Launch Dashboard
      </button>
    </div>
  );
}
