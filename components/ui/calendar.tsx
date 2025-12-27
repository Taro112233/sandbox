// components/ui/calendar.tsx
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: "ghost" | "outline" | "default"
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-default-50 group/calendar rounded-2xl p-4 shadow-md [--cell-size:--spacing(9)]",
        "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-6 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-5", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-2 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-xl hover:bg-default-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-xl hover:bg-default-100",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-semibold justify-center h-(--cell-size) gap-2",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-primary border-2 border-default-200 shadow-sm has-focus:ring-primary/20 has-focus:ring-2 rounded-xl",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-default-50 inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-default-900",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-xl pl-3 pr-2 flex items-center gap-2 text-sm h-9 [&>svg]:text-default-500 [&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-default-500 rounded-lg flex-1 font-medium text-xs select-none uppercase tracking-wide",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1.5", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs select-none text-default-500 font-medium",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0.5 text-center [&:last-child[data-selected=true]_button]:rounded-r-xl group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-xl"
            : "[&:first-child[data-selected=true]_button]:rounded-l-xl",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-xl bg-primary/10",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-primary/5", defaultClassNames.range_middle),
        range_end: cn("rounded-r-xl bg-primary/10", defaultClassNames.range_end),
        today: cn(
          "border-2 border-primary bg-transparent text-primary font-semibold rounded-lg data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-default-400 aria-selected:text-default-400",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-default-300 opacity-50 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-white data-[selected-single=true]:shadow-md data-[selected-single=true]:shadow-primary/20",
        "data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-primary",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-white data-[range-start=true]:shadow-md data-[range-start=true]:shadow-primary/20",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-white data-[range-end=true]:shadow-md data-[range-end=true]:shadow-primary/20",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary/30",
        "hover:bg-default-100 dark:hover:bg-default-200 dark:hover:text-default-900",
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-medium rounded-lg",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",
        "data-[range-end=true]:rounded-lg data-[range-end=true]:rounded-r-xl",
        "data-[range-middle=true]:rounded-none",
        "data-[range-start=true]:rounded-lg data-[range-start=true]:rounded-l-xl",
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }