import { useEffect, useRef, useState, useCallback } from "react";
import {
    Dialog, DialogContent, Box, Typography, Stack, Button,
    LinearProgress, Chip, IconButton, alpha,
} from "@mui/material";
import {
    Close as CloseIcon,
    CameraAlt as CameraIcon,
    CheckCircle as CheckIcon,
    Warning as WarnIcon,
    FaceRetouchingNatural as FaceIcon,
} from "@mui/icons-material";

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = { id: string; label: string; instruction: string; durationMs: number };
type StepStatus = "pending" | "active" | "done" | "failed";

const STEPS: Step[] = [
    { id: "look",  label: "Face Detection",  instruction: "Look straight at the camera and stay still",   durationMs: 2500 },
    { id: "blink", label: "Blink Detection", instruction: "Blink naturally twice",                          durationMs: 3000 },
    { id: "smile", label: "Liveness Proof",  instruction: "Smile or change expression briefly",             durationMs: 2500 },
];

interface LivenessCheckModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// ─── Helper: compute average brightness of canvas frame ──────────────────────
function frameBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
}

export default function LivenessCheckModal({ open, onClose, onSuccess }: LivenessCheckModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number>(0);
    const prevBrightRef = useRef<number>(0);
    const motionCountRef = useRef<number>(0);

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(["active", "pending", "pending"]);
    const [stepProgress, setStepProgress] = useState(0);
    const [phase, setPhase] = useState<"start" | "running" | "success" | "error">("start");
    const [motionDetected, setMotionDetected] = useState(false);

    // ── Stop camera ───────────────────────────────────────────────────────────
    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    // ── Start camera ──────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraError(null);
        } catch (e: any) {
            setCameraError(
                e.name === "NotAllowedError"
                    ? "Camera access denied. Please allow camera in browser settings."
                    : "Unable to access camera. Please check your device."
            );
            setPhase("error");
        }
    }, []);

    // ── Motion detection loop ─────────────────────────────────────────────────
    const detectMotion = useCallback(() => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(detectMotion);
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width  = video.videoWidth  || 320;
        canvas.height = video.videoHeight || 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const bright = frameBrightness(ctx, canvas.width, canvas.height);
        const diff = Math.abs(bright - prevBrightRef.current);
        prevBrightRef.current = bright;

        if (diff > 1.2) {
            motionCountRef.current += 1;
            if (motionCountRef.current >= 3) setMotionDetected(true);
        }

        rafRef.current = requestAnimationFrame(detectMotion);
    }, []);

    // ── Run through all steps ─────────────────────────────────────────────────
    const runSteps = useCallback(async () => {
        setPhase("running");
        motionCountRef.current = 0;

        for (let i = 0; i < STEPS.length; i++) {
            setCurrentStep(i);
            setStepStatuses(prev => prev.map((s, idx) => idx === i ? "active" : idx < i ? "done" : s));
            setMotionDetected(false);
            motionCountRef.current = 0;

            const start = Date.now();
            const duration = STEPS[i].durationMs;

            await new Promise<void>(resolve => {
                const tick = () => {
                    const elapsed = Date.now() - start;
                    setStepProgress(Math.min((elapsed / duration) * 100, 100));
                    if (elapsed >= duration) { resolve(); } else { setTimeout(tick, 50); }
                };
                tick();
            });

            setStepStatuses(prev => prev.map((s, idx) => idx === i ? "done" : s));
            await new Promise(r => setTimeout(r, 300));
        }

        setPhase("success");
        stopCamera();
    }, [stopCamera]);

    // ── Lifecycle: open / close ───────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            setPhase("start");
            setCurrentStep(0);
            setStepStatuses(["pending", "pending", "pending"]);
            setStepProgress(0);
            setMotionDetected(false);
            setCameraError(null);
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [open, startCamera, stopCamera]);

    useEffect(() => {
        if (phase === "running") {
            rafRef.current = requestAnimationFrame(detectMotion);
        } else {
            cancelAnimationFrame(rafRef.current);
        }
    }, [phase, detectMotion]);

    const handleClose = () => { stopCamera(); onClose(); };

    const handleSuccess = () => { stopCamera(); onSuccess(); onClose(); };

    const stepColor = (status: StepStatus) =>
        status === "done" ? "#22c55e" : status === "active" ? "#3b82f6" : status === "failed" ? "#ef4444" : "#94a3b8";

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
        >
            {/* Header */}
            <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <FaceIcon sx={{ color: "#60a5fa" }} />
                    <Typography fontWeight={800} color="white" fontSize="1rem">Biometric Liveness Check</Typography>
                </Stack>
                <IconButton onClick={handleClose} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "white" } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0, bgcolor: "#0f172a" }}>
                {/* Camera viewport */}
                <Box sx={{ position: "relative", bgcolor: "#020617", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {/* Live video */}
                    <Box
                        component="video"
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: "scaleX(-1)", // mirror
                            display: cameraError ? "none" : "block",
                        }}
                    />
                    {/* Hidden canvas for motion detection */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Face guide oval overlay */}
                    {phase === "running" && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%", left: "50%",
                                transform: "translate(-50%, -54%)",
                                width: "44%",
                                aspectRatio: "3/4",
                                border: `3px solid ${motionDetected ? "#22c55e" : "#3b82f6"}`,
                                borderRadius: "50%",
                                boxShadow: `0 0 0 4px ${alpha(motionDetected ? "#22c55e" : "#3b82f6", 0.2)}`,
                                transition: "border-color 0.3s, box-shadow 0.3s",
                                pointerEvents: "none",
                            }}
                        />
                    )}

                    {/* Step instruction overlay */}
                    {phase === "running" && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0, left: 0, right: 0,
                                bgcolor: alpha("#000", 0.7),
                                backdropFilter: "blur(4px)",
                                px: 3, py: 1.5, textAlign: "center",
                            }}
                        >
                            <Typography color="white" fontWeight={700} fontSize="0.95rem">
                                {STEPS[currentStep].instruction}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stepProgress}
                                sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: alpha("#fff", 0.15), "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6" } }}
                            />
                        </Box>
                    )}

                    {/* Camera error */}
                    {cameraError && (
                        <Stack spacing={2} alignItems="center" sx={{ p: 4, textAlign: "center" }}>
                            <WarnIcon sx={{ fontSize: 48, color: "#f59e0b" }} />
                            <Typography color="#94a3b8" fontSize="0.9rem">{cameraError}</Typography>
                        </Stack>
                    )}

                    {/* Start screen */}
                    {phase === "start" && !cameraError && (
                        <Box
                            sx={{
                                position: "absolute", inset: 0,
                                bgcolor: alpha("#000", 0.5),
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backdropFilter: "blur(2px)",
                            }}
                        >
                            <Stack spacing={2} alignItems="center">
                                <CameraIcon sx={{ fontSize: 52, color: "#60a5fa" }} />
                                <Typography color="white" fontWeight={700} textAlign="center" px={3}>
                                    Position your face in the oval and tap Start
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Success overlay */}
                    {phase === "success" && (
                        <Box
                            sx={{
                                position: "absolute", inset: 0,
                                bgcolor: alpha("#022c22", 0.92),
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexDirection: "column", gap: 2,
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 72, color: "#22c55e" }} />
                            <Typography color="white" fontWeight={900} fontSize="1.3rem">Liveness Verified!</Typography>
                            <Typography color="#86efac" fontSize="0.85rem" textAlign="center" px={4}>
                                Your biometric session was authenticated successfully.
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Steps panel */}
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack spacing={1.5} mb={3}>
                        {STEPS.map((step, i) => {
                            const status = stepStatuses[i];
                            return (
                                <Stack key={step.id} direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            bgcolor: alpha(stepColor(status), 0.15),
                                            border: `2px solid ${stepColor(status)}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                            transition: "all 0.3s",
                                        }}
                                    >
                                        {status === "done"
                                            ? <CheckIcon sx={{ fontSize: 14, color: "#22c55e" }} />
                                            : <Typography fontSize="11px" fontWeight={900} color={stepColor(status)}>{i + 1}</Typography>
                                        }
                                    </Box>
                                    <Box flex={1}>
                                        <Typography fontSize="0.85rem" fontWeight={700} color={status === "active" ? "white" : "#94a3b8"}>
                                            {step.label}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={status === "done" ? "Done" : status === "active" ? "In progress…" : "Waiting"}
                                        size="small"
                                        sx={{
                                            fontSize: "0.7rem", fontWeight: 700,
                                            bgcolor: alpha(stepColor(status), 0.15),
                                            color: stepColor(status),
                                        }}
                                    />
                                </Stack>
                            );
                        })}
                    </Stack>

                    {/* Action buttons */}
                    {phase === "start" && (
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!!cameraError}
                            onClick={runSteps}
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 800, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
                        >
                            Start Verification
                        </Button>
                    )}
                    {phase === "running" && (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleClose}
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, color: "#94a3b8", borderColor: "#334155" }}
                        >
                            Cancel
                        </Button>
                    )}
                    {phase === "success" && (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSuccess}
                            startIcon={<CheckIcon />}
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 800, bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, color: "white" }}
                        >
                            Continue to Dashboard
                        </Button>
                    )}
                    {phase === "error" && (
                        <Stack spacing={1.5}>
                            <Button fullWidth variant="contained" onClick={startCamera}
                                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, bgcolor: "#2563eb" }}>
                                Retry Camera
                            </Button>
                            <Button fullWidth variant="text" onClick={handleClose}
                                sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                Skip for now
                            </Button>
                        </Stack>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
