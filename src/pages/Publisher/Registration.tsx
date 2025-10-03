import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function PublisherRegistrationView() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    cuit: "",
    telefono: "",
    direccion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validaciones frontend (ej. CUIT, email, etc.)
    console.log("Datos enviados:", formData);
    // TODO: Enviar al backend
    navigate("/dashboard"); // Redirigir tras éxito
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          {/* Botón Volver + Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary">
                Nombre y Logo
              </span>
            </div>
          </div>
          <div /> {/* lado derecho vacío */}
        </div>
      </header>
      <div className="container mx-auto px-4 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-md w-auto bg-transparent hover:text-black hover:bg-[#F2F6F8]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="whitespace-nowrap">Volver</span>
        </Button>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Columna izquierda: mensaje */}
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            Regístrate para comenzar a publicar tus propiedades
          </h1>
          <p className="text-muted-foreground text-lg">
            Completa el formulario con tus datos y empieza a ofrecer tus
            propiedades en nuestra plataforma.
          </p>
        </div>

        {/* Columna derecha: formulario */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección Inicio de sesión */}
              <div className="space-y-3">
                <p className="font-medium text-muted-foreground">
                  Datos de Inicio de sesión
                </p>
                <Input
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repetir contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Sección Validación */}
              <div className="space-y-3">
                <p className="font-medium text-muted-foreground">
                  Datos de validación
                </p>
                <Input
                  name="nombre"
                  placeholder="Nombre o Razón Social"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="cuit"
                  placeholder="CUIT / CUIL"
                  value={formData.cuit}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="telefono"
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="direccion"
                  placeholder="Dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Botón acción */}
              <Button type="submit" className="w-full">
                Registrarse
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
