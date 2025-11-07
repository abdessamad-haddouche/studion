import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function NewsLetter() {
  const [email, setEmail] = useState("");

  const handleNewsLetterSend = () => {
    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Enter a valid email");
      setEmail('')
      return;
    }
    toast.success("Welcome to the community!");
    
    //sending to the backend point
  };

  return (
    <div>
      
      <Toaster position="top-right" /> 

      <span className="text-sm text-slate-400">Stay updated:</span>
      <div className="flex">
        <input
            value={email}
          type="email"
          placeholder="Enter your email"
          className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-l-lg text-sm focus:outline-none focus:border-blue-500 w-48"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-r-lg text-sm hover:from-blue-600 hover:to-indigo-600 transition-all"
          onClick={handleNewsLetterSend}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}
