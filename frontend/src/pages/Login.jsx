import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          login(response.credential);
          navigate("/");
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [user, login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
        <h1 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Kleavers
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Inicia sesión para continuar
        </p>
        <div ref={buttonRef}></div>
      </div>
    </div>
  );
}
