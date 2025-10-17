import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AuthModals() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  // Estados del login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Estados del registro
  const [regNombre, setRegNombre] = useState("");
  const [regApellido, setRegApellido] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});

  // Función para validar email
  const emailRegex = /^\S+@\S+\.\S+$/;

  return (
    <>
      {/* Botón en Header que abre Login */}
      <Button
        size="sm"
        className="bg-accent hover:bg-accent/90"
        onClick={() => setOpenLogin(true)}
      >
        Acceder
      </Button>

      {/* ------------------- MODAL LOGIN ------------------- */}
      <Dialog open={openLogin} onOpenChange={setOpenLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Inicio de Sesión
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-white dark:bg-input/30"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              {loginErrors.email && (
                <p className="text-sm text-red-600 mt-1">{loginErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="bg-white dark:bg-input/30"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {loginErrors.password}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <Button variant="link" className="p-0 h-auto text-xs">
                Olvidé mi contraseña
              </Button>
              <p>
                ¿No estás registrado?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenLogin(false);
                    setOpenRegister(true);
                  }}
                >
                  Regístrate aquí
                </Button>
              </p>
            </div>

            {/* Botón Iniciar */}
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => {
                const errors: typeof loginErrors = {};

                if (!loginEmail.trim() || !emailRegex.test(loginEmail)) {
                  errors.email = "Ingrese un correo electrónico válido.";
                }
                if (!loginPassword.trim() || loginPassword.length < 6) {
                  errors.password =
                    "La contraseña debe tener al menos 6 caracteres.";
                }

                setLoginErrors(errors);

                if (Object.keys(errors).length === 0) {
                  // Aquí iría la lógica real de login (API, supabase, etc.)
                  console.log("Inicio de sesión:", {
                    email: loginEmail,
                    password: loginPassword,
                  });
                  alert("Inicio de sesión exitoso.");
                  setOpenLogin(false);
                  setLoginEmail("");
                  setLoginPassword("");
                }
              }}
            >
              Iniciar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------- MODAL REGISTRO ------------------- */}
      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Registro
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                className="bg-white dark:bg-input/30"
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
              />
              {regErrors.nombre && (
                <p className="text-sm text-red-600 mt-1">{regErrors.nombre}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                placeholder="Tu apellido"
                className="bg-white dark:bg-input/30"
                value={regApellido}
                onChange={(e) => setRegApellido(e.target.value)}
              />
              {regErrors.apellido && (
                <p className="text-sm text-red-600 mt-1">
                  {regErrors.apellido}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-white dark:bg-input/30"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              {regErrors.email && (
                <p className="text-sm text-red-600 mt-1">{regErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="bg-white dark:bg-input/30"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              {regErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {regErrors.password}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <Label htmlFor="passwordConfirm">Repetir contraseña</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="********"
                className="bg-white dark:bg-input/30"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
              />
              {regErrors.passwordConfirm && (
                <p className="text-sm text-red-600 mt-1">
                  {regErrors.passwordConfirm}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => {
                const errors: typeof regErrors = {};

                // Expresión regular: solo letras (mayúsculas, minúsculas y acentos), y espacios
                const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

                if (!regNombre.trim() || regNombre.length < 2) {
                  errors.nombre =
                    "Ingrese un nombre válido (mínimo 2 caracteres).";
                } else if (!soloLetras.test(regNombre)) {
                  errors.nombre = "El nombre solo puede contener letras.";
                }

                if (!regApellido.trim() || regApellido.length < 2) {
                  errors.apellido =
                    "Ingrese un apellido válido (mínimo 2 caracteres).";
                } else if (!soloLetras.test(regApellido)) {
                  errors.apellido = "El apellido solo puede contener letras.";
                }

                if (!emailRegex.test(regEmail)) {
                  errors.email = "Ingrese un correo electrónico válido.";
                }

                if (regPassword.length < 6) {
                  errors.password =
                    "La contraseña debe tener al menos 6 caracteres.";
                }

                if (regPasswordConfirm !== regPassword) {
                  errors.passwordConfirm = "Las contraseñas no coinciden.";
                }

                setRegErrors(errors);

                if (Object.keys(errors).length === 0) {
                  console.log("Registro:", {
                    nombre: regNombre,
                    apellido: regApellido,
                    email: regEmail,
                  });
                  alert("Registro exitoso.");
                  setOpenRegister(false);
                  setRegNombre("");
                  setRegApellido("");
                  setRegEmail("");
                  setRegPassword("");
                  setRegPasswordConfirm("");
                }
              }}
            >
              Registrarse
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
