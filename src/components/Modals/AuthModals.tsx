import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { InputField } from "../ui/input-field";
import { useFormValidation } from "../../hooks/use-form-validation";
import { validateEmail, validateName, validatePassword, validatePasswordConfirmation } from "../../lib/validation";

export default function AuthModals() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [registration, setRegistration] = useState({ nombre: "", apellido: "", email: "", password: "", passwordConfirm: "" });

  const loginValidation = useFormValidation(() => ({
    email: validateEmail(login.email),
    password: validatePassword(login.password),
  }));
  const registerValidation = useFormValidation(() => ({
    nombre: validateName(registration.nombre, "nombre"),
    apellido: validateName(registration.apellido, "apellido"),
    email: validateEmail(registration.email),
    password: validatePassword(registration.password),
    passwordConfirm: validatePasswordConfirmation(registration.passwordConfirm, registration.password),
  }));

  const changeLoginOpen = (open: boolean) => {
    setOpenLogin(open);
    loginValidation.resetValidation();
  };
  const changeRegisterOpen = (open: boolean) => {
    setOpenRegister(open);
    registerValidation.resetValidation();
  };

  return (
    <>
      <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => changeLoginOpen(true)}>
        Acceder
      </Button>
      <Dialog open={openLogin} onOpenChange={changeLoginOpen}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Inicio de Sesión</DialogTitle>
            <DialogDescription className="text-center">Completá tu correo y contraseña para acceder.</DialogDescription>
          </DialogHeader>
          <form noValidate className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!loginValidation.validateForm(event.currentTarget)) return;
            // La autenticación real se conectará con la API.
            alert("Inicio de sesión exitoso.");
            changeLoginOpen(false);
            setLogin({ email: "", password: "" });
          }}>
            <InputField {...loginValidation.fieldProps("email")} label="Correo electrónico" type="email" autoComplete="email" required placeholder="tu@email.com" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} error={loginValidation.errors.email} errorId={loginValidation.errorId("email")} />
            <InputField {...loginValidation.fieldProps("password")} label="Contraseña" type="password" autoComplete="current-password" required placeholder="********" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} error={loginValidation.errors.password} errorId={loginValidation.errorId("password")} />
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <Button type="button" variant="link" className="p-0 h-auto text-xs">Olvidé mi contraseña</Button>
              <p>¿No estás registrado?{" "}
                <Button type="button" variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => {
                  changeLoginOpen(false);
                  changeRegisterOpen(true);
                }}>Regístrate aquí</Button>
              </p>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Iniciar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openRegister} onOpenChange={changeRegisterOpen}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Registro</DialogTitle>
            <DialogDescription className="text-center">Completá todos los campos para crear tu cuenta.</DialogDescription>
          </DialogHeader>
          <form noValidate className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!registerValidation.validateForm(event.currentTarget)) return;
            // El registro real se conectará con la API.
            alert("Registro exitoso.");
            changeRegisterOpen(false);
            setRegistration({ nombre: "", apellido: "", email: "", password: "", passwordConfirm: "" });
          }}>
            {([
              { name: "nombre", label: "Nombre", type: "text", autoComplete: "given-name", placeholder: "Tu nombre" },
              { name: "apellido", label: "Apellido", type: "text", autoComplete: "family-name", placeholder: "Tu apellido" },
              { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", placeholder: "tu@email.com" },
              { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password", placeholder: "Al menos 6 caracteres" },
              { name: "passwordConfirm", label: "Repetir contraseña", type: "password", autoComplete: "new-password", placeholder: "Repetí tu contraseña" },
            ] as const).map((field) => (
              <InputField key={field.name} {...registerValidation.fieldProps(field.name)} label={field.label} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} required value={registration[field.name]} onChange={(event) => setRegistration({ ...registration, [field.name]: event.target.value })} error={registerValidation.errors[field.name]} errorId={registerValidation.errorId(field.name)} />
            ))}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Registrarse</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
