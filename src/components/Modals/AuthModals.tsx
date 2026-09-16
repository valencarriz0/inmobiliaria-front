import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { InputField } from "../ui/input-field";
import UserForm from "../UserForm";
import { useFormValidation } from "../../hooks/use-form-validation";
import { useAuth } from "../../hooks/use-auth";
import { validateEmail } from "../../lib/validation";
import { registrationInput } from "../../lib/user-form";
import { COMMON_REGISTRATION_DESTINATION, roleHome } from "../../lib/auth-navigation";
import { ApiError, type ApiErrorDetails } from "../../services/api";
import type { UserFormValues } from "../../types/user";

function messageFrom(error: unknown) {
  return error instanceof ApiError ? error.message : "Ocurrió un error inesperado. Intentá nuevamente.";
}

function userFormErrors(details?: ApiErrorDetails) {
  if (!details) return {};
  const fields = new Set<keyof UserFormValues>(["firstName", "lastName", "email", "phone", "password", "passwordConfirm"]);
  return Object.fromEntries(Object.entries(details).filter(([field]) => fields.has(field as keyof UserFormValues))) as Partial<Record<keyof UserFormValues, string>>;
}

export default function AuthModals() {
  const navigate = useNavigate();
  const { login: authenticate, register, authDialog, setAuthDialog } = useAuth();
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validation = useFormValidation(() => ({
    email: validateEmail(loginValues.email),
    password: !loginValues.password ? "La contraseña es obligatoria." : undefined,
  }));

  function changeDialog(next: typeof authDialog) {
    setAuthDialog(next);
    setLoginValues({ email: "", password: "" });
    setNotice("");
    setFormError("");
    setServerErrors({});
    setIsSubmitting(false);
    validation.resetValidation();
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validation.validateForm(event.currentTarget)) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      const user = await authenticate({ email: loginValues.email.trim(), password: loginValues.password });
      setLoginValues({ email: "", password: "" });
      setAuthDialog(null);
      navigate(roleHome(user.role));
    } catch (error) {
      setFormError(messageFrom(error));
      setLoginValues((previous) => ({ ...previous, password: "" }));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitRegister(values: UserFormValues) {
    setIsSubmitting(true);
    setFormError("");
    setServerErrors({});
    try {
      await register(registrationInput(values));
      setAuthDialog(null);
      navigate(COMMON_REGISTRATION_DESTINATION, { replace: true });
      return true;
    } catch (error) {
      setFormError(messageFrom(error));
      if (error instanceof ApiError) setServerErrors(userFormErrors(error.details));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button size="sm" className="bg-accent hover:bg-accent/90 px-2 text-xs sm:px-3 sm:text-sm" onClick={() => changeDialog("login")}>Acceder</Button>
      <Dialog open={authDialog !== null} onOpenChange={(open) => { if (!open) changeDialog(null); }}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          {authDialog === "favorite" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">Guardá tus propiedades favoritas</DialogTitle>
                <DialogDescription className="text-center">Debés iniciar sesión para guardar propiedades en favoritos.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" className="bg-accent hover:bg-accent/90" onClick={() => changeDialog("login")}>Iniciar sesión</Button>
                    <Button type="button" variant="outline" onClick={() => changeDialog(null)}>Cancelar</Button>
                  </div>
                  <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => changeDialog("register")}>¿No tenés cuenta? Registrate</Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">{authDialog === "register" ? "Registro" : "Inicio de sesión"}</DialogTitle>
                <DialogDescription className="text-center">
                  {authDialog === "register" ? "Creá tu cuenta para guardar propiedades y gestionar tu perfil." : "Ingresá con tu correo y contraseña."}
                </DialogDescription>
              </DialogHeader>
              {authDialog === "login" ? <>
                <form noValidate className="space-y-4" onSubmit={submitLogin}>
                  <InputField {...validation.fieldProps("email")} label="Correo electrónico" type="email" autoComplete="email" required placeholder="tu@email.com" disabled={isSubmitting} value={loginValues.email} onChange={(event) => { setLoginValues({ ...loginValues, email: event.target.value }); setFormError(""); }} error={validation.errors.email} errorId={validation.errorId("email")} />
                  <InputField {...validation.fieldProps("password")} label="Contraseña" type="password" autoComplete="current-password" required disabled={isSubmitting} value={loginValues.password} onChange={(event) => { setLoginValues({ ...loginValues, password: event.target.value }); setFormError(""); }} error={validation.errors.password} errorId={validation.errorId("password")} />
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setNotice("La recuperación de contraseña todavía no está disponible.")}>Olvidé mi contraseña</Button>
                    <p>¿No estás registrado? <Button type="button" variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => changeDialog("register")}>Registrate aquí</Button></p>
                  </div>
                  {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
                  {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Ingresando..." : "Iniciar sesión"}</Button>
                </form>
              </> : authDialog === "register" ? <>
                <UserForm role="interested" withPassword submitLabel="Crear cuenta" onSubmit={submitRegister} isSubmitting={isSubmitting} formError={formError} serverErrors={serverErrors} />
                <div className="text-center text-sm space-y-2">
                  <Button variant="link" className="h-auto p-0" onClick={() => changeDialog("login")}>Ya tengo cuenta: iniciar sesión</Button>
                  <p><Link className="text-primary underline underline-offset-4" to="/register" onClick={() => changeDialog(null)}>Quiero registrarme para publicar</Link></p>
                </div>
              </> : null}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
