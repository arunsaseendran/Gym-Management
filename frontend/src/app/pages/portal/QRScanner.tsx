import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  QrCode, CheckCircle2, AlertCircle, User,
  Clock, Scan, Shield, RotateCcw, Hash,
} from "lucide-react";
import { api } from "../../store/api";

const DISPLAY = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

type ScanResult = {
  success: boolean;
  member_name?: string;
  status?: string;
  time?: string;
  slot?: string;
  error?: string;
};

export default function QRScanner() {
  const [userId, setUserId]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ScanResult | null>(null);
  const [history, setHistory]   = useState<ScanResult[]>([]);

  const handleScan = async () => {
    const id = parseInt(userId.trim());
    if (!id || isNaN(id)) {
      setResult({ success: false, error: "Please enter a valid numeric User ID." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await api.attendance.qrCheckin(id);
      const res: ScanResult = {
        success: true,
        member_name: data.member_name,
        status: data.status,
        time: data.time,
        slot: data.slot,
      };
      setResult(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
      setUserId("");
    } catch (e: any) {
      const res: ScanResult = { success: false, error: e.message };
      setResult(res);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleScan(); };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="page-header-label mb-1">Attendance</div>
        <h1 className="text-4xl font-black" style={DISPLAY}>QR ATTENDANCE SCANNER</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the member's User ID from their QR code to mark check-in.
        </p>
      </div>

      {/* Scanner card */}
      <div className="card-base p-8">
        <div className="flex flex-col items-center gap-6">
          {/* QR icon display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl border-2 border-amber-500/40 flex items-center justify-center bg-amber-500/5"
              style={{ boxShadow: "0 0 40px rgba(245,158,11,0.15)" }}>
              <QrCode className="w-16 h-16 text-amber-400" />
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-background/60 backdrop-blur-sm">
                <div className="spinner" />
              </div>
            )}
          </div>

          <div className="w-full max-w-sm space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block text-center">
              Member User ID
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter User ID (e.g. 2)"
                className="input-base pl-10 text-center text-lg font-bold"
                autoFocus
              />
            </div>
            <button
              onClick={handleScan}
              disabled={loading || !userId.trim()}
              className="btn-primary w-full py-3.5 text-base"
              style={{ boxShadow: "0 0 28px rgba(245,158,11,0.25)" }}
            >
              {loading
                ? <><span className="spinner w-5 h-5 border-2 border-black/30 border-t-black" /> Scanning…</>
                : <><Scan className="w-5 h-5" /> Check In Member</>}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={`card-base p-6 border-2 ${
              result.success ? "border-emerald-500/30" : "border-destructive/30"
            }`}
          >
            {result.success ? (
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Check-in Successful</div>
                  <div className="text-2xl font-black mb-3" style={DISPLAY}>{result.member_name}</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Shield,    label: "Status", val: result.status },
                      { icon: Clock,     label: "Time",   val: result.time },
                      { icon: QrCode,    label: "Slot",   val: result.slot || "No slot" },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                        <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{label}</div>
                        <div className={`text-sm font-bold capitalize mt-0.5 ${
                          label === "Status"
                            ? val === "present" ? "text-emerald-400" : "text-amber-400"
                            : "text-foreground"
                        }`}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-bold text-destructive uppercase tracking-widest mb-1">Check-in Failed</div>
                  <div className="text-sm text-foreground/80">{result.error}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2"><RotateCcw className="w-5 h-5 text-amber-400" /> Recent Scans</h3>
            <button onClick={() => setHistory([])} className="btn-ghost py-1.5 px-3 text-xs">Clear</button>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                h.success ? "border-emerald-500/15 bg-emerald-500/5" : "border-destructive/15 bg-destructive/5"
              }`}>
                <div className="flex items-center gap-3">
                  {h.success
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <div>
                    <div className="text-sm font-semibold">{h.success ? h.member_name : "Failed"}</div>
                    {h.success && <div className="text-xs text-muted-foreground">{h.slot} · {h.time}</div>}
                    {!h.success && <div className="text-xs text-muted-foreground">{h.error?.slice(0, 50)}</div>}
                  </div>
                </div>
                <span className={`badge ${h.success ? h.status === "present" ? "badge-green" : "badge-amber" : "badge-red"}`}>
                  {h.success ? h.status : "error"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="card-base p-5 border-amber-500/15">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">How It Works</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Each approved member has a unique QR code containing their User ID</li>
              <li>• Enter the User ID shown on their QR code or scan result</li>
              <li>• System verifies membership status and marks attendance</li>
              <li>• Check-ins after 10 AM are automatically marked as "late"</li>
              <li>• Only active, approved members can check in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
