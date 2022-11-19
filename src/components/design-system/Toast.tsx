import { MouseEventHandler, useEffect } from "react";

import { Icon, IconName } from "./Icon";

type ToastProps = {
  message: string;
  type: "info" | "success" | "error";
  onClear?: MouseEventHandler;
  clearAfter?: number; // in seconds
};

const ICON_MAP: { [type: string]: IconName } = {
  info: "InfoCircled",
  success: "Check",
  error: "Cross2",
};

const COLOR_MAP: { [type: string]: string } = {
  info: "text-blue-500 bg-blue-100",
  success: "text-green-500 bg-green-100",
  error: "text-red-500 bg-red-100",
};

export const Toast = ({ message, type, onClear, clearAfter = 30 }: ToastProps) => {
  useEffect(() => {
    if (clearAfter && onClear) {
      setTimeout(onClear, clearAfter * 1000);
    }
  }, []);

  return (
    <div
      className="fixed top-0 left-1/2 z-50 my-4 flex w-full max-w-md -translate-x-1/2 items-center rounded-lg bg-gray-800 p-4 text-gray-300 shadow"
      role="alert"
    >
      <div className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${COLOR_MAP[type]}`}>
        <Icon iconName={ICON_MAP[type]} className="h-6 w-6" />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        onClick={onClear}
        type="button"
        className="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-700"
      >
        <Icon iconName="Cross2" className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Toast;
