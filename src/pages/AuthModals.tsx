import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function AuthModals() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

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

      {/* Modal Inicio de Sesión */}
      <Dialog open={openLogin} onOpenChange={setOpenLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Inicio de Sesión
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
              />
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

            {/* Action */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Iniciar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Registro */}
      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Registro
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Tu nombre" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" placeholder="Tu apellido" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passwordConfirm">Repetir contraseña</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="********"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Registrarse
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
