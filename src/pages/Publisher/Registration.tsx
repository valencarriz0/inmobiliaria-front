import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { InputField } from "../../components/ui/input-field";
import { useFormValidation } from "../../hooks/use-form-validation";
import { validateEmail, validatePassword, validatePasswordConfirmation, validatePhone } from "../../lib/validation";
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

  const { errors, fieldProps, errorId, validateForm } = useFormValidation(() => ({
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validatePasswordConfirmation(formData.confirmPassword, formData.password),
    nombre: !formData.nombre.trim() ? "El nombre o razón social es obligatorio." : undefined,
    cuit: !formData.cuit.trim() ? "El CUIT/CUIL es obligatorio."
      : !/^\d{11}$/.test(formData.cuit) ? "El CUIT/CUIL debe tener 11 números, sin guiones." : undefined,
    telefono: validatePhone(formData.telefono),
    direccion: !formData.direccion.trim() ? "La dirección es obligatoria." : undefined,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm(e.currentTarget)) return;
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
            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              {/* Inicio de sesión */}
              <div className="space-y-3">
                <p className="font-black">Datos de Inicio de sesión</p>
                <div>
                  <InputField
                    {...fieldProps("email")}
                    label="Correo electrónico"
                    required
                    error={errors.email}
                    errorId={errorId("email")}
                    autoComplete="email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <InputField
                    {...fieldProps("password")}
                    label="Contraseña"
                    required
                    error={errors.password}
                    errorId={errorId("password")}
                    autoComplete="new-password"
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <InputField
                    {...fieldProps("confirmPassword")}
                    label="Repetir contraseña"
                    required
                    error={errors.confirmPassword}
                    errorId={errorId("confirmPassword")}
                    autoComplete="new-password"
                    type="password"
                    placeholder="Repetir contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Validación */}
              <div className="space-y-3">
                <p className="font-black">Datos de validación</p>
                <div>
                  <InputField
                    {...fieldProps("nombre")}
                    label="Nombre o razón social"
                    required
                    error={errors.nombre}
                    errorId={errorId("nombre")}
                    autoComplete="organization"
                    placeholder="Nombre o Razón Social"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <InputField
                    {...fieldProps("cuit")}
                    label="CUIT / CUIL"
                    required
                    error={errors.cuit}
                    errorId={errorId("cuit")}
                    inputMode="numeric"
                    placeholder="CUIT / CUIL"
                    value={formData.cuit}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <InputField
                    {...fieldProps("telefono")}
                    label="Teléfono"
                    required
                    error={errors.telefono}
                    errorId={errorId("telefono")}
                    autoComplete="tel"
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <InputField
                    {...fieldProps("direccion")}
                    label="Dirección"
                    required
                    error={errors.direccion}
                    errorId={errorId("direccion")}
                    autoComplete="street-address"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="bg-white"
                  />
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
