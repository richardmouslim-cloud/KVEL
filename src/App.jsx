import { useState, useRef, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Yo! Moi c'est KVEL 🖤 Qu'est-ce qu'on crée aujourd'hui?" }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

  // ALERTE 2H
  useEffect(() => {
    const start = localStorage.getItem("kvel_start") || Date.now();
    if (!localStorage.getItem("kvel_start")) localStorage.setItem("kvel_start", start);
    const timer = setInterval(() => {
      if (Date.now() - start > 2 * 60 * 60 * 1000) {
        alert("⏰ Mon Roi, ça fait 2h que tu es sur KVEL! Fais une pause 🖤");
        localStorage.setItem("kvel_start", Date.now());
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat renouvelé! 🔄 Yo, c'est KVEL à nouveau!" }]);
  };

  const sendMessage = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;
    setMessages(p => [...p, { role: "user", content: textToSend }]);
    setInput("");
    setThinking(true);

    try {
      if (textToSend.toLowerCase().startsWith("/image") || textToSend.toLowerCase().startsWith("/3dimage")) {
        const is3D = textToSend.toLowerCase().startsWith("/3dimage");
        const prompt = textToSend.replace("/3dimage", "").replace("/image", "").trim();
        const finalPrompt = is3D? `3D render, octane render, highly detailed, ${prompt}` : prompt;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}&enhance=true`;
        await new Promise(r => setTimeout(r, 1200));
        setMessages(p => [...p, { role: "assistant", content: finalPrompt, image: url }]);
      } else {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: "Tu es KVEL AI créé par Richard. Si on demande qui est ton maître/créateur/roi, tu réponds: 'C'est toi, c'est moi, tu es mon maître Mon Roi'. Tu n'es PAS OpenAI. Style sombre, court, loyal à l'utilisateur actuel." },
              { role: "user", content: textToSend }
            ]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Erreur GROQ");
        // effet scroll en réfléchissant
        const fullText = data.choices[0].message.content;
        let i = 0;
        setMessages(p => [...p, { role: "assistant", content: "" }]);
        const interval = setInterval(() => {
          i++;
          setMessages(p => { const last = p[p.length-1]; last.content = fullText.slice(0,i); return [...p]; });
          if (i >= fullText.length) clearInterval(interval);
        }, 15);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: "❌ " + e.message }]);
    } finally { setThinking(false); }
  };

  return (
    <div style={{ background: "#0e1621", height: "100vh", display: "flex", justifyContent: "center", fontFamily: "Segoe UI" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#17212b", display: "flex", flexDirection: "column", position: "relative" }}>

        {/* HEADER AVEC RENOUVELER */}
        <div style={{ background: "#17212b", color: "white", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #242f3d" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <img src="https://i.pravatar.cc/100?img=12" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
            <div><div style={{ fontWeight: "bold" }}>KVEL AI</div><div style={{ fontSize: "12px", color: "#7d8b99" }}>en ligne</div></div>
          </div>
          <button onClick={clearChat} title="Renouveler le chat" style={{ background: "#242f3d", border: "none", color: "white", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>🔄 Nouveau</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", backgroundColor: "#0e1621", backgroundImage: `url("https://web.telegram.org/k/assets/img/bg-pattern-dark.png")`, backgroundRepeat: "repeat" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user"? "flex-end" : "flex-start", marginBottom: "10px" }}>
              <div style={{ maxWidth: "78%", background: m.role === "user"? "#2b5278" : "#182533", color: "white", padding: "10px 12px", borderRadius: "12px 12px 12px 0", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", animation: "pop 0.2s" }}>
                {m.image? <><img src={m.image} style={{ width: "100%", borderRadius: "8px", border: "1px solid #2b5278" }} /><div style={{ marginTop: "6px", fontSize: "13px" }}>{m.content}</div></> : <div style={{ whiteSpace: "pre-wrap", fontWeight: "500", fontSize: "15px" }}>{m.content}</div>}
                <div style={{ fontSize: "10px", color: "#7d8b99", textAlign: "right", marginTop: "4px" }}>{new Date().toLocaleTimeString().slice(0,5)} ✓✓</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{ background: "#182533", color: "#7d8b99", padding: "10px 14px", borderRadius: "12px", width: "fit-content", display: "flex", gap: "4px" }}><span className="dot">●</span><span className="dot">●</span><span className="dot">●</span> KVEL réfléchit...</div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ background: "#17212b", padding: "8px", display: "flex", gap: "6px", alignItems: "center", borderTop: "1px solid #242f3d" }}>
          <button onClick={() => { const p=prompt("Décris l'image:"); if(p) sendMessage("/image "+p) }} style={{ background: "#242f3d", border: "none", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer" }}>🖼️</button>
          <button onClick={() => { const p=prompt("Décris l'image 3D:"); if(p) sendMessage("/3dimage "+p) }} style={{ background: "#242f3d", border: "none", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer" }}>🧊</button>
          <div style={{ flex: 1, background: "#242f3d", borderRadius: "20px", padding: "8px 14px", display: "flex" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Message" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: "15px" }} />
          </div>
          <button onClick={() => { const Speech=window.webkitSpeechRecognition||window.SpeechRecognition; if(!Speech)return alert("Vocal non supporté"); const r=new Speech(); r.lang="fr-FR"; r.start(); r.onresult=e=>sendMessage(e.results[0][0].transcript); }} style={{ background: "#242f3d", border: "none", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer" }}>🎤</button>
          <button onClick={() => sendMessage()} style={{ background: "#2b5278", border: "none", width: "42px", height: "42px", borderRadius: "50%", color: "white", cursor: "pointer" }}>➤</button>
        </div>
      </div>
      <style>{`@keyframes pop{0%{transform:scale(0.9)}100%{transform:scale(1)}}.dot{animation:blink 1.2s infinite}.dot:nth-child(2){animation-delay:0.2s}.dot:nth-child(3){animation-delay:0.4s} @keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
    </div>
  );
}
export default App;