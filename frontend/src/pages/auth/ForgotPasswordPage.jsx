import { useState } from "react";
import { Brain } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");



  const submitPassword = (e) => {
    e.preventDefault();

    //Here use axios and backend point to send the email
    console.log("The password sent to Gmail");
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center p-5">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Password recovery
          </h2>

      <div className="bg-white/80 lg:h-2/5 lg:w-2/5 w-full h-max backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <form className="space-y-6">
          {/* Email */}
          <Input
            label="Please enter your email address"
            type="email"
            placeholder="john.doe@university.edu"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />

         
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              onClick={submitPassword}
              disabled={!email.includes("@") || !email.includes(".")}

            >
              <span>Send</span>
            </Button>
      
        </form>
      </div>
    </div>
  );
}
