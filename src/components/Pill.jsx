export function Pill({ children, tone = "neutral", icon: Icon }) {
  const toneClasses = {
    neutral: "text-gray-800 bg-gray-100 border-gray-200",
    scheduled: "text-blue-700 bg-blue-100 border-blue-200",
    live: "text-green-700 bg-green-100 border-green-200",
    ended: "text-gray-500 bg-gray-200 border-gray-300",
    success: "text-green-500 bg-green-100 border-green-200",
    warning: "text-yellow-600 bg-yellow-100 border-yellow-300",
    error: "text-red-600 bg-red-100 border-red-200",
    info: "text-blue-500 bg-blue-100 border-blue-200"
  };
  const base = "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border";
  const classes = `${base} ${toneClasses[tone] || toneClasses.neutral}`;
  return (
    <span className={classes}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
