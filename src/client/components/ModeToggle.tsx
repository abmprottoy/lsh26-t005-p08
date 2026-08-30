import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-context";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const nextTheme = dark ? "light" : "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} theme`}
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Use {nextTheme} theme</TooltipContent>
    </Tooltip>
  );
}
