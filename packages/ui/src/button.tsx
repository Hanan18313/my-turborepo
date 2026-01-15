"use client";

import { ReactNode } from "react";
import { add } from "@repo/math";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  onClick?: () => void;
}

export const Button = ({ children, className, appName, onClick }: ButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      alert(`Hello from your ${appName} app!`);
      console.log(add(1, 2));
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
