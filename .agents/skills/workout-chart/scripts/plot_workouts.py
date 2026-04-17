#!/usr/bin/env python3
"""
Query workout entries for the past 12 months and export a monthly bar chart as a PNG.

Usage:
    python plot_workouts.py [output_path]

DATABASE_URL is read from the environment or from a .env file in the working directory.
"""

import sys
import os
import subprocess
from datetime import datetime


# ---------------------------------------------------------------------------
# Dependency bootstrap
# ---------------------------------------------------------------------------

def _ensure(pip_name: str, import_name: str) -> None:
    try:
        __import__(import_name)
    except ImportError:
        print(f"Installing {pip_name}...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pip_name],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


_ensure("psycopg2-binary", "psycopg2")
_ensure("matplotlib", "matplotlib")

import psycopg2                   # noqa: E402
import matplotlib                 # noqa: E402
matplotlib.use("Agg")             # non-interactive backend, works without a display
import matplotlib.pyplot as plt   # noqa: E402
import matplotlib.ticker as ticker  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_database_url() -> str | None:
    """Return DATABASE_URL from the environment, falling back to a .env file."""
    url = os.environ.get("DATABASE_URL")
    if url:
        return url

    env_path = os.path.join(os.getcwd(), ".env")
    if os.path.exists(env_path):
        with open(env_path) as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    return line[len("DATABASE_URL="):].strip().strip('"').strip("'")

    return None


def past_12_months() -> list[tuple[int, int]]:
    """Return (year, month) tuples for the 12 months ending this month, oldest first."""
    now = datetime.now()
    year, month = now.year, now.month
    result = []
    for offset in range(11, -1, -1):
        m = month - offset
        y = year
        while m <= 0:
            m += 12
            y -= 1
        result.append((y, m))
    return result


def fetch_monthly_counts(database_url: str) -> dict[tuple[int, int], int]:
    """Query the workouts table and return {(year, month): count} for the past year."""
    conn = psycopg2.connect(database_url)
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                EXTRACT(YEAR  FROM started_at)::int AS yr,
                EXTRACT(MONTH FROM started_at)::int AS mo,
                COUNT(*)::int                       AS cnt
            FROM workouts
            WHERE started_at >= NOW() - INTERVAL '12 months'
            GROUP BY yr, mo
            ORDER BY yr, mo
        """)
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    return {(int(r[0]), int(r[1])): int(r[2]) for r in rows}


def render_chart(months: list[tuple[int, int]], counts: list[int], output_path: str) -> None:
    labels = [datetime(y, m, 1).strftime("%b %Y") for y, m in months]
    x = range(len(labels))
    max_count = max(counts) if any(counts) else 1

    fig, ax = plt.subplots(figsize=(12, 6))

    bars = ax.bar(x, counts, color="#4C72B0", edgecolor="white", linewidth=0.8, zorder=3)

    # Axis labels & title
    ax.set_xticks(list(x))
    ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=10)
    ax.set_ylabel("Number of Workouts", fontsize=12)
    ax.set_xlabel("Month", fontsize=12)
    ax.set_title("Workouts per Month — Past 12 Months", fontsize=14, fontweight="bold", pad=15)

    # Y-axis: integers only, a little headroom for labels
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    ax.set_ylim(0, max_count + max(1, round(max_count * 0.18)))

    # Value labels on non-zero bars
    for bar, count in zip(bars, counts):
        if count > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + ax.get_ylim()[1] * 0.02,
                str(count),
                ha="center", va="bottom", fontsize=9, fontweight="bold",
            )

    # Light styling
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.35, zorder=0)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    output_path = sys.argv[1] if len(sys.argv) > 1 else "workout_chart.png"

    database_url = load_database_url()
    if not database_url:
        print("Error: DATABASE_URL not found in the environment or .env file.", file=sys.stderr)
        sys.exit(1)

    print("Connecting to database...")
    monthly = fetch_monthly_counts(database_url)

    months = past_12_months()
    counts = [monthly.get((y, m), 0) for y, m in months]

    total = sum(counts)
    print(f"\nWorkouts in the past 12 months: {total}\n")
    for (y, m), c in zip(months, counts):
        label = datetime(y, m, 1).strftime("%b %Y")
        bar = "#" * c
        print(f"  {label}: {c:>3}  {bar}")

    print("\nGenerating chart...")
    render_chart(months, counts, output_path)
    print(f"Saved: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    main()
