import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthFormLayout } from "../components/auth/AuthFormLayout";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import {
  loginSchema,
  type LoginFormValues,
} from "../lib/validation/authSchemas";
import { useLoginMutation } from "../hooks/useAuthQueries";
import { useAuthStore } from "../store/authStore";

interface RedirectState {
  from?: { pathname?: string };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectTo =
    (location.state as RedirectState | null)?.from?.pathname ?? "/account";

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate(redirectTo, { replace: true });
    }
  }, [authStatus, navigate, redirectTo]);

  if (authStatus === "authenticated") {
    return <main aria-busy="true">Opening your account...</main>;
  }

  if (authStatus === "forbidden") {
    return <Navigate to="/403" replace />;
  }

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <AuthFormLayout
      eyebrow="WELCOME BACK"
      title="Log in to Shelter"
      description="Sign in to continue to your stays and saved places."
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {mutation.isError && (
          <p className="form-error form-error-summary" role="alert">
            {getApiErrorMessage(mutation.error)}
          </p>
        )}

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <small className="form-error" id="login-email-error">
              {errors.email.message}
            </small>
          )}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />
          {errors.password && (
            <small className="form-error" id="login-password-error">
              {errors.password.message}
            </small>
          )}
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        New to Shelter? <Link to="/register">Create an account</Link>
      </p>
    </AuthFormLayout>
  );
}
