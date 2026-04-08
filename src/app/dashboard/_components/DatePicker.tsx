"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ dateStr }: { dateStr: string }) {
  const date = new Date(`${dateStr}T00:00:00`);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={buttonVariants({ variant: "outline" }) + " gap-2"}
      >
        <CalendarIcon className="h-4 w-4 text-zinc-500" />
        {format(date, "do MMM yyyy")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="bottom" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
              router.refresh();
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
