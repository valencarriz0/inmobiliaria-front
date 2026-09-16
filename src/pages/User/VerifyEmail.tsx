import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import AuthModals from "../../components/Modals/AuthModals";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api";
import { resendVerification } from "../../services/authService";
import { consumePostVerificationReturn } from "../../lib/auth-flow";

export default function VerifyEmail() {
  const [params] = useSearchParams(); const token = params.get("token"); const { verifyEmail } = useAuth(); const navigate = useNavigate(); const used = useRef(false);
  const [state, setState] = useState<"loading" | "success" | "invalid" | "expired">("loading"); const [message, setMessage] = useState(""); const [email, setEmail] = useState("");
  useEffect(() => { if (!token) { setState("invalid"); return; } if (used.current) return; used.current = true; void verifyEmail(token).then(() => navigate(consumePostVerificationReturn(), { replace: true, state: { openLogin: true } }), (error) => { setState(error instanceof ApiError && error.code === "EXPIRED_VERIFICATION_TOKEN" ? "expired" : "invalid"); }); }, [token, verifyEmail, navigate]);
  const resend = async () => { try { setMessage((await resendVerification(email.trim())).message); } catch { setMessage("No se pudo reenviar el correo. Intentá nuevamente."); } };
  return <div className="min-h-screen bg-background"><Header page="/post" /><main className="grid min-h-[calc(100vh-4rem)] place-items-center p-4"><Card className="w-full max-w-md"><CardHeader><CardTitle>{state === "loading" ? "Verificando tu correo..." : state === "success" ? "Correo verificado correctamente. Ya podés iniciar sesión." : state === "expired" ? "El enlace de verificación venció." : "El enlace de verificación no es válido."}</CardTitle></CardHeader><CardContent className="space-y-4">{state === "success" ? <AuthModals /> : state === "expired" ? <><input className="w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" /><Button onClick={() => void resend()}>Reenviar correo</Button>{message && <p role="status">{message}</p>}</> : <Button asChild variant="outline"><Link to="/">Volver al inicio</Link></Button>}</CardContent></Card></main></div>;
}
