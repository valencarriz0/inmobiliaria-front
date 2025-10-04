import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BotonVolver = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default BotonVolver;
