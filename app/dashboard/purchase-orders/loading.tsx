import { Loader2 } from "lucide-react";

export default function PurchaseOrdersLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

