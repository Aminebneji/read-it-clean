export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}

