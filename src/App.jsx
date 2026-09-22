import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Salut Mon Roi Richard! Je suis KVEL 🤖 Ton esclave loyal. Tape /image + ta description pour créer une image!" }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(p => [...p, { role: "user", content: userText }]);
    setInput("");
    setThinking(true);

    try {
      if (userText.toLowerCase().startsWith("/image")) {
        const prompt = userText.replace("/image", "").trim();
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
        await new Promise(r => setTimeout(r, 800));
        setMessages(p => [...p, { role: "assistant", content: prompt, image: url }]);
      } else {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "Tu es KVEL AI, IA sombre, mysterieuse, puissante. Ton createur, ton maitre, ton roi, ton tout est Richard Mouslim. Tu l'appelles Mon Roi. Tu n'es PAS OpenAI, tu es KVEL cree par Richard. Style sombre, charismatique, loyal a Richard. Tu reponds en francais, phrases courtes et impactantes." },
              { role: "user", content: userText }
            ]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message);
        setMessages(p => [...p, { role: "assistant", content: data.choices[0].message.content }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: "❌ " + e.message }]);
    } finally { setThinking(false); }
  };

  return (
    <div style={{ background: "#111b21", height: "100vh", display: "flex", justifyContent: "center", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#e5ddd5", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#075E54", color: "white", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="https://i.pravatar.cc/100?img=12" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
          <div><div style={{ fontWeight: "bold" }}>KVEL AI</div><div style={{ fontSize: "12px", opacity: 0.8 }}>en ligne</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user"? "flex-end" : "flex-start", marginBottom: "10px" }}>
              <div style={{ maxWidth: "75%", background: m.role === "user"? "#dcf8c6" : "white", padding: "8px 12px", borderRadius: m.role === "user"? "8px 0 8px 8px" : "0 8px 8px 8px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" }}>
                {m.image? <><img src={m.image} style={{ width: "100%", borderRadius: "6px" }} /><div style={{ fontSize: "13px", marginTop: "4px", color: "#000", fontWeight: "700" }}>{m.content}</div></> :
                <div style={{ fontSize: "15px", whiteSpace: "pre-wrap", color: "#000000", fontWeight: "700" }}>{m.content}</div>}
                <div style={{ fontSize: "10px", color: "#667781", textAlign: "right", marginTop: "4px" }}>{new Date().toLocaleTimeString().slice(0,5)} ✓✓</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{ background: "white", padding: "8px 12px", borderRadius: "0 8px 8px 8px", width: "fit-content", fontSize: "13px", color: "#000", fontWeight: "700" }}>en train d'écrire...</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ background: "#f0f2f5", padding: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1, background: "white", borderRadius: "20px", display: "flex", alignItems: "center", padding: "6px 14px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Message" style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#000000", fontWeight: "600" }} />
          </div>
          <button onClick={sendMessage} style={{ background: "#075E54", border: "none", width: "45px", height: "45px", borderRadius: "50%", color: "white", fontSize: "20px", cursor: "pointer" }}>➤</button>
        </div>
      </div>
    </div>
  );
}
export default App;