import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function DialogComponents({
  isOpen,
  onClose,
  title,
  description,
  children,
  btText1,
  btText2,
  btAction01,
  btAction02,
}) {
  const handleAction01 = () => {
    btAction01?.();
    onClose();
  };

  const handleAction02 = () => {
    btAction02?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/50 transition-opacity duration-300" />

      {/* Dialog Container */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-lg w-full bg-background-light border border-primary-500/20 rounded-2xl p-6 shadow-xl transform transition-all duration-300">
          {/* Header */}
          {title && (
            <DialogTitle className="text-xl font-semibold text-foreground mb-3">
              {title}
            </DialogTitle>
          )}

          {/* Description */}
          {description && (
            <Description className="text-foreground-muted text-sm mb-4 leading-relaxed">
              {description}
            </Description>
          )}

          {/* Content */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            {btText1 && (
              <button
                onClick={handleAction01}
                className="px-4 py-2 bg-background-light hover:bg-background-dark text-foreground border border-foreground/20 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {btText1}
              </button>
            )}
            {btText2 && (
              <button
                onClick={handleAction02}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-foreground rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {btText2}
              </button>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
