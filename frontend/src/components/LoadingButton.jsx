import React from 'react';
import { Loader2 } from "lucide-react";

export default function LoadingButton({ loading, children, className = "", ...props }) {
  return (
    <button className={`btn-primary ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
