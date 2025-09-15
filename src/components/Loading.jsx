export default function Loading({
  size = "large",
  text = "Carregando...",
  showText = true,
  fullScreen = true,
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
  };

  const containerClass = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
    : "flex flex-col items-center justify-center p-4";

  return (
    <div className={containerClass}>
      {/* Spinner */}
      <div className="relative">
        {/* Círculo externo */}
        <div
          className={`${sizeClasses[size]} border-4 border-primary-500/20 rounded-full`}
        ></div>

        {/* Círculo animado */}
        <div
          className={`
            ${sizeClasses[size]} 
            border-4 border-transparent border-t-primary-500 
            rounded-full animate-spin absolute top-0 left-0
          `}
        ></div>
      </div>

      {/* Texto de loading */}
      {showText && (
        <p
          className={`
          ${textSizes[size]} 
          text-foreground-muted font-medium mt-4 animate-pulse
        `}
        >
          {text}
        </p>
      )}
    </div>
  );
}
