const COLORS = [
  "bg-rose-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-pink-400",
  "bg-teal-400",
  "bg-orange-400",
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface CaregiverAvatarProps {
  name: string;
  size?: "sm" | "md";
}

export function CaregiverAvatar({ name, size = "sm" }: CaregiverAvatarProps) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const color = COLORS[hashName(name) % COLORS.length];
  const sizeClass = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-medium text-white shrink-0 ${color}`}
      title={name}
    >
      {initial}
    </div>
  );
}
