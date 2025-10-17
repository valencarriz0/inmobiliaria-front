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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Limpia el error al escribir
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El formato del correo no es válido.";

    if (!formData.password)
      newErrors.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 6)
      newErrors.password = "Debe tener al menos 6 caracteres.";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Debe confirmar la contraseña.";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";

    if (!formData.nombre)
      newErrors.nombre = "El nombre o razón social es obligatorio.";

    if (!formData.cuit) newErrors.cuit = "El CUIT/CUIL es obligatorio.";
    else if (!/^\d{11}$/.test(formData.cuit))
      newErrors.cuit = "El CUIT/CUIL debe tener 11 números.";

    if (!formData.telefono) newErrors.telefono = "El teléfono es obligatorio.";
    else if (!/^\d+$/.test(formData.telefono))
      newErrors.telefono = "El teléfono solo debe contener números.";

    if (!formData.direccion)
      newErrors.direccion = "La dirección es obligatoria.";

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Datos enviados:", formData);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">InmuConnect</span>
          </div>
        </div>
      </header>

      {/* Botón volver */}
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
        {/* Mensaje lateral */}
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            Regístrate para comenzar a publicar tus propiedades
          </h1>
          <p className="text-muted-foreground text-lg">
            Completa el formulario con tus datos y empieza a ofrecer tus
            propiedades en nuestra plataforma.
          </p>
        </div>

        {/* Formulario */}
        <Card className="rounded-2xl bg-gray-50 dark:bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inicio de sesión */}
              <div className="space-y-3">
                <p className="font-black">Datos de Inicio de sesión</p>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repetir contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Validación */}
              <div className="space-y-3">
                <p className="font-black">Datos de validación</p>
                <div>
                  <Input
                    name="nombre"
                    placeholder="Nombre o Razón Social"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <Input
                    name="cuit"
                    placeholder="CUIT / CUIL"
                    value={formData.cuit}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.cuit && (
                    <p className="text-red-500 text-sm mt-1">{errors.cuit}</p>
                  )}
                </div>
                <div>
                  <Input
                    name="telefono"
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.telefono}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="direccion"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="bg-white"
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.direccion}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón */}
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
