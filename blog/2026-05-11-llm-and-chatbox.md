---
slug: large-language-model-llm-and-chatbox
title: "Large Language Model (LLM) & Chatbox"
description: "LLM hoạt động như thế nào? Token, context window, prompt, RAG, function calling là gì? Cách build 1 chatbox đơn giản và áp dụng AI vào công việc hàng ngày của developer."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [LLM, AI, Chatbot, Prompt Engineering, RAG, Productivity]
date: '2026-05-11T08:00:00Z'
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80
---

LLM không "thông minh" theo nghĩa con người — nó là 1 cỗ máy **đoán từ tiếp theo** dựa trên xác suất, được train trên hàng tỷ trang văn bản. Hiểu cách nó hoạt động giúp bạn viết prompt tốt hơn, build chatbox đỡ buggy hơn, và biết khi nào KHÔNG nên tin nó.

<!-- truncate -->

# Large Language Model (LLM) & Chatbox: Từ A đến Z

> Bài này dành cho developer muốn áp dụng AI vào công việc nhưng chưa hiểu rõ "bên dưới" LLM hoạt động ra sao. Mình sẽ giải thích khái niệm bằng ngôn ngữ đời thường, kèm code mẫu và checklist khi build chatbox thực tế.

## Mục lục

1. [LLM là gì? Giải thích như cho người 12 tuổi](#llm-la-gi)
2. [Token, context window, temperature](#token-context)
3. [Prompt Engineering: cách "nói chuyện" với LLM](#prompt)
4. [RAG: làm LLM trả lời đúng data của bạn](#rag)
5. [Function calling: cho LLM "cánh tay"](#function-calling)
6. [Hands-on: build chatbox 50 dòng code](#chatbox)
7. [Ưu/nhược của LLM ở nơi làm việc](#uu-nhuoc)
8. [Thuật ngữ cần biết](#thuat-ngu)

## 1. LLM là gì? Giải thích như cho người 12 tuổi {#llm-la-gi}

Tưởng tượng 1 trò chơi: bạn đưa LLM 1 câu nửa chừng, nó phải đoán **chữ tiếp theo**.

```
Input:  "Hôm nay trời rất ___"
LLM:    "đẹp" (85%) | "nóng" (10%) | "mát" (3%) | "khoai" (0.001%) ...
```

Nó chọn chữ có xác suất cao, ghép vào câu, rồi lại đoán chữ tiếp theo. Cứ thế cho đến hết câu trả lời. **Toàn bộ "trí tuệ" của ChatGPT chỉ là trò đoán-chữ-tiếp-theo lặp đi lặp lại.**

> Tại sao nó đoán giỏi? Vì nó đã "đọc" cỡ **hàng nghìn tỷ chữ** trong quá trình training — sách, bài báo, Wikipedia, GitHub, Reddit, v.v. Mô hình học được pattern: khi gặp "Hôm nay trời rất" → khả năng cao chữ tiếp là tính từ thời tiết.

### Mô hình to → đoán giỏi → trông như biết suy luận

- **LLM** = Large Language Model — mô hình ngôn ngữ lớn
- "Lớn" ở đây = hàng **trăm tỷ tham số** (parameters)
- Tham số nhiều → bắt được pattern phức tạp → giải toán, viết code, dịch thuật

Nhưng đừng nhầm: **LLM không "hiểu" — nó pattern match cực giỏi**.

## 2. Token, context window, temperature {#token-context}

3 khái niệm quan trọng nhất khi làm việc với LLM:

### Token = đơn vị tính của LLM

LLM không nhìn theo "chữ" hay "từ" — nó nhìn theo **token**. 1 token ≈ 4 ký tự tiếng Anh, hoặc 1 từ ngắn.

```
"Hello world!" → ["Hello", " world", "!"]  (3 tokens)
"Xin chào"     → ["Xin", " ch", "ào"]      (3 tokens)
"def add(a,b)" → ["def", " add", "(", "a", ",", "b", ")"] (7 tokens)
```

**Vì sao quan trọng?** API tính tiền theo token. 1 câu chat ngắn ≈ 50-100 tokens. Cuộc hội thoại dài → tốn nhiều token → tốn tiền.

### Context window = "trí nhớ" của LLM trong 1 lần gọi

LLM **không có trí nhớ** giữa các lần gọi. Mỗi lần bạn chat, app phải gửi **toàn bộ history** lại. Có giới hạn:

| Model | Context window |
|---|---|
| GPT-3.5 | 16K tokens (~12K từ) |
| GPT-4 | 128K tokens |
| Claude Sonnet 4.5 | 200K tokens |
| Claude Opus (1M variant) | 1M tokens (~750K từ) |

Vượt context window → app phải cắt bớt message cũ → LLM "quên" đoạn đầu cuộc trò chuyện.

### Temperature = độ "sáng tạo"

Tham số 0 → 1 (hoặc 2):

```
Prompt: "Viết 1 câu về biển"

temperature: 0
→ "Biển rộng lớn và xanh thẳm."     (mỗi lần chạy đều giống nhau)

temperature: 1
→ "Biển kể chuyện bằng ngôn ngữ sóng vỗ."  (mỗi lần khác nhau)
```

- **Code, dữ liệu, fact**: `temperature: 0` — cần ổn định
- **Sáng tác, brainstorm**: `temperature: 0.7-1` — cần sáng tạo

## 3. Prompt Engineering: cách "nói chuyện" với LLM {#prompt}

**Prompt** = câu bạn gửi cho LLM. Cùng 1 câu hỏi, viết khác nhau → kết quả khác xa nhau.

### So sánh prompt dở vs prompt tốt

**Prompt dở**:
```
"Sửa code này"
```

LLM phải đoán: sửa lỗi gì? phong cách gì? language gì?

**Prompt tốt**:
```
Role: Bạn là senior TypeScript reviewer.
Task: Refactor hàm bên dưới theo style "early return".
Constraint:
  - Giữ nguyên signature
  - Không thêm dependency mới
  - Comment ngắn cho mỗi early return
Input:
  function processOrder(order) {
    if (order) {
      if (order.items.length > 0) { ... }
    }
  }
Expected output: code đã refactor + 1 dòng giải thích.
```

### Công thức RTF: Role + Task + Format

3 thành phần tối thiểu của 1 prompt tốt:

1. **Role**: nhập vai gì? ("Bạn là chuyên gia UX...")
2. **Task**: làm gì cụ thể? ("Đánh giá 3 điểm yếu...")
3. **Format**: trả về dạng nào? ("Trả về JSON với keys: issue, severity, fix")

### Few-shot prompting: dạy bằng ví dụ

Đưa 2-3 ví dụ trước, LLM bắt chước theo:

```
Phân loại email:

Email: "Hệ thống bị lỗi từ 9h sáng, mất 30 phút"
Loại: incident

Email: "Cảm ơn anh đã hỗ trợ rất tận tình"
Loại: feedback

Email: "Cho hỏi giá thuê server 4 CPU 16GB là bao nhiêu?"
Loại: ???
```

LLM sẽ trả: `sales-inquiry`. Bắt pattern qua ví dụ tốt hơn giải thích bằng lời.

## 4. RAG: làm LLM trả lời đúng data của bạn {#rag}

**Vấn đề**: LLM được train cũ (knowledge cutoff). Nó không biết:
- Tài liệu nội bộ công ty bạn
- Tin tức mới hôm qua
- API doc của thư viện mới release

**RAG (Retrieval-Augmented Generation)** = "đưa tài liệu cho LLM đọc trước khi trả lời".

### Flow đơn giản

```
User hỏi: "Cách deploy backend service X?"
   │
   ├─→ Search docs nội bộ (vector search)
   │   → tìm 3 đoạn liên quan nhất
   │
   ├─→ Build prompt:
   │   "Dựa trên context bên dưới, trả lời câu hỏi:
   │    Context: [3 đoạn vừa tìm]
   │    Question: Cách deploy backend service X?"
   │
   └─→ LLM trả lời dựa trên context (không bịa)
```

### Tại sao RAG quan trọng?

- **Giảm hallucination**: LLM có nguồn để bám, không bịa
- **Cập nhật dữ liệu rẻ**: chỉ cần index lại docs, không cần retrain LLM
- **Bảo mật**: data nội bộ không bao giờ "vào" weights của LLM

### Stack RAG cơ bản

```
Document (PDF, MD, HTML)
   │
   ▼
Splitter (chia thành chunk ~500 tokens)
   │
   ▼
Embedding (text → vector 1536 chiều)
   │
   ▼
Vector DB (Pinecone, Qdrant, pgvector)
   │
   ▼
Query time: user question → embed → tìm K vector gần nhất → gửi vào LLM
```

## 5. Function calling: cho LLM "cánh tay" {#function-calling}

LLM mặc định chỉ sinh text. **Function calling** = cho LLM gọi function trong code của bạn.

### Ví dụ: chatbot đặt vé máy bay

```js
const tools = [{
  name: 'search_flights',
  description: 'Tìm chuyến bay theo thành phố và ngày',
  parameters: {
    from: 'string',
    to: 'string',
    date: 'YYYY-MM-DD',
  },
}]

// User chat: "Tìm vé Hà Nội đi Đà Nẵng ngày 20/5"
// LLM trả về:
{
  tool: 'search_flights',
  args: { from: 'HAN', to: 'DAD', date: '2026-05-20' }
}

// Code của bạn gọi API, nhận kết quả, gửi lại cho LLM
// LLM trả lời user bằng ngôn ngữ tự nhiên
```

### Pattern Agent: LLM tự quyết gọi function nào

```
User: "Booking phòng khách sạn ở Đà Lạt 3 đêm, ngân sách 5 triệu"
   │
LLM nghĩ: cần search → cần check availability → cần book
   │
   ├─→ call: search_hotels({ city: 'DLI', budget: 5000000 })
   ├─→ call: check_availability({ hotelId: 'H123', nights: 3 })
   └─→ call: create_booking({ ... })
   │
LLM tổng hợp: "Đã book khách sạn ABC cho anh, mã XYZ"
```

Đây là nền tảng của **AI Agents** như Claude Code, GitHub Copilot Workspace.

## 6. Hands-on: build chatbox 50 dòng code {#chatbox}

Demo dùng OpenAI SDK + React. Anthropic SDK tương tự.

### Backend (Node.js)

```js
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })

app.post('/chat', async (req, res) => {
  const { messages } = req.body  // [{role, content}, ...]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Bạn là trợ lý kỹ thuật thân thiện.' },
      ...messages,
    ],
    temperature: 0.7,
  })

  res.json({ reply: response.choices[0].message.content })
})
```

### Frontend (React)

```jsx
function ChatBox() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const send = async () => {
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    const res = await fetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    })
    const { reply } = await res.json()
    setMessages([...newMessages, { role: 'assistant', content: reply }])
  }

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i} className={m.role}>
          <b>{m.role === 'user' ? 'Bạn' : 'Bot'}:</b> {m.content}
        </div>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={send}>Gửi</button>
    </div>
  )
}
```

**Cải tiến tiếp theo**: streaming response (chữ hiện dần như ChatGPT), markdown render, code highlight, history persistence.

## 7. Ưu/nhược của LLM ở nơi làm việc {#uu-nhuoc}

### Ưu điểm

| Use case | Ví dụ thực tế |
|---|---|
| **Boilerplate code** | Generate form validation, CRUD, regex |
| **Tóm tắt tài liệu** | Đọc 50 trang spec → tóm 1 trang |
| **Dịch & viết** | Email tiếng Anh, mô tả PR, release notes |
| **Brainstorm** | Đặt tên biến, đặt tên API, gợi ý approach |
| **Debug** | Paste error log, hỏi nguyên nhân |
| **Review code** | Code smell, best practice, security |

### Nhược điểm

| Nhược | Ví dụ |
|---|---|
| **Hallucination** | Bịa hàm/library không tồn tại |
| **Knowledge cutoff** | Không biết library/version mới |
| **Bias** | Lặp lại định kiến trong data training |
| **Bảo mật** | Cẩn thận khi paste code công ty vào public LLM |
| **Phụ thuộc** | Junior dev quen "Claude/ChatGPT làm hộ" → mất kỹ năng |
| **Cost** | Token-based pricing, gọi nhiều → đắt nhanh |

### Quy tắc cá nhân khi dùng LLM ở công ty

1. **Không bao giờ paste secret, token, customer data** vào LLM public
2. **Luôn đọc & test code LLM sinh ra** — coi nó như intern, không phải senior
3. **LLM mạnh ở review/refactor**, yếu ở "design hệ thống lớn từ đầu"
4. **Học khái niệm trước, dùng LLM sau** — đừng bỏ qua nền tảng

## 8. Thuật ngữ cần biết {#thuat-ngu}

| Thuật ngữ | Ý nghĩa ngắn gọn |
|---|---|
| **LLM** | Large Language Model — mô hình ngôn ngữ lớn |
| **Token** | Đơn vị xử lý (≈ 4 ký tự English) |
| **Context window** | Số token tối đa LLM "thấy" trong 1 lần |
| **Prompt** | Input bạn gửi cho LLM |
| **System prompt** | Hướng dẫn role/behavior của LLM |
| **Temperature** | Độ ngẫu nhiên (0 = ổn định, 1+ = sáng tạo) |
| **Hallucination** | LLM bịa thông tin nghe có vẻ đúng |
| **Embedding** | Vector số biểu diễn ý nghĩa của text |
| **RAG** | Retrieval-Augmented Generation — tra cứu + sinh text |
| **Fine-tuning** | Train tiếp LLM trên data riêng của bạn |
| **Function calling** | LLM gọi function trong code của bạn |
| **Agent** | LLM tự gọi nhiều function liên tiếp để hoàn thành task |
| **Tokenizer** | Module chia text thành tokens |
| **Quantization** | Giảm kích thước model (q4, q8) để chạy local |

## Tóm tắt 1 phút

- **LLM = máy đoán chữ tiếp theo** dựa trên xác suất, không "hiểu" nhưng pattern match cực giỏi
- **Token, context window, temperature** là 3 khái niệm cần nắm vững
- **Prompt tốt = Role + Task + Format**, dùng few-shot khi cần
- **RAG** giúp LLM trả lời đúng theo data của bạn
- **Function calling + Agent** là nền của thế hệ AI tool mới
- **Build chatbox**: 50 dòng code là đủ cho MVP
- **Quy tắc vàng**: đừng tin LLM 100%, dùng nó như intern chứ không phải sếp

Cảm ơn bạn đã đọc. Nếu mới bắt đầu, hãy thử build 1 chatbox đơn giản với OpenAI/Anthropic API — cách nhanh nhất để hiểu LLM là gõ code và thấy nó "chạy".
