# Logo / static assets

Files in this `public/` folder are served at the site root.

## EMI logo

Save the real EMI logo here as:

```
public/emi-logo.png
```

- A **transparent PNG** works best (the navbar background is dark).
- The navbar shows it at ~36px tall; export at 2–3× that (e.g. 100–110px tall) for crispness.

The navbar automatically uses `/emi-logo.png` once it exists; if the file is
missing, it falls back to a built-in vector mark.
