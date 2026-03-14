import React, { type LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <label
      {...props}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-200 ${className}`}
    >
      {children}
    </label>
  );
};
