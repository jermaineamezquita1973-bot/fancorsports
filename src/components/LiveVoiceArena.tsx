import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Sparkles, 
  AlertCircle,
  Activity,
  User,
  Zap
} from "lucide-react";

interface LiveVoiceArenaProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function LiveVoiceArena({ isOpen, onClose, onShowToast }: LiveVoiceArenaProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioPlayerRef = useRef<AudioQueuePlayer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Sound wave generator for Coach Cor's speaking state
  const [speakingWaves, setSpeakingWaves] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
    return () => {
      stopVoiceSession();
    };
  }, [isOpen]);

  // Handle Coach Cor speaking visual effect
  useEffect(() => {
    if (status !== "connected") return;
    let timer: any;
    if (isSpeaking) {
      timer = setInterval(() => {
        setSpeakingWaves(Array.from({ length: 16 }, () => Math.floor(Math.random() * 45) + 5));
      }, 100);
    } else {
      setSpeakingWaves(Array.from({ length: 16 }, () => 6));
    }
    return () => clearInterval(timer);
  }, [isSpeaking, status]);

  const startVoiceSession = async () => {
    try {
      setStatus("connecting");
      setErrorMessage(null);

      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      audioPlayerRef.current = new AudioQueuePlayer(24000);

      // 2. Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Connect Analyser Node for Live Mic Visualizer
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = inputCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // 4. Set up ScriptProcessor for capturing raw mic audio
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      // 5. Connect WebSocket to backend Live route
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        onShowToast("🎙️ Connected to Coach Cor Live Voice Arena!");
        drawMicVisualizer();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setStatus("error");
            setErrorMessage(msg.error);
            stopVoiceSession();
            return;
          }
          if (msg.audio) {
            setIsSpeaking(true);
            audioPlayerRef.current?.playChunk(msg.audio);
            
            // Clear speaking state after a short period if no audio received
            resetSpeakingTimer();
          }
          if (msg.interrupted) {
            audioPlayerRef.current?.stopAll();
            setIsSpeaking(false);
          }
        } catch (e) {
          console.error("Failed to handle live session message:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("Live WebSocket error:", e);
        setStatus("error");
        setErrorMessage("Network connection error to Live Voice service.");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        if (status === "connected") {
          setStatus("disconnected");
        }
      };

      // 6. Mic audio stream process handler
      processor.onaudioprocess = (e) => {
        if (isMuted || ws.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM and Base64 encode
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64Audio = base64ArrayBuffer(pcmBuffer);
        
        ws.send(JSON.stringify({ audio: base64Audio }));
      };

    } catch (err: any) {
      console.error("Failed to start voice connection:", err);
      setStatus("error");
      setErrorMessage(err.message || "Microphone permission was denied or is unavailable.");
      stopVoiceSession();
    }
  };

  const speakingTimerRef = useRef<any>(null);
  const resetSpeakingTimer = () => {
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 400);
  };

  const stopVoiceSession = () => {
    // Stop recording visualizers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    // Stop and Close Input Audio Context
    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch {}
      processorNodeRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    // Stop Media Stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Clean up playback engine
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.close();
      } catch {}
      audioPlayerRef.current = null;
    }

    setIsSpeaking(false);
    if (status !== "error" && status !== "connecting") {
      setStatus("disconnected");
    }
  };

  // Live Canvas Wave Visualizer for User's Mic Input
  const drawMicVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (status !== "connected" || !canvasRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "rgba(5, 5, 5, 0.4)";
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 3;
      // Glowing blue color matching brand identity
      ctx.strokeStyle = isMuted ? "#ef4444" : "#00D2FF";
      ctx.shadowBlur = 10;
      ctx.shadowColor = isMuted ? "#ef4444" : "#00D2FF";

      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    };

    draw();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    onShowToast(nextMuted ? "🎙️ Microphone Muted" : "🎙️ Microphone Active");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="relative bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-lg p-6 overflow-hidden flex flex-col justify-between h-[580px] shadow-[0_0_50px_rgba(0,210,255,0.15)]"
          >
            {/* Top high-tech glowing border decoration */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-[#00D2FF] to-indigo-600" />

            {/* Header section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-[10px] font-black text-[#00D2FF] tracking-[0.2em] uppercase">
                <Sparkles className="w-3 h-3 text-[#00D2FF]" />
                GEMINI LIVE MULTIMODAL
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coach Cor Identity Profile Banner */}
            <div className="flex flex-col items-center justify-center text-center mt-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-2xl relative z-10">
                  <User className="w-10 h-10 text-white" />
                </div>
                {/* Active audio beacon */}
                {status === "connected" && (
                  <>
                    <span className="absolute -inset-1.5 bg-[#00D2FF]/30 rounded-full animate-ping z-0" />
                    <span className="absolute -inset-3 bg-[#00D2FF]/10 rounded-full animate-pulse z-0" style={{ animationDuration: "3s" }} />
                  </>
                )}
              </div>
              <h3 className="text-xl font-black tracking-widest text-white uppercase mt-4">
                COACH COR LIVE
              </h3>
              <p className="text-zinc-500 text-xs tracking-wider uppercase font-semibold">
                Your FanCor Iconz Live Voice Guide
              </p>
            </div>

            {/* Main Interactive Visualizer & Audio Arena */}
            <div className="flex-1 my-6 bg-[#040404] border border-zinc-900/60 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {status === "connecting" && (
                <div className="flex flex-col items-center space-y-3">
                  <Activity className="w-8 h-8 text-[#00D2FF] animate-spin" />
                  <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
                    Initializing voice arena...
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center text-center p-4 space-y-3 max-w-sm">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm font-black text-red-400 tracking-wider uppercase">
                    CONNECTION FAILURE
                  </p>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    {errorMessage || "Failed to establish real-time voice channel."}
                  </p>
                  <button 
                    onClick={startVoiceSession}
                    className="mt-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full cursor-pointer transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {status === "connected" && (
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  
                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-wider font-extrabold px-1">
                    <span className="text-zinc-500 uppercase">MIC SENSITIVITY</span>
                    <span className={isSpeaking ? "text-emerald-400" : "text-blue-400"}>
                      {isSpeaking ? "● COACH COR IS SPEAKING" : "● LISTENING..."}
                    </span>
                  </div>

                  {/* Coach Cor Speaking visualizer */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    {isSpeaking ? (
                      <div className="flex items-end justify-center gap-1.5 h-24">
                        {speakingWaves.map((h, i) => (
                          <motion.span 
                            key={i} 
                            animate={{ height: `${h}%` }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-1.5 bg-gradient-to-t from-blue-600 via-[#00D2FF] to-[#00D2FF] rounded-full shadow-[0_0_10px_rgba(0,210,255,0.4)]" 
                            style={{ minHeight: "6px" }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <p className="text-zinc-300 font-black text-xs tracking-widest uppercase animate-pulse">
                          Speak Now
                        </p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                          Ask about sizes, hoodies, t-shirts, shipping
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Micro Live Waveform Display (Canvas element) */}
                  <div className="h-14 w-full bg-black/60 rounded-xl overflow-hidden border border-zinc-900/60 relative">
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full" 
                      width={400} 
                      height={56} 
                    />
                    {isMuted && (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-[9px] font-black tracking-widest text-red-500 uppercase flex items-center gap-1">
                          <MicOff className="w-3 h-3" /> MICROPHONE IS MUTED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {status === "disconnected" && (
                <div className="text-center space-y-4 max-w-xs">
                  <Zap className="w-10 h-10 text-zinc-700 mx-auto" />
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Voice connection has ended. Click reconnect to jump back inside.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions section */}
            <div className="flex items-center justify-center gap-4 py-2">
              {status === "connected" ? (
                <>
                  {/* Toggle Mute Button */}
                  <button
                    onClick={handleToggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                      isMuted 
                        ? "bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                    title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Phone Disconnect Button */}
                  <button
                    onClick={() => {
                      stopVoiceSession();
                      onClose();
                      onShowToast("☎️ Disconnected from Voice Arena.");
                    }}
                    className="bg-red-600 hover:bg-red-500 border border-red-500/30 text-white w-28 h-14 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30 text-xs font-black tracking-widest uppercase"
                    title="End Call"
                  >
                    <PhoneOff className="w-4 h-4" />
                    END CALL
                  </button>
                </>
              ) : (
                <button
                  onClick={startVoiceSession}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-blue-400/30 text-white px-8 py-3 rounded-full flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25 text-xs font-black tracking-widest uppercase animate-pulse"
                >
                  <Mic className="w-4 h-4 text-white" />
                  CONNECT COACH COR LIVE
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


// --- HIGH FIDELITY AUDIO QUEUE PLAYBACK COMPONENT FOR GEMINI LIVE ---
class AudioQueuePlayer {
  private ctx: AudioContext;
  private nextStartTime: number = 0;

  constructor(sampleRate: number = 24000) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtxClass({ sampleRate });
    this.nextStartTime = this.ctx.currentTime;
  }

  playChunk(base64Data: string) {
    try {
      // Decode base64
      const binary = atob(base64Data);
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Int16 raw PCM sample conversion to Float32 [-1.0, 1.0]
      const int16Samples = new Int16Array(buffer);
      const float32Samples = new Float32Array(int16Samples.length);
      for (let i = 0; i < int16Samples.length; i++) {
        float32Samples[i] = int16Samples[i] / 32768.0;
      }

      // Create Audio Buffer
      const audioBuffer = this.ctx.createBuffer(1, float32Samples.length, this.ctx.sampleRate);
      audioBuffer.copyToChannel(float32Samples, 0);

      // Create Buffer source
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      // Handle timing drift and sync
      if (this.nextStartTime < this.ctx.currentTime) {
        this.nextStartTime = this.ctx.currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
    } catch (err) {
      console.error("Failed to schedule audio sample chunk playback:", err);
    }
  }

  stopAll() {
    this.nextStartTime = this.ctx.currentTime;
  }

  close() {
    try {
      this.ctx.close();
    } catch {}
  }
}

// --- PCM AUDIO PROCESSING HELPERS ---
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string {
  let base64 = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    base64 += String.fromCharCode(bytes[i]);
  }
  return btoa(base64);
}
