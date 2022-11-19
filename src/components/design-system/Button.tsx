import clsx from "clsx";
import Link from "next/link";
import { ReactNode, useRef } from "react";
import { AriaButtonProps, useButton } from "react-aria";
import { PulseLoader } from "react-spinners";
import { match } from "ts-pattern";

import { Icon, IconName } from "./Icon";

export interface ButtonProps extends Pick<AriaButtonProps<"button">, "isDisabled" | "onPress"> {
  className?: string;
  /** @default "mr-black" */
  color?:
    | "mr-black"
    | "mr-navy"
    | "mr-sky-blue"
    | "mr-lime"
    | "mr-yellow"
    | "mr-white"
    | "mr-lilac"
    | "mr-pink"
    | "mr-hot-pink"
    | "mr-orange";
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  text?: ReactNode;
  /** @default "default" */
  style?: "default" | "minimal";
  rounded?: boolean;
  fill?: boolean;
  children?: ReactNode;
  submit?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
}

export const Button = (props: ButtonProps) => {
  const {
    className,
    color,
    leftIcon,
    rightIcon,
    size,
    text,
    style,
    rounded,
    fill,
    children,
    submit,
    disabled,
    loading,
    href,
  } = props;

  const buttonRef = useRef(null);
  const { buttonProps: ariaButtonProps } = useButton(props, buttonRef);

  const hasContent = !!text || !!children;

  // Match explicitly on colors in here rather than doing anything clever so that Tailwind doesn't purge classes
  const buttonElem = (
    <button
      {...ariaButtonProps}
      type={submit ? "submit" : "button"}
      className={clsx(
        "flex items-center justify-center rounded px-3 py-1.5 focus:outline-none",
        rounded && "rounded-md",
        fill && "w-full",
        style === "minimal" && [
          "bg-transparent",
          "border",
          match(color)
            .with("mr-navy", () => "border-mr-navy text-mr-navy hover:bg-mr-black")
            .with("mr-sky-blue", () => "border-mr-sky-blue text-mr-sky-blue hover:bg-mr-black")
            .with("mr-lime", () => "border-mr-lime text-mr-lime hover:bg-mr-black")
            .with("mr-yellow", () => "border-mr-yellow text-mr-yellow hover:bg-mr-black")
            .with("mr-white", () => "border-mr-white text-mr-white hover:bg-mr-black")
            .with("mr-lilac", () => "border-mr-lilac text-mr-lilac hover:bg-mr-black")
            .with("mr-pink", () => "border-mr-pink text-mr-pink hover:bg-mr-black")
            .with("mr-hot-pink", () => "border-mr-hot-pink text-mr-hot-pink hover:bg-mr-black")
            .with("mr-orange", () => "border-mr-orange text-mr-orange hover:bg-mr-black")
            .otherwise(() => "border-mr-black text-mr-black hover:bg-mr-black hover:text-mr-white"),
        ],
        (style === "default" || style === undefined) &&
          match(color)
            .with("mr-navy", () => "bg-mr-navy text-mr-white")
            .with("mr-sky-blue", () => "bg-mr-sky-blue text-mr-black")
            .with("mr-lime", () => "bg-mr-lime text-mr-black")
            .with("mr-yellow", () => "bg-mr-yellow text-mr-black")
            .with("mr-white", () => "bg-mr-white text-mr-black")
            .with("mr-lilac", () => "bg-mr-lilac text-mr-black")
            .with("mr-pink", () => "bg-mr-pink text-mr-black")
            .with("mr-hot-pink", () => "bg-mr-hot-pink text-mr-black")
            .with("mr-orange", () => "bg-mr-orange text-mr-black")
            .otherwise(() => "bg-mr-black text-mr-white"),
        match(size)
          .with("sm", () => "h-8 px-1 text-sm font-semibold")
          .with("lg", () => "h-12 px-5 py-3 text-lg font-semibold")
          .otherwise(() => "h-12 px-3 text-base font-semibold"),
        "active:opacity-75",
        (disabled || loading) && "pointer-events-none cursor-not-allowed opacity-30",
        className,
      )}
      ref={buttonRef}
    >
      {loading && (
        <div
          className={clsx(
            "flex items-center",
            match(size)
              .with("sm", () => "mr-2")
              .with("lg", () => "mr-6")
              .otherwise(() => "mr-3"),
          )}
        >
          <PulseLoader color={!color || color === "mr-black" ? "#FFFFFF" : "#000000"} size={12} />
        </div>
      )}
      {leftIcon && (
        <Icon
          iconName={leftIcon}
          className={
            hasContent
              ? match(size)
                  .with("sm", () => "mr-0.5")
                  .with("lg", () => "mr-2")
                  .otherwise(() => "mr-1")
              : undefined
          }
        />
      )}
      <span>{text}</span>
      {children}
      {rightIcon && (
        <Icon
          iconName={rightIcon}
          className={
            hasContent
              ? match(size)
                  .with("sm", () => "ml-0.5")
                  .with("lg", () => "ml-2")
                  .otherwise(() => "ml-1")
              : undefined
          }
        />
      )}
    </button>
  );

  return href ? <Link href={href}>{buttonElem}</Link> : buttonElem;
};

export default Button;
