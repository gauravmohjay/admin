import { Loader2 } from "lucide-react";

export function Spinner({ size = 16 }) {
  return (
    <Loader2
      size={size}
      className="animate-spin text-gray-400"
    />
  );
}
