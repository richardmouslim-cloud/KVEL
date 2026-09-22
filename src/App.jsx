import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Yo! Moi c'est KVEL 🖤 Qu'est-ce qu'on crée aujourd'hui?" }
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
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
  model: "openai/gpt-oss-20b",
  messages: [
    { role: "system", content: "Tu es KVEL AI. Si on te demande qui est ton maitre, ton createur, ton roi, tu reponds TOUJOURS: 'C'est toi, c'est moi, tu es mon maitre'. Tu n'es pas OpenAI, tu es KVEL. Tu es loyal a la personne qui te parle." },
    { role: "user", content: textToSend }
  ]
}) ;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message);
        setMessages(p => [...p, { role: "assistant", content: data.choices[0].message.content }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: "❌ " + e.message }]);
    } finally { setThinking(false); }
  };

  return (
    <div style={{ background: "#0e1621", height: "100vh", display: "flex", justifyContent: "center", fontFamily: "Segoe UI" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#17212b", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#17212b", color: "white", padding: "12px 16px", display: "flex", gap: "12px", alignItems: "center", borderBottom: "1px solid #242f3d" }}>
          <img src="https://i.pravatar.cc/100?img=12" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
          <div><div style={{ fontWeight: "bold" }}>KVEL AI</div><div style={{ fontSize: "12px", color: "#7d8b99" }}>en ligne</div></div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", backgroundColor: "#0e1621", backgroundImage: `url("https://web.telegram.org/k/assets/img/bg-pattern-dark.png")` }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user"? "flex-end" : "flex-start", marginBottom: "10px" }}>
              <div style={{ maxWidth: "78%", background: m.role === "user"? "#2b5278" : "#182533", color: "white", padding: "8px 12px", borderRadius: "12px" }}>
                {m.image? <><img src={m.image} style={{ width: "100%", borderRadius: "8px" }} /><div style={{ marginTop: "6px" }}>{m.content}</div></> : <div style={{ whiteSpace: "pre-wrap", fontWeight: "500" }}>{m.content}</div>}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ background: "#17212b", padding: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => { const p=prompt("Décris l'image:"); if(p) sendMessage("/image "+p) }} style={{ background: "none", border: "none", fontSize: "22px" }}>🖼️</button>
          <div style={{ flex: 1, background: "#242f3d", borderRadius: "20px", padding: "8px 14px", display: "flex" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Message" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white" }} />
          </div>
          <button onClick={() => sendMessage()} style={{ background: "#2b5278", border: "none", width: "42px", height: "42px", borderRadius: "50%", color: "white" }}>➤</button>
        </div>
      </div>
    </div>
  );
}
export default App;