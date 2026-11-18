import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import AuthModals from "../../components/Modals/AuthModals";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api";
import { resendVerification } from "../../services/authService";
import { consumePostVerificationReturn } from "../../lib/auth-flow";
import { Skeleton, SkeletonStatus } from "../../components/ui/skeleton";

export default function VerifyEmail() {
  const [params] = useSearchParams(); const token = params.get("token"); const { verifyEmail } = useAuth(); const navigate = useNavigate(); const used = useRef(false);
  const [state, setState] = useState<"loading" | "success" | "invalid" | "expired">("loading"); const [message, setMessage] = useState(""); const [email, setEmail] = useState("");
  useEffect(() => { if (!token) { setState("invalid"); return; } if (used.current) return; used.current = true; void verifyEmail(token).then(() => navigate(consumePostVerificationReturn(), { replace: true, state: { openLogin: true } }), (error) => { setState(error instanceof ApiError && error.code === "EXPIRED_VERIFICATION_TOKEN" ? "expired" : "invalid"); }); }, [token, verifyEmail, navigate]);
  const resend = async () => { try { setMessage((await resendVerification(email.trim())).message); } catch { setMessage("No se pudo reenviar el correo. Intentá nuevamente."); } };
  const title = state === "success" ? "Correo verificado correctamente. Ya podés iniciar sesión."
    : state === "expired" ? "El enlace de verificación venció." : "El enlace de verificación no es válido.";

  return (
    <div className="min-h-screen bg-background">
      <Header page="/post" />
      <main className="page-content space-y-4">
        {state === "loading" ? (
          <SkeletonStatus label="Verificando tu correo..." className="max-w-md space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </SkeletonStatus>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{title}</h1>
            {state === "success" ? <AuthModals /> : state === "expired" ? (
              <div className="max-w-md space-y-4">
                <input className="w-full rounded-md border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" aria-label="Correo electrónico" />
                <Button onClick={() => void resend()}>Reenviar correo</Button>
                {message && <p role="status">{message}</p>}
              </div>
            ) : (
              <Button asChild variant="outline"><Link to="/">Volver al inicio</Link></Button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
