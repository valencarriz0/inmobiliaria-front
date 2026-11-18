import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";
import { InputField } from "../../components/ui/input-field";
import { validatePassword, validatePasswordConfirmation } from "../../lib/validation";
import { resetPassword } from "../../services/authService";
import { ApiError } from "../../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validatePassword(password) || validatePasswordConfirmation(confirm, password);
    if (!token || error) {
      setMessage(error ?? "El enlace para restablecer la contraseña no es válido o ya fue utilizado.");
      return;
    }
    setSending(true);
    try {
      setMessage((await resetPassword({ token, password, passwordConfirm: confirm })).message);
    } catch (error) {
      setMessage(error instanceof ApiError && error.code === "EXPIRED_RESET_TOKEN"
        ? "El enlace para restablecer la contraseña venció."
        : error instanceof ApiError && error.code === "INVALID_RESET_TOKEN"
          ? "El enlace para restablecer la contraseña no es válido o ya fue utilizado."
          : "No se pudo restablecer la contraseña. Intentá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header page="/post" />
      <main className="page-content space-y-4">
        <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
        {message === "Tu contraseña fue restablecida correctamente." ? (
          <Button asChild><Link to="/">Iniciar sesión</Link></Button>
        ) : (
          <form className="max-w-md space-y-4" onSubmit={submit}>
            <InputField id="new-password" errorId="new-password-error" label="Nueva contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <InputField id="new-password-confirm" errorId="new-password-confirm-error" label="Repetir nueva contraseña" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
            {message && <p role="alert">{message}</p>}
            <Button disabled={sending}>{sending ? "Enviando..." : "Restablecer contraseña"}</Button>
          </form>
        )}
      </main>
    </div>
  );
}
