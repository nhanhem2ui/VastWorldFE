import { useState, type FormEvent } from "react";
import type { ServiceResult } from "@/types/ServiceResult";
import type { AuthResponse } from "../types/AuthResponse";
import { Navigate, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../shared/hooks/authSession";
import { sleep } from "@/shared/hooks/sleep";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import FlashMessage from "@/shared/components/FlashMessage";

function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to={"/"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const registerRequest = {
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerRequest),
      });

      const result: ServiceResult<AuthResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration failed.");
      }

      setMessage(result.message);
      setFlashMessage("Register Successfully");
      await sleep(1000);
      navigate("/Login");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page register-page">
      <FlashMessage />
      <section className="login-visual" aria-label="Create a VastWorld account">
        <a className="login-brand" href="/">
          VastWorld
        </a>
        <div className="login-copy">
          <p className="eyebrow">New player</p>
          <h1>Begin your story.</h1>
          <p>
            Create an account to reserve your player name, save progress, and
            prepare for your first run through VastWorld.
          </p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="register-title">
        <div className="login-card register-card">
          <div className="login-card-header">
            <p className="eyebrow">Join VastWorld</p>
            <h2 id="register-title">Create account</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="nickname"
                placeholder="Choose a username"
                minLength={3}
                required
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Create a password"
                minLength={8}
                required
              />
            </div>

            <label className="remember-option terms-option" htmlFor="terms">
              <input id="terms" name="terms" type="checkbox" required />
              <span>I agree to the account terms</span>
            </label>

            <button
              className="button primary login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>

            {message && <p className="login-message">{message}</p>}
          </form>

          <p className="signup-copy">
            Already have an account?
            <a href="/login"> Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
