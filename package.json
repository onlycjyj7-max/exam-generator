import { useState, useRef, useCallback } from "react";

const QUESTION_TYPES = [
  { id: "grammar", label: "어법", emoji: "✏️", desc: "어법상 틀린 것 찾기" },
  { id: "blank", label: "빈칸추론", emoji: "🔲", desc: "빈칸에 들어갈 말" },
  { id: "topic", label: "주제/제목", emoji: "📌", desc: "글의 주제 또는 제목" },
  { id: "order", label: "글의 순서", emoji: "🔀", desc: "문단 배열 순서" },
  { id: "insert", label: "문장삽입", emoji: "📍", desc: "주어진 문장 위치" },
  { id: "summary", label: "서술형", emoji: "📝", desc: "영작/요약 서술형" },
];

const LEVELS = ["고2", "고3", "수능"];

const PROMPT_MAP = {
  grammar: `이 지문을 바탕으로 수능 스타일의 어법 문제를 만들어줘. 
형식:
- 문제: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?"
- 지문에 ①②③④⑤ 5곳에 밑줄 표시 (어법 포인트 포함)
- 정답과 해설 (왜 틀렸는지 문법 설명 포함)`,

  blank: `이 지문을 바탕으로 수능 스타일의 빈칸추론 문제를 2개 만들어줘.
형식:
- 문제: "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?"
- 핵심 내용을 빈칸 처리한 지문
- 5지선다 보기
- 정답 + 해설`,

  topic: `이 지문을 바탕으로 수능 스타일의 주제문제와 제목문제를 각 1개씩 만들어줘.
형식:
- 주제 문제: 5지선다 (한글 또는 영어)
- 제목 문제: 5지선다 (영어)
- 정답 + 핵심 키워드 해설`,

  order: `이 지문을 3~4개 단락으로 나눠서 수능 스타일 글의 순서 문제를 만들어줘.
형식:
- 주어진 단락 (A)
- 섞인 순서로 (B)(C)(D) 제시
- 올바른 순서 5지선다
- 정답 + 각 단락 연결 논리 해설`,

  insert: `이 지문을 바탕으로 수능 스타일의 문장삽입 문제를 만들어줘.
형식:
- 문제: "다음 글에서 주어진 문장이 들어가기에 가장 적절한 곳은?"
- 삽입할 문장 제시
- ①②③④⑤ 위치 표시된 지문
- 정답 + 해설`,

  summary: `이 지문을 바탕으로 서술형 문제를 2개 만들어줘.
형식:
1) 빈칸 채우기 서술형 - 핵심어를 영어로 쓰는 문제
2) 한 문장 요약 서술형 - 조건 제시형 (A와 B를 포함하여 영어로 쓸 것)
- 모범답안 포함`,
};

