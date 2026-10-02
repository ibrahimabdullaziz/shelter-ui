import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthFormLayout } from "../components/auth/AuthFormLayout";
import { Button } from "../components/ui/Button";
import { useRegisterMutation } from "../hooks/useAuthQueries";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import {
  registerSchema,
  type RegisterFormValues,
} from "../lib/validation/authSchemas";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);
  const mutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate("/account", { replace: true });
    }
  }, [authStatus, navigate]);

  if (authStatus === "authenticated") {
    return <main aria-busy="true">Opening your account...</main>;
  }

  if (authStatus === "forbidden") {
    return <Navigate to="/403" replace />;
  }

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <AuthFormLayout
      eyebrow="MAKE YOURSELF AT HOME"
      title="Create your account"
      description="A good stay starts with the right place."
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {mutation.isError && (
          <p className="form-error form-error-summary" role="alert">
            {getApiErrorMessage(mutation.error)}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="auth-feedback-success" role="status">
            {mutation.data.message}{" "}
            <Link to="/verify-email" state={{ email: getValues("email") }}>
              Enter your verification code
            </Link>
          </p>
        )}

        <div className="form-row">
          <label className="form-field">
            <span>First name</span>
            <input
              type="text"
              autoComplete="given-name"
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={
                errors.firstName ? "register-first-name-error" : undefined
              }
              {...register("firstName")}
            />
            {errors.firstName && (
              <small className="form-error" id="register-first-name-error">
                {errors.firstName.message}
              </small>
            )}
          </label>

          <label className="form-field">
            <span>Last name</span>
            <input
              type="text"
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={
                errors.lastName ? "register-last-name-error" : undefined
              }
              {...register("lastName")}
            />
            {errors.lastName && (
              <small className="form-error" id="register-last-name-error">
                {errors.lastName.message}
              </small>
            )}
          </label>
        </div>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <small className="form-error" id="register-email-error">
              {errors.email.message}
            </small>
          )}
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            {...register("password")}
          />
          {errors.password && (
            <small className="form-error" id="register-password-error">
              {errors.password.message}
            </small>
          )}
        </label>

        <Button
          className="auth-submit"
          type="submit"
          variant="primary"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      <p className="auth-switch auth-switch-secondary">
        Have a verification code? <Link to="/verify-email">Verify email</Link>
      </p>
    </AuthFormLayout>
  );
}
