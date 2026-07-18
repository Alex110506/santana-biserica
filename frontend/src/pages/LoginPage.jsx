import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { parish } from "../data/site.js";
import CrossIcon from "../components/ui/CrossIcon.jsx";
import { login } from "../lib/auth.js";

/**
 * Admin login page (`/login`).
 *
 * Submits the credentials to the backend, which sets an httpOnly JWT cookie on
 * success; the admin is then redirected to the protected dashboard.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.status === 401
          ? "Utilizator sau parolă incorecte."
          : "Autentificarea a eșuat. Încearcă din nou.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded border border-ink/20 bg-cream px-4 py-3 text-[16px] text-ink " +
    "transition-colors duration-300 placeholder:text-stone/70 focus:border-bronze";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <CrossIcon className="mx-auto mb-4 text-bronze" />
          <div className="text-[11px] tracking-[.28em] text-burgundy uppercase">
            {parish.subtitle}
          </div>
          <h1 className="mt-2 font-heading text-[clamp(30px,5vw,42px)] leading-[1.1] font-normal">
            Autentificare
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-[1.7] text-ink-mute">
            Zonă rezervată administrării parohiei.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-ink/14 bg-card p-[clamp(28px,5vw,40px)]"
        >
          <label className="mb-5 block">
            <span className="mb-2 block text-[11px] tracking-[.2em] text-burgundy uppercase">
              Utilizator
            </span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={fieldClass}
              required
            />
          </label>

          <label className="mb-7 block">
            <span className="mb-2 block text-[11px] tracking-[.2em] text-burgundy uppercase">
              Parolă
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
              required
            />
          </label>

          {error && (
            <p
              role="alert"
              className="mb-5 rounded border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-[14px] text-burgundy"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded border border-burgundy bg-burgundy px-6 py-3 font-heading text-[18px] text-cream transition-colors duration-350 hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Se autentifică…" : "Intră în cont"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[14px] text-stone no-underline hover:text-bronze">
            ← Înapoi la site
          </Link>
        </div>
      </div>
    </div>
  );
}
