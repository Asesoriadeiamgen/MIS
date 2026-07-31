"use client";

import { useState } from "react";
import { INPUT } from "@/lib/ui";

export default function PriceField(props: {
  name: string;
  defaultValue?: number | null;
  placeholder?: string;
}) {
  const [onRequest, setOnRequest] = useState(props.defaultValue === null);

  return (
    <div>
      <input
        name={props.name}
        type="number"
        step="0.01"
        placeholder={props.placeholder || "Precio"}
        defaultValue={props.defaultValue ?? ""}
        required={!onRequest}
        disabled={onRequest}
        className={`${INPUT} disabled:bg-gray-100 disabled:text-gray-400`}
      />
      <label className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
        <input
          type="checkbox"
          name={`${props.name}_on_request`}
          checked={onRequest}
          onChange={(e) => setOnRequest(e.target.checked)}
        />
        Precio a consultar
      </label>
    </div>
  );
}
