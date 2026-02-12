import math
import re
import tkinter as tk
from dataclasses import dataclass


def _hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def _rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#%02x%02x%02x" % rgb


def _blend(c1: str, c2: str, t: float) -> str:
    r1, g1, b1 = _hex_to_rgb(c1)
    r2, g2, b2 = _hex_to_rgb(c2)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    return _rgb_to_hex((r, g, b))


@dataclass
class Theme:
    bg: str
    panel: str
    panel_text: str
    dark_btn: str
    light_btn: str
    op_btn: str
    btn_text: str
    btn_text_dark: str
    btn_text_op: str


class CalcButton(tk.Frame):
    def __init__(
        self,
        master,
        text: str,
        command,
        bg: str,
        fg: str,
        font: tuple[str, int],
        radius: int = 18,
        width: int = 72,
        height: int = 58,
    ) -> None:
        width = int(width)
        height = int(height)
        radius = int(radius)
        super().__init__(master, bg=master["bg"], bd=0, highlightthickness=0)
        self._bg = bg
        self._fg = fg
        self._command = command
        self._radius = radius
        self._width = width
        self._height = height
        self._canvas = tk.Canvas(
            self,
            width=width,
            height=height,
            bg=master["bg"],
            highlightthickness=0,
            bd=0,
        )
        self._canvas.pack(fill="both", expand=True)
        try:
            self._rect = self._rounded_rect(2, 2, width - 2, height - 2, radius, fill=bg)
        except TypeError:
            w = int(width)
            h = int(height)
            self._rect = self._canvas.create_rectangle(2, 2, w - 2, h - 2, outline="", fill=bg)
        self._text = self._canvas.create_text(
            width // 2,
            height // 2,
            text=text,
            fill=fg, 
            font=font,
        )
        self._canvas.bind("<Button-1>", self._on_press)
        self._canvas.bind("<Enter>", self._on_hover)
        self._canvas.bind("<Leave>", self._on_leave)

    def _rounded_rect(self, x1, y1, x2, y2, r, **kwargs):
        x1 = int(x1)
        y1 = int(y1)
        x2 = int(x2)
        y2 = int(y2)
        r = int(r)
        points = [
            x1 + r,
            y1,
            x2 - r,
            y1,
            x2,
            y1,
            x2,
            y1 + r,
            x2,
            y2 - r,
            x2,
            y2,
            x2 - r,
            y2,
            x1 + r,
            y2,
            x1,
            y2,
            x1,
            y2 - r,
            x1,
            y1 + r,
            x1,
            y1,
        ]
        return self._canvas.create_polygon(points, smooth=True, **kwargs)

    def _animate_fill(self, start: str, end: str, steps: int = 8, delay: int = 12):
        def step(i: int):
            t = i / steps
            self._canvas.itemconfigure(self._rect, fill=_blend(start, end, t))
            if i < steps:
                self.after(delay, step, i + 1)

        step(0)

    def _on_press(self, _event):
        brighter = _blend(self._bg, "#ffffff", 0.18)
        self._animate_fill(self._bg, brighter, steps=6, delay=10)
        self.after(80, lambda: self._animate_fill(brighter, self._bg, steps=6, delay=10))
        self.after(100, self._command)

    def _on_hover(self, _event):
        hover = _blend(self._bg, "#ffffff", 0.08)
        self._canvas.itemconfigure(self._rect, fill=hover)

    def _on_leave(self, _event):
        self._canvas.itemconfigure(self._rect, fill=self._bg)

    def update_style(self, bg: str, fg: str, panel_bg: str):
        self._bg = bg
        self._fg = fg
        self._canvas.configure(bg=panel_bg)
        self._canvas.itemconfigure(self._rect, fill=bg)
        self._canvas.itemconfigure(self._text, fill=fg)


class CalculatorApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Calculator")
        self._base_width = 780
        self._base_height = 560
        self._sci_height = 700
        self.root.geometry(f"{self._base_width}x{self._base_height}")
        self.root.resizable(False, False)

        self.dark_theme = Theme(
            bg="#0f1014",
            panel="#16181f",
            panel_text="#f5f5f7",
            dark_btn="#2a2c34",
            light_btn="#3a3c45",
            op_btn="#f5a623",
            btn_text="#f5f5f7",
            btn_text_dark="#0f1014",
            btn_text_op="#0f1014",
        )
        self.light_theme = Theme(
            bg="#f4f5f7",
            panel="#ffffff",
            panel_text="#14161c",
            dark_btn="#d8dbe2",
            light_btn="#c8ccd4",
            op_btn="#f5a623",
            btn_text="#14161c",
            btn_text_dark="#14161c",
            btn_text_op="#14161c",
        )
        self.current_theme = self.dark_theme
        self._theme_animating = False

        self.root.configure(bg=self.current_theme.bg)

        self._root_frame = tk.Frame(self.root, bg=self.current_theme.bg)
        self._root_frame.pack(fill="both", expand=True)

        self._left_frame = tk.Frame(self._root_frame, bg=self.current_theme.bg)
        self._left_frame.pack(side="left", fill="y", padx=(14, 6), pady=14)

        self._right_frame = tk.Frame(self._root_frame, bg=self.current_theme.bg)
        self._right_frame.pack(side="right", fill="both", expand=True, padx=(6, 14), pady=14)

        self._plot_panel = tk.Frame(self._left_frame, bg=self.current_theme.panel)
        self._plot_panel.pack(fill="both", expand=True)

        self._plot_header = tk.Label(
            self._plot_panel,
            text="Graph",
            bg=self.current_theme.panel,
            fg=self.current_theme.panel_text,
            font=("Bahnschrift", 16),
            anchor="w",
            padx=12,
            pady=8,
        )
        self._plot_header.pack(fill="x")

        self._plot_controls = tk.Frame(self._plot_panel, bg=self.current_theme.panel)
        self._plot_controls.pack(fill="x", padx=12, pady=(0, 8))

        self._plot_entry = tk.Entry(
            self._plot_controls,
            bg=self.current_theme.bg,
            fg=self.current_theme.panel_text,
            insertbackground=self.current_theme.panel_text,
            relief="flat",
            font=("Candara", 14),
        )
        self._plot_entry.insert(0, "sin(x)")
        self._plot_entry.pack(fill="x", pady=(0, 6))

        self._plot_range = tk.Frame(self._plot_controls, bg=self.current_theme.panel)
        self._plot_range.pack(fill="x")

        self._range_min = tk.Entry(
            self._plot_range,
            width=6,
            bg=self.current_theme.bg,
            fg=self.current_theme.panel_text,
            insertbackground=self.current_theme.panel_text,
            relief="flat",
            font=("Candara", 12),
        )
        self._range_min.insert(0, "0")
        self._range_min.pack(side="left", padx=(0, 6))

        self._range_max = tk.Entry(
            self._plot_range,
            width=6,
            bg=self.current_theme.bg,
            fg=self.current_theme.panel_text,
            insertbackground=self.current_theme.panel_text,
            relief="flat",
            font=("Candara", 12),
        )
        self._range_max.insert(0, "10")
        self._range_max.pack(side="left", padx=(0, 6))

        self._plot_button = CalcButton(
            self._plot_range,
            text="Plot",
            command=self._plot_function,
            bg=self.current_theme.light_btn,
            fg=self.current_theme.btn_text_dark,
            font=("Candara", 12),
            width=72,
            height=28,
            radius=10,
        )
        self._plot_button.pack(side="right")

        self._plot_hint = tk.Label(
            self._plot_controls,
            text="Use x. Functions: sin, cos, tan, log, ln, sqrt",
            bg=self.current_theme.panel,
            fg=self.current_theme.panel_text,
            font=("Candara", 10),
            anchor="w",
        )
        self._plot_hint.pack(fill="x", pady=(6, 0))

        self._plot_status = tk.Label(
            self._plot_panel,
            text="",
            bg=self.current_theme.panel,
            fg=self.current_theme.panel_text,
            font=("Candara", 11),
            anchor="w",
            padx=12,
            pady=6,
        )
        self._plot_status.pack(fill="x")

        self._plot_canvas = tk.Canvas(
            self._plot_panel,
            width=340,
            height=420,
            bg=self.current_theme.bg,
            highlightthickness=0,
        )
        self._plot_canvas.pack(fill="both", expand=True, padx=12, pady=(0, 12))

        self._display_frame = tk.Frame(self._right_frame, bg=self.current_theme.panel)
        self._display_frame.pack(fill="x", padx=18, pady=(18, 8))

        self._display_top = tk.Frame(self._display_frame, bg=self.current_theme.panel)
        self._display_top.pack(fill="x", padx=6, pady=(6, 0))

        self._sci_toggle = CalcButton(
            self._display_top,
            text="SCI",
            command=self._toggle_scientific,
            bg=self.current_theme.light_btn,
            fg=self.current_theme.btn_text_dark,
            font=("Candara", 12),
            width=62,
            height=28,
            radius=10,
        )
        self._sci_toggle.pack(side="left")
        self._buttons: list[CalcButton] = [self._sci_toggle]
        self._button_styles: list[str] = ["light"]

        self._display = tk.Label(
            self._display_frame,
            text="0",
            anchor="e",
            bg=self.current_theme.panel,
            fg=self.current_theme.panel_text,
            padx=14,
            pady=22,
            font=("Bahnschrift", 36),
        )
        self._display.pack(fill="x")

        self._sci_frame = tk.Frame(self.root, bg=self.current_theme.bg)
        self._scientific_visible = False

        self._buttons_frame = tk.Frame(self._right_frame, bg=self.current_theme.bg)
        self._buttons_frame.pack(fill="both", expand=True, padx=14, pady=(6, 16))

        self._buttons.append(self._plot_button)
        self._button_styles.append("light")
        self._make_scientific_buttons()
        self._make_buttons()

        self._bind_keys()

        self._value = 0.0
        self._buffer = ""
        self._pending_op: str | None = None
        self._reset_on_next = False

        self._plot_function()

    def _bind_keys(self) -> None:
        self.root.bind("<Key>", self._on_key)

    def _on_key(self, event) -> None:
        if event.char.isdigit():
            self._input_digit(event.char)
            return
        key_map = {
            ".": lambda: self._input_dot(),
            "+": lambda: self._set_op("+"),
            "-": lambda: self._set_op("-"),
            "*": lambda: self._set_op("*"),
            "/": lambda: self._set_op("/"),
            "=": self._calculate,
            "\r": self._calculate,
            "%": self._percent,
            "s": self._toggle_scientific,
            "t": self._toggle_theme,
        }
        action = key_map.get(event.char)
        if action:
            action()
        elif event.keysym == "BackSpace":
            self._backspace()

    def _make_buttons(self) -> None:
        btn_font = ("Candara", 20)
        op_font = ("Candara", 22)

        layout = [
            [("AC", self._clear, "light"), ("+/-", self._toggle_sign, "light"), ("%", self._percent, "light"), ("/", lambda: self._set_op("/"), "op")],
            [("7", lambda: self._input_digit("7"), "dark"), ("8", lambda: self._input_digit("8"), "dark"), ("9", lambda: self._input_digit("9"), "dark"), ("*", lambda: self._set_op("*"), "op")],
            [("4", lambda: self._input_digit("4"), "dark"), ("5", lambda: self._input_digit("5"), "dark"), ("6", lambda: self._input_digit("6"), "dark"), ("-", lambda: self._set_op("-"), "op")],
            [("1", lambda: self._input_digit("1"), "dark"), ("2", lambda: self._input_digit("2"), "dark"), ("3", lambda: self._input_digit("3"), "dark"), ("+", lambda: self._set_op("+"), "op")],
        ]

        for r, row in enumerate(layout):
            for c, (text, cmd, style) in enumerate(row):
                bg, fg = self._style_for(style)
                btn = CalcButton(
                    self._buttons_frame,
                    text=text,
                    command=cmd,
                    bg=bg,
                    fg=fg,
                    font=op_font if style == "op" else btn_font,
                )
                btn.grid(row=r, column=c, padx=6, pady=6)
                self._buttons.append(btn)
                self._button_styles.append(style)

        zero_bg, zero_fg = self._style_for("dark")
        zero_btn = CalcButton(
            self._buttons_frame,
            text="0",
            command=lambda: self._input_digit("0"),
            bg=zero_bg,
            fg=zero_fg,
            font=btn_font,
            width=156,
        )
        zero_btn.grid(row=4, column=0, columnspan=2, padx=6, pady=6, sticky="w")
        self._buttons.append(zero_btn)
        self._button_styles.append("dark")

        dot_bg, dot_fg = self._style_for("dark")
        dot_btn = CalcButton(
            self._buttons_frame,
            text=".",
            command=self._input_dot,
            bg=dot_bg,
            fg=dot_fg,
            font=btn_font,
        )
        dot_btn.grid(row=4, column=2, padx=6, pady=6)
        self._buttons.append(dot_btn)
        self._button_styles.append("dark")

        eq_bg, eq_fg = self._style_for("op")
        eq_btn = CalcButton(
            self._buttons_frame,
            text="=",
            command=self._calculate,
            bg=eq_bg,
            fg=eq_fg,
            font=op_font,
        )
        eq_btn.grid(row=4, column=3, padx=6, pady=6)
        self._buttons.append(eq_btn)
        self._button_styles.append("op")

        for i in range(4):
            self._buttons_frame.grid_columnconfigure(i, weight=1)

    def _make_scientific_buttons(self) -> None:
        sci_font = ("Candara", 14)
        sci_layout = [
            [("sin", lambda: self._apply_unary(math.sin), "light"), ("cos", lambda: self._apply_unary(math.cos), "light"), ("tan", lambda: self._apply_unary(math.tan), "light"), ("log", lambda: self._apply_unary(self._log10), "light"), ("ln", lambda: self._apply_unary(self._ln), "light")],
            [("sqrt", lambda: self._apply_unary(self._sqrt), "light"), ("x^2", lambda: self._apply_unary(lambda x: x * x), "light"), ("1/x", lambda: self._apply_unary(self._inv), "light"), ("pi", self._insert_pi, "light"), ("e", self._insert_e, "light")],
        ]

        for r, row in enumerate(sci_layout):
            for c, (text, cmd, style) in enumerate(row):
                bg, fg = self._style_for(style)
                btn = CalcButton(
                    self._sci_frame,
                    text=text,
                    command=cmd,
                    bg=bg,
                    fg=fg,
                    font=sci_font,
                    width=62,
                    height=44,
                    radius=14,
                )
                btn.grid(row=r, column=c, padx=5, pady=5)
                self._buttons.append(btn)
                self._button_styles.append(style)

        for i in range(5):
            self._sci_frame.grid_columnconfigure(i, weight=1)

    def _style_for(self, style: str) -> tuple[str, str]:
        theme = self.current_theme
        return self._style_for_theme(theme, style)

    def _style_for_theme(self, theme: Theme, style: str) -> tuple[str, str]:
        if style == "op":
            return theme.op_btn, theme.btn_text_op
        if style == "light":
            return theme.light_btn, theme.btn_text_dark
        return theme.dark_btn, theme.btn_text

    def _set_display(self, value: str) -> None:
        self._display.configure(text=value)
        self._animate_display()

    def _plot_function(self) -> None:
        expr = self._plot_entry.get().strip()
        if not expr:
            self._plot_status.configure(text="Enter a function.")
            return
        try:
            x_min = float(self._range_min.get().strip())
            x_max = float(self._range_max.get().strip())
        except ValueError:
            self._plot_status.configure(text="Range must be numbers.")
            return
        if x_min >= x_max:
            self._plot_status.configure(text="Range: min < max.")
            return
        self._plot_status.configure(text="")
        normalized = self._normalize_expr(expr)
        self._render_plot(normalized, x_min, x_max)

    def _normalize_expr(self, expr: str) -> str:
        expr = expr.replace("^", "**")
        pattern = re.compile(r"\b(sin|cos|tan|sqrt|log|ln)\s*([a-zA-Z0-9_.]+|\([^()]*\))")
        while True:
            new_expr = pattern.sub(r"\1(\2)", expr)
            if new_expr == expr:
                break
            expr = new_expr
        return expr

    def _safe_eval(self, expr: str, x_value: float) -> float:
        safe = {
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "sqrt": math.sqrt,
            "log": math.log10,
            "ln": math.log,
            "pi": math.pi,
            "e": math.e,
            "abs": abs,
            "x": x_value,
        }
        return float(eval(expr, {"__builtins__": {}}, safe))

    def _render_plot(self, expr: str, x_min: float, x_max: float) -> None:
        self._plot_canvas.delete("all")
        self.root.update_idletasks()
        width = max(self._plot_canvas.winfo_width(), 1)
        height = max(self._plot_canvas.winfo_height(), 1)
        steps = 400
        xs = [x_min + (x_max - x_min) * i / (steps - 1) for i in range(steps)]
        points = []
        ys = []
        for x in xs:
            try:
                y = self._safe_eval(expr, x)
            except Exception:
                points.append(None)
                continue
            if math.isfinite(y):
                points.append((x, y))
                ys.append(y)
            else:
                points.append(None)

        if not ys:
            self._plot_status.configure(text="No valid points.")
            return

        y_min = min(ys)
        y_max = max(ys)
        if y_min == y_max:
            y_min -= 1
            y_max += 1
        padding = 0.1 * (y_max - y_min)
        y_min -= padding
        y_max += padding

        def to_canvas(px: float, py: float) -> tuple[float, float]:
            x_norm = (px - x_min) / (x_max - x_min)
            y_norm = (py - y_min) / (y_max - y_min)
            return x_norm * width, height - y_norm * height

        self._plot_axes(x_min, x_max, y_min, y_max, width, height)

        last = None
        for item in points:
            if item is None:
                last = None
                continue
            cx, cy = to_canvas(item[0], item[1])
            if last is not None:
                self._plot_canvas.create_line(last[0], last[1], cx, cy, fill=self.current_theme.op_btn, width=2)
            last = (cx, cy)

    def _plot_axes(self, x_min, x_max, y_min, y_max, width, height) -> None:
        axis_color = _blend(self.current_theme.panel_text, self.current_theme.bg, 0.4)
        if x_min <= 0 <= x_max:
            x0 = (0 - x_min) / (x_max - x_min) * width
            self._plot_canvas.create_line(x0, 0, x0, height, fill=axis_color)
        if y_min <= 0 <= y_max:
            y0 = height - (0 - y_min) / (y_max - y_min) * height
            self._plot_canvas.create_line(0, y0, width, y0, fill=axis_color)

    def _animate_display(self) -> None:
        base = self.current_theme.panel
        glow = _blend(base, "#ffffff", 0.12)

        def step(i: int):
            t = i / 8
            self._display.configure(bg=_blend(glow, base, t))
            if i < 8:
                self.root.after(12, step, i + 1)

        self._display.configure(bg=glow)
        self.root.after(12, step, 1)

    def _format_value(self, value: float) -> str:
        if value == int(value):
            return str(int(value))
        text = f"{value:.10f}".rstrip("0").rstrip(".")
        return text if text else "0"

    def _clear(self) -> None:
        self._value = 0.0
        self._buffer = ""
        self._pending_op = None
        self._reset_on_next = False
        self._set_display("0")

    def _backspace(self) -> None:
        if self._reset_on_next:
            return
        self._buffer = self._buffer[:-1]
        self._set_display(self._buffer or "0")

    def _input_digit(self, digit: str) -> None:
        if self._reset_on_next:
            self._buffer = ""
            self._reset_on_next = False
        if self._buffer == "0":
            self._buffer = digit
        else:
            self._buffer += digit
        self._set_display(self._buffer)

    def _input_dot(self) -> None:
        if self._reset_on_next:
            self._buffer = ""
            self._reset_on_next = False
        if "." not in self._buffer:
            self._buffer = self._buffer or "0"
            self._buffer += "."
            self._set_display(self._buffer)

    def _toggle_sign(self) -> None:
        if not self._buffer:
            self._buffer = self._format_value(self._value)
        if self._buffer.startswith("-"):
            self._buffer = self._buffer[1:]
        else:
            self._buffer = "-" + self._buffer
        self._set_display(self._buffer)

    def _percent(self) -> None:
        if not self._buffer:
            self._buffer = self._format_value(self._value)
        try:
            value = float(self._buffer) / 100.0
            self._buffer = self._format_value(value)
            self._set_display(self._buffer)
        except ValueError:
            pass

    def _apply_unary(self, func) -> None:
        if not self._buffer:
            self._buffer = self._format_value(self._value)
        try:
            value = float(self._buffer)
            result = func(value)
            self._buffer = self._format_value(result)
            self._set_display(self._buffer)
            self._reset_on_next = True
        except (ValueError, ZeroDivisionError, OverflowError):
            self._set_display("Error")
            self._buffer = ""
            self._value = 0.0
            self._pending_op = None

    def _sqrt(self, value: float) -> float:
        if value < 0:
            raise ValueError("sqrt domain")
        return math.sqrt(value)

    def _ln(self, value: float) -> float:
        if value <= 0:
            raise ValueError("ln domain")
        return math.log(value)

    def _log10(self, value: float) -> float:
        if value <= 0:
            raise ValueError("log domain")
        return math.log10(value)

    def _inv(self, value: float) -> float:
        if value == 0:
            raise ZeroDivisionError("inv domain")
        return 1.0 / value

    def _insert_pi(self) -> None:
        self._buffer = self._format_value(math.pi)
        self._set_display(self._buffer)
        self._reset_on_next = True

    def _insert_e(self) -> None:
        self._buffer = self._format_value(math.e)
        self._set_display(self._buffer)
        self._reset_on_next = True

    def _set_op(self, op: str) -> None:
        if self._buffer:
            self._apply_pending()
        self._pending_op = op
        self._reset_on_next = True

    def _apply_pending(self) -> None:
        try:
            current = float(self._buffer) if self._buffer else self._value
        except ValueError:
            current = self._value
        if self._pending_op is None:
            self._value = current
        else:
            if self._pending_op == "+":
                self._value += current
            elif self._pending_op == "-":
                self._value -= current
            elif self._pending_op == "*":
                self._value *= current
            elif self._pending_op == "/":
                if current == 0:
                    self._set_display("Error")
                    self._value = 0.0
                    self._buffer = ""
                    self._pending_op = None
                    return
                self._value /= current
        self._buffer = ""
        self._set_display(self._format_value(self._value))

    def _calculate(self) -> None:
        if not self._pending_op and not self._buffer:
            return
        self._apply_pending()
        self._pending_op = None
        self._reset_on_next = True

    def _toggle_theme(self) -> None:
        if self._theme_animating:
            return
        target = self.light_theme if self.current_theme == self.dark_theme else self.dark_theme
        self._animate_theme(self.current_theme, target)

    def _toggle_scientific(self) -> None:
        if self._scientific_visible:
            self._sci_frame.pack_forget()
            self._scientific_visible = False
            self.root.geometry(f"{self._base_width}x{self._base_height}")
        else:
            self._sci_frame.pack(fill="x", padx=14, pady=(0, 6))
            self._scientific_visible = True
            self.root.geometry(f"{self._base_width}x{self._sci_height}")

    def _animate_theme(self, start: Theme, end: Theme) -> None:
        self._theme_animating = True

        def step(i: int):
            t = i / 14
            self.root.configure(bg=_blend(start.bg, end.bg, t))
            panel = _blend(start.panel, end.panel, t)
            self._root_frame.configure(bg=_blend(start.bg, end.bg, t))
            self._left_frame.configure(bg=_blend(start.bg, end.bg, t))
            self._right_frame.configure(bg=_blend(start.bg, end.bg, t))
            self._plot_panel.configure(bg=panel)
            self._plot_header.configure(bg=panel, fg=_blend(start.panel_text, end.panel_text, t))
            self._plot_controls.configure(bg=panel)
            self._plot_range.configure(bg=panel)
            self._plot_hint.configure(bg=panel, fg=_blend(start.panel_text, end.panel_text, t))
            self._plot_status.configure(bg=panel, fg=_blend(start.panel_text, end.panel_text, t))
            self._plot_canvas.configure(bg=_blend(start.bg, end.bg, t))
            self._display_frame.configure(bg=panel)
            self._display_top.configure(bg=panel)
            self._display.configure(bg=panel, fg=_blend(start.panel_text, end.panel_text, t))
            self._buttons_frame.configure(bg=_blend(start.bg, end.bg, t))
            self._sci_frame.configure(bg=_blend(start.bg, end.bg, t))

            for btn, style in zip(self._buttons, self._button_styles, strict=False):
                start_bg, start_fg = self._style_for_theme(start, style)
                end_bg, end_fg = self._style_for_theme(end, style)
                btn.update_style(
                    bg=_blend(start_bg, end_bg, t),
                    fg=_blend(start_fg, end_fg, t),
                    panel_bg=_blend(start.bg, end.bg, t),
                )

            if i < 14:
                self.root.after(16, step, i + 1)
            else:
                self.current_theme = end
                self._refresh_button_colors()
                self._apply_plot_theme()
                self._plot_function()
                self._theme_animating = False

        step(0)

    def _refresh_button_colors(self) -> None:
        theme = self.current_theme
        for btn, style in zip(self._buttons, self._button_styles, strict=False):
            if style == "op":
                btn.update_style(theme.op_btn, theme.btn_text_op, theme.bg)
            elif style == "light":
                btn.update_style(theme.light_btn, theme.btn_text_dark, theme.bg)
            else:
                btn.update_style(theme.dark_btn, theme.btn_text, theme.bg)

    def _apply_plot_theme(self) -> None:
        theme = self.current_theme
        self._plot_panel.configure(bg=theme.panel)
        self._plot_header.configure(bg=theme.panel, fg=theme.panel_text)
        self._plot_controls.configure(bg=theme.panel)
        self._plot_range.configure(bg=theme.panel)
        self._plot_hint.configure(bg=theme.panel, fg=theme.panel_text)
        self._plot_status.configure(bg=theme.panel, fg=theme.panel_text)
        self._plot_canvas.configure(bg=theme.bg)
        for entry in (self._plot_entry, self._range_min, self._range_max):
            entry.configure(bg=theme.bg, fg=theme.panel_text, insertbackground=theme.panel_text)


def main() -> None:
    root = tk.Tk()
    CalculatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
