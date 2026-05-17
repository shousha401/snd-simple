import { useState, useRef, useEffect } from 'react'
import './styles.css'

const API_BASE = 'http://127.0.0.1:8010'

// ── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-5 shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-foreground">{title}</h2>
      {children}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
function Badge({ confidence }) {
  if (confidence === 'UNKNOWN') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">UNKNOWN</span>
  }
  if (confidence === 'RED') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">RED</span>
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">{confidence}</span>
}

// ── Health Check Card ────────────────────────────────────────────────────────
function HealthCheckCard() {
  const [health, setHealth] = useState(null)
  const [engineInfo, setEngineInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [error, setError] = useState(null)

  async function checkHealth() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHealth(data)
    } catch (e) {
      setError('Failed to connect to backend at ' + API_BASE)
      setHealth(null)
    }
    setLoading(false)
  }

  async function checkEngineInfo() {
    setLoadingInfo(true)
    try {
      const res = await fetch(`${API_BASE}/api/engine-info`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setEngineInfo(data)
    } catch (e) {
      setEngineInfo({ error: e.message })
    }
    setLoadingInfo(false)
  }

  return (
    <Card title="Health Check">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={checkHealth}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Checking...' : 'Check Connection'}
        </button>
        <button
          onClick={checkEngineInfo}
          disabled={loadingInfo}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          {loadingInfo ? 'Loading...' : 'Engine Info'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3">
          {error}
        </div>
      )}

      {health && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`text-sm font-medium ${health.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
              {health.status}
            </span>
          </div>
          <pre className="pre-wrap debug-block bg-muted p-3 rounded-md text-muted-foreground">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}

      {engineInfo && (
        <div>
          <div className="text-sm text-muted-foreground mb-2">Engine Info:</div>
          <pre className="pre-wrap debug-block bg-muted p-3 rounded-md text-muted-foreground">
            {JSON.stringify(engineInfo, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  )
}

// ── Ask SND Card ─────────────────────────────────────────────────────────────
function AskSndCard() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  async function ask() {
    if (!question.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, answer_text: `Request failed: ${e.message}`, confidence: 'RED', engine_debug: { error: e.message } })
    }
    setLoading(false)
  }

  return (
    <Card title="Ask SND">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="اكتب السؤال القانوني هنا..."
        rows={3}
        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-3"
        dir="auto"
      />
      <button
        onClick={ask}
        disabled={loading || !question.trim()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors mb-4"
      >
        {loading ? 'Asking...' : 'Ask SND'}
      </button>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge confidence={result.confidence} />
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Raw SND Engine Output:</div>
            <pre className="pre-wrap bg-muted p-3 rounded-md text-sm text-foreground border border-border max-h-96 overflow-y-auto">
              {result.answer_text || '(No output)'}
            </pre>
          </div>

          <div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {showDebug ? 'Hide' : 'Show'} Engine Debug
            </button>
            {showDebug && (
              <pre className="pre-wrap debug-block bg-muted p-3 rounded-md text-muted-foreground mt-1">
                {JSON.stringify(result.engine_debug, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Upload Document Card ─────────────────────────────────────────────────────
function UploadDocCard() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  async function upload() {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/api/upload-doc`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, error: e.message })
    }
    setLoading(false)
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  return (
    <Card title="Upload Document">
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium hover:file:bg-secondary/80 cursor-pointer"
        />
        {file && (
          <div className="text-xs text-muted-foreground">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
        <button
          onClick={upload}
          disabled={loading || !file}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors w-fit"
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>

        {result && result.ok && (
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-sm">
            <div className="text-green-400 font-medium mb-1">Uploaded successfully</div>
            <div className="text-muted-foreground">Filename: {result.filename}</div>
            <div className="text-muted-foreground">Path: {result.saved_path}</div>
            <div className="text-muted-foreground">Size: {result.size_bytes?.toLocaleString()} bytes</div>
          </div>
        )}
        {result && !result.ok && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Upload failed: {result.error}
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Record Audio Card ────────────────────────────────────────────────────────
function RecordAudioCard() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function startRecording() {
    setError(null)
    setResult(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (e) {
      setError('Could not access microphone: ' + e.message)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  async function uploadAudio() {
    if (!audioBlob) return
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `recording_${Date.now()}.webm`)
      const res = await fetch(`${API_BASE}/api/upload-audio`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, error: e.message })
    }
    setLoading(false)
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <Card title="Record Audio">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            Stop Recording
          </button>
          <button
            onClick={uploadAudio}
            disabled={loading || !audioBlob || isRecording}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Uploading...' : 'Upload Audio'}
          </button>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 recording-pulse">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-red-400 font-medium">Recording {fmtTime(recordingTime)}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="mt-2">
            <div className="text-sm text-muted-foreground mb-2">Preview:</div>
            <audio controls src={audioUrl} className="w-full max-h-10" />
          </div>
        )}

        {result && result.ok && (
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-sm">
            <div className="text-green-400 font-medium mb-1">Audio saved</div>
            <div className="text-muted-foreground">Filename: {result.filename}</div>
            <div className="text-muted-foreground">Path: {result.saved_path}</div>
            <div className="text-muted-foreground">Size: {result.size_bytes?.toLocaleString()} bytes</div>
            <div className="text-muted-foreground mt-1">{result.note}</div>
          </div>
        )}
        {result && !result.ok && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Upload failed: {result.error}
          </div>
        )}
      </div>
    </Card>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">SND Simple</h1>
          <p className="text-sm text-muted-foreground">Local legal research bridge</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <HealthCheckCard />
        <AskSndCard />
        <UploadDocCard />
        <RecordAudioCard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4 text-center text-xs text-muted-foreground">
        SND Simple v1.0 — FastAPI + React subprocess bridge
      </footer>
    </div>
  )
}

export default App
