import clsx from "clsx";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps {
  className?: string;
  children?: ReactNode;
  rounded?: boolean;
}

export const Card = ({ children, className, rounded }: CardProps) => {
  return <div className={twMerge(clsx("border px-4 py-3", className, rounded && "rounded-2xl"))}>{children}</div>;
};

export default Card;
