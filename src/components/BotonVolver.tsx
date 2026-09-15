import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BotonVolver = ({ to }: { to?: string }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (to) navigate(to);
          else if (window.history.state?.idx > 0) navigate(-1);
          else navigate("/");
        }}
        className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-md w-auto bg-transparent hover:text-black hover:bg-[#F2F6F8]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="whitespace-nowrap">Volver</span>
      </Button>
    </div>
  );
};

export default BotonVolver;
