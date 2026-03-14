import React, { type HTMLAttributes, type PropsWithChildren } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<PropsWithChildren<CardProps>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      {...props}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
};
