---
name: workout-chart
description: Generate and export a PNG bar chart of workout frequency over the past 12 months from the project's database. Trigger whenever the user asks to visualize workout history, chart or plot workouts, see monthly workout counts, or export workout statistics as an image — even if they don't say "bar chart" explicitly.
---

# Workout Chart

Creates a PNG bar chart showing the number of workouts logged per month over the past 12 months, queried directly from the project's PostgreSQL database.

## Steps

1. **Run the script** from the project root:
   ```bash
   python .agents/skills/workout-chart/scripts/plot_workouts.py [output_path]
   ```
   - `output_path` is optional; defaults to `workout_chart.png` in the current directory.
   - The script reads `DATABASE_URL` automatically from the `.env` file in the current directory.
   - If `psycopg2-binary` or `matplotlib` are missing, the script installs them before running.

2. **Report** the absolute path of the saved image to the user.

## Output

- A 12×6 inch PNG at 150 DPI
- X-axis: month labels (e.g. `May 2025` … `Apr 2026`)
- Y-axis: integer count of workouts
- Months with no workouts are shown with a bar height of 0
- Workout counts are printed to the terminal before charting
