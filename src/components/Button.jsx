export default function Button({
  children,
  variant = "principal",
  size = "medium",
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-2 disabled:cursor-not-allowed";

  const variantStyles = {
    principal: `
      bg-primary-500 hover:bg-primary-600 active:bg-primary-700 
      text-foreground focus:ring-primary-500
      disabled:bg-primary-500/50 disabled:hover:bg-primary-500/50
    `,
    secundario: `
      bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 
      text-foreground focus:ring-secondary-500
      disabled:bg-secondary-500/50 disabled:hover:bg-secondary-500/50
    `,
    confirmar: `
      bg-green-600 hover:bg-green-700 active:bg-green-800 
      text-white focus:ring-green-500
      disabled:bg-green-600/50 disabled:hover:bg-green-600/50
    `,
    cancelar: `
      bg-background-light hover:bg-background-dark active:bg-background 
      text-foreground border-2 border-foreground/20 hover:border-foreground/30 
      focus:ring-primary-500
      disabled:bg-background-light/50 disabled:border-foreground/10 disabled:hover:bg-background-light/50
    `,
    transparente: `
      bg-transparent hover:bg-foreground/10 active:bg-foreground/15 
      text-foreground-muted hover:text-foreground 
      focus:ring-primary-500
      disabled:bg-transparent disabled:text-foreground-muted/50 disabled:hover:bg-transparent disabled:hover:text-foreground-muted/50
    `,
  };

  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2.5 text-base",
    large: "px-6 py-3 text-lg",
  };

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
