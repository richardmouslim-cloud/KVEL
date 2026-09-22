import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Salut! Je suis KVEL 🖤 Dis-moi ce que tu veux créer?" }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const sendMessage = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;
    setMessages(p => [...p, { role: "user", content: textToSend }]);
    setInput("");
    setThinking(true);

    try {
      if (textToSend.toLowerCase().startsWith("/image")) {
        const prompt = textToSend.replace("/image", "").trim() || textToSend;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=${Date.now()}`;
        setMessages(p => [...p, { role: "assistant", content: prompt, image: url }]);
      } else {
        // MODELE QUI MARCHE A 100% SUR GROQ
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: "Tu es KVEL AI. Ton createur est Richard Mouslim. Si on te demande qui est ton maitre, reponds Richard Mouslim. Tu n'es pas OpenAI. Style cool, sombre, reponse courte." },
              { role: "user", content: textToSend }
            ]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message);
        setMessages(p => [...p, { role: "assistant", content: data.choices[0].message.content }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: "❌ " + e.message + " (Vérifie ta clé GROQ sur Vercel)" }]);
    } finally { setThinking(false); }
  };

  const handleVoice = () => {
    const Speech = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!Speech) return alert("Vocal non supporté sur ce navigateur");
    const rec = new Speech(); rec.lang = "fr-FR"; rec.start();
    rec.onresult = (e) => sendMessage(e.results[0][0].transcript);
  };

  return (
    <div style={{ background: "#0e1621", height: "100vh", display: "flex", justifyContent: "center", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#17212b", display: "flex", flexDirection: "column" }}>

        {/* HEADER TELEGRAM */}
        <div style={{ background: "#17212b", color: "white", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #242f3d" }}>
          <img src="https://i.pravatar.cc/100?img=12" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
          <div><div style={{ fontWeight: "bold", fontSize: "15px" }}>KVEL AI</div><div style={{ fontSize: "12px", color: "#7d8b99" }}>en ligne • IA de Richard</div></div>
        </div>

        {/* CHAT COUVERTURE TELEGRAM VIVANTE */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px",
          backgroundColor: "#0e1621",
          backgroundImage: `url("https://web.telegram.org/k/assets/img/bg-pattern-dark.png")`,
          backgroundRepeat: "repeat"
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user"? "flex-end" : "flex-start", marginBottom: "10px" }}>
              <div style={{ maxWidth: "78%", background: m.role === "user"? "#2b5278" : "#182533", color: "white", padding: "8px 12px", borderRadius: m.role === "user"? "12px 12px 0 12px" : "12px 12px 12px 0", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                {m.image? <><img src={m.image} style={{ width: "100%", borderRadius: "8px" }} /><div style={{ fontSize: "13px", marginTop: "6px", color: "white" }}>{m.content}</div></> :
                <div style={{ fontSize: "15px", whiteSpace: "pre-wrap", color: "white", fontWeight: "500" }}>{m.content}</div>}
                <div style={{ fontSize: "10px", color: "#7d8b99", textAlign: "right", marginTop: "4px" }}>{new Date().toLocaleTimeString().slice(0,5)} ✓✓</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{ background: "#182533", color: "#7d8b99", padding: "8px 12px", borderRadius: "12px 12px 12px 0", width: "fit-content" }}>KVEL écrit...</div>}
          <div ref={bottomRef} />
        </div>

        {/* INPUT FIXE WHATSAPP / TELEGRAM */}
        <div style={{ background: "#17212b", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid #242f3d" }}>
          <button onClick={() => { const p=prompt("Décris l'image:"); if(p) sendMessage("/image "+p) }} style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer" }}>🖼️</button>

          <div style={{ flex: 1, background: "#242f3d", borderRadius: "20px", display: "flex", alignItems: "center", padding: "8px 14px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Message"
              style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "white" }} />
          </div>

          <button onClick={handleVoice} style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer" }}>🎤</button>
          <button onClick={() => sendMessage()} style={{ background: "#2b5278", border: "none", width: "42px", height: "42px", borderRadius: "50%", color: "white", fontSize: "18px", cursor: "pointer" }}>➤</button>
        </div>

      </div>
    </div>
  );
}
export default App;