const s = {
  wrap: { minHeight:"100vh", background:"#0d0f14", fontFamily:"'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", color:"#e8e9ef" },
  header: { background:"linear-gradient(135deg,#1a1f2e,#0d1117)", borderBottom:"1px solid #2a2f3e", padding:"18px 24px", display:"flex", alignItems:"center", gap:12 },
  logo: { width:40, height:40, background:"linear-gradient(135deg,#4f8ef7,#7c3aed)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
  badge: { marginLeft:"auto", background:"#1e2535", border:"1px solid #2d3748", borderRadius:20, padding:"4px 12px", fontSize:12, color:"#4f8ef7", fontWeight:600 },
  main: { maxWidth:900, margin:"0 auto", padding:"24px 16px" },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 },
  card: { background:"#131720", borderRadius:16, padding:20, border:"1px solid #1e2535" },
  label: { fontSize:12, color:"#9ca3af", fontWeight:600, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px", display:"block" },
  levelRow: { display:"flex", gap:8 },
  typeGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  genBtn: (disabled) => ({
    width:"100%", padding:16, borderRadius:14, border:"none",
    background: disabled ? "#1e2535" : "linear-gradient(135deg,#4f8ef7,#7c3aed)",
    color: disabled ? "#4b5563" : "#fff",
    fontSize:16, fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing:"-0.3px", transition:"all 0.2s", marginBottom:24,
  }),
  resultCard: { background:"#131720", border:"1px solid #1e2535", borderRadius:16, marginBottom:16, overflow:"hidden" },
  resultHead: { background:"linear-gradient(135deg,#1a2540,#1a1f2e)", padding:"14px 20px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid #1e2535" },
  resultBody: { padding:20, whiteSpace:"pre-wrap", lineHeight:1.8, fontSize:14, color:"#d1d5db" },
  copyBtn: { padding:"7px 14px", borderRadius:8, border:"1px solid #2a2f3e", background:"#1a1f2e", color:"#9ca3af", fontSize:12, cursor:"pointer" },
};

export default function App() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(["blank"]);
  const [level, setLevel] = useState("고3");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
    setResults([]); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  }, []);

  const toggleType = (id) =>
    setSelectedTypes((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);

  const generate = async () => {
    if (!imageBase64 || selectedTypes.length === 0) return;
    setLoading(true); setResults([]); setError(null);
    const newResults = [];

    for (const typeId of selectedTypes) {
      const typeName = QUESTION_TYPES.find((t) => t.id === typeId)?.label;
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64,
            typeId,
            level,
            prompt: `사진의 영어 지문들을 읽고, 그 중 하나를 선택해서 아래 지시대로 ${level} 수준의 문제를 만들어줘.\n\n${PROMPT_MAP[typeId]}`,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        newResults.push({ typeId, typeName, content: data.result });
      } catch (err) {
        newResults.push({ typeId, typeName, content: `❌ 오류: ${err.message}` });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const uploadArea = {
    background: dragOver ? "#1a2540" : "#131720",
    border: `2px dashed ${dragOver ? "#4f8ef7" : image ? "#4f8ef7" : "#2a2f3e"}`,
    borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s",
    minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.logo}>📚</div>
        <div>
          <div style={{ fontWeight:700, fontSize:18 }}>영어 변형문제 생성기</div>
          <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>시험지 사진 → 수능 스타일 문제 자동 생성</div>
        </div>
        <div style={s.badge}>AI POWERED</div>
      </div>

      <div style={s.main}>
        <div style={s.grid2}>
          {/* Upload */}
          <div
            style={uploadArea}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
              onChange={(e) => processFile(e.target.files[0])} />
            {image ? (
              <>
                <img src={image} alt="uploaded" style={{ maxHeight:160, maxWidth:"100%", borderRadius:8, objectFit:"contain", marginBottom:10 }} />
                <div style={{ fontSize:12, color:"#4f8ef7", fontWeight:600 }}>✅ 업로드 완료 · 클릭하면 교체</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:40, marginBottom:12 }}>📷</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>시험지 사진 업로드</div>
                <div style={{ fontSize:12, color:"#6b7280", textAlign:"center" }}>클릭하거나 드래그 앤 드롭<br/>JPG, PNG, HEIC 지원</div>
              </>
            )}
          </div>

          {/* Settings */}
          <div style={s.card}>
            <div style={{ marginBottom:20 }}>
              <span style={s.label}>난이도 설정</span>
              <div style={s.levelRow}>
                {LEVELS.map((l) => (
                  <button key={l} onClick={() => setLevel(l)} style={{
                    flex:1, padding:"8px 0", borderRadius:8,
                    border: level===l ? "none" : "1px solid #2a2f3e",
                    background: level===l ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "#1a1f2e",
                    color: level===l ? "#fff" : "#9ca3af",
                    fontWeight: level===l ? 700 : 400,
                    cursor:"pointer", fontSize:14, transition:"all 0.15s",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <span style={s.label}>문제 유형 선택</span>
              <div style={s.typeGrid}>
                {QUESTION_TYPES.map((t) => {
                  const sel = selectedTypes.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleType(t.id)} style={{
                      padding:"10px 12px", borderRadius:10,
                      border: sel ? "1px solid #4f8ef7" : "1px solid #2a2f3e",
                      background: sel ? "rgba(79,142,247,0.12)" : "#1a1f2e",
                      color: sel ? "#4f8ef7" : "#9ca3af",
                      cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                    }}>
                      <div style={{ fontSize:13, fontWeight: sel?700:400 }}>{t.emoji} {t.label}</div>
                      <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={!imageBase64 || selectedTypes.length===0 || loading}
          style={s.genBtn(!imageBase64 || selectedTypes.length===0 || loading)}>
          {loading ? `🤖 문제 생성 중... (${selectedTypes.length}개 유형)` : `⚡ 변형 문제 생성하기 (${selectedTypes.length}개 유형 선택)`}
        </button>

        {error && (
          <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:16, marginBottom:16, color:"#f87171", fontSize:14 }}>
            ⚠️ {error}
          </div>
        )}

        {results.map((r, i) => {
          const typeInfo = QUESTION_TYPES.find((t) => t.id === r.typeId);
          return (
            <div key={i} style={s.resultCard}>
              <div style={s.resultHead}>
                <span style={{ fontSize:20 }}>{typeInfo?.emoji}</span>
                <span style={{ fontWeight:700, fontSize:15 }}>{r.typeName} 문제</span>
                <span style={{ marginLeft:"auto", background:"rgba(79,142,247,0.15)", color:"#4f8ef7", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{level}</span>
              </div>
              <div style={s.resultBody}>{r.content}</div>
              <div style={{ padding:"12px 20px", borderTop:"1px solid #1e2535" }}>
                <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(r.content)}>
                  📋 복사
                </button>
              </div>
            </div>
          );
        })}

        {results.length===0 && !loading && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:"#374151" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>시험지 사진을 올리고 문제를 생성해봐</div>
            <div style={{ fontSize:13 }}>어법·빈칸·주제·순서·서술형 자동 생성</div>
          </div>
        )}
      </div>
    </div>
  );
}
