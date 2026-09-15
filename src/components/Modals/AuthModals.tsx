import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { InputField } from "../ui/input-field";
import UserForm from "../UserForm";
import { useFormValidation } from "../../hooks/use-form-validation";
import { useUserPreview } from "../../hooks/use-user-preview";
import { validateEmail } from "../../lib/validation";
import { MOCK_USERS } from "../../data/mock/session";

export default function AuthModals() {
  const navigate = useNavigate();
  const { setUser, authDialog, setAuthDialog } = useUserPreview();
  const [login, setLogin] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState("");
  const validation = useFormValidation(() => ({
    email: validateEmail(login.email),
    password: !login.password ? "La contraseña es obligatoria." : undefined,
  }));

  function changeDialog(next: typeof authDialog) {
    setAuthDialog(next);
    setLogin({ email: "", password: "" });
    setNotice("");
    validation.resetValidation();
  }

  return (
    <>
      <Button size="sm" className="bg-accent hover:bg-accent/90 px-2 text-xs sm:px-3 sm:text-sm" onClick={() => changeDialog("login")}>Acceder</Button>
      <Dialog open={authDialog !== null} onOpenChange={(open) => { if (!open) setAuthDialog(null); }}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          {authDialog === "favorite" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">Guardá tus propiedades favoritas</DialogTitle>
                <DialogDescription className="text-center">Necesitás iniciar sesión para guardar propiedades en Favoritos.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" className="bg-accent hover:bg-accent/90" onClick={() => changeDialog("login")}>Iniciar sesión</Button>
                    <Button type="button" variant="outline" onClick={() => setAuthDialog(null)}>Cancelar</Button>
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
                  {authDialog === "register"
                    ? "Vista previa del registro. Tu cuenta todavía no se crea; los datos se descartan al recargar la página."
                    : "Completá tu correo y contraseña. El inicio de sesión todavía no está disponible."}
                </DialogDescription>
              </DialogHeader>
              {authDialog === "login" ? <>
                <form noValidate className="space-y-4" onSubmit={(event) => {
                  event.preventDefault();
                  if (!validation.validateForm(event.currentTarget)) return;
                  setNotice("El inicio de sesión aún no está disponible. Podés explorar las vistas de ejemplo sin ingresar credenciales.");
                  setLogin((previous) => ({ ...previous, password: "" }));
                  validation.resetValidation();
                }}>
                  <InputField {...validation.fieldProps("email")} label="Correo electrónico" type="email" autoComplete="email" required placeholder="tu@email.com" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} error={validation.errors.email} errorId={validation.errorId("email")} />
                  <InputField {...validation.fieldProps("password")} label="Contraseña" type="password" autoComplete="current-password" required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} error={validation.errors.password} errorId={validation.errorId("password")} />
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setNotice("La recuperación de contraseña todavía no está disponible. No se envió ningún correo.")}>Olvidé mi contraseña</Button>
                    <p>¿No estás registrado? <Button type="button" variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => changeDialog("register")}>Regístrate aquí</Button></p>
                  </div>
                  {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
                  <Button type="submit" className="w-full">Iniciar sesión</Button>
                </form>
                <details className="border-t pt-4 text-sm">
                  <summary className="cursor-pointer font-medium">Explorar vistas de ejemplo</summary>
                  <p className="my-3 text-muted-foreground">Usan datos de ejemplo y no inician una sesión real.</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["interested", "Interesado", "/HomePageLogin"],
                      ["publisher", "Publicador", "/dashboard"],
                      ["admin", "Administrador", "/admin"],
                    ] as const).map(([role, label, path]) => <Button key={role} variant="outline" size="sm" onClick={() => {
                      setUser({ ...MOCK_USERS[role] });
                      setAuthDialog(null);
                      navigate(path);
                    }}>{label}</Button>)}
                  </div>
                </details>
              </> : authDialog === "register" ? <>
                <UserForm role="interested" withPassword submitLabel="Continuar a vista previa" onSubmit={(profile) => {
                  setUser(profile);
                  setAuthDialog(null);
                  navigate("/profile");
                }} />
                <div className="text-center text-sm space-y-2">
                  <Button variant="link" className="h-auto p-0" onClick={() => changeDialog("login")}>Ya tengo cuenta: iniciar sesión</Button>
                  <p><Link className="text-primary underline underline-offset-4" to="/register" onClick={() => setAuthDialog(null)}>Quiero registrarme para publicar</Link></p>
                </div>
              </> : null}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
