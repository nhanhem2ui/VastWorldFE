import { useState, type FormEvent } from "react";
import type { ServiceResult } from "../types/ServiceResult";
import type { AuthResponse } from "../types/AuthResponse";
import { isAuthenticated, saveAuthSession } from "../hooks/authSession";
import { useNavigate } from "react-router-dom";
import { sleep } from "../hooks/sleep";
import FlashMessage from "../components/FlashMessage";
import { setFlashMessage } from "../hooks/flashMessage";

function Login() {
  const navigate = useNavigate();
  if (isAuthenticated()) {
    navigate("/");
  }
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const loginRequest = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const remember = formData.get("remember") === "on";

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });
      const result: ServiceResult<AuthResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      if (!result.data) {
        throw new Error("Login succeeded without auth data.");
      }

      saveAuthSession(result.data, remember);
      setMessage(result.message);

      await sleep(1000);
      navigate("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
      setFlashMessage("Login Successfully");
    }
  }

  return (
    <main className="login-page">
      <FlashMessage />
      <section className="login-visual" aria-label="VastWorld account login">
        <a className="login-brand" href="/">
          VastWorld
        </a>
        <div className="login-copy">
          <p className="eyebrow">Player access</p>
          <h1>Continue your journey.</h1>
          <p>
            Sign in to prepare your character, track progress, and return to the
            world from your last checkpoint.
          </p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="login-card-header">
            <p className="eyebrow">Welcome back</p>
            <h2 id="login-title">Sign in</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="player@vastworld.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-option" htmlFor="remember">
                <input id="remember" name="remember" type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#reset">Forgot password?</a>
            </div>

            <button
              className="button primary login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Channeling.." : "Sign in"}
            </button>

            {message && <p className="login-message">{message}</p>}
          </form>

          <p className="signup-copy">
            New to VastWorld? <a href="/register">Create an account</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
