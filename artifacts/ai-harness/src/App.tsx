import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    window.location.replace("/ai-harness/");
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Redirecting to AI Harness…</p>
    </div>
  );
}
