import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword, verifyEmail } from "../api/auth";
import { AuthFormLayout } from "../components/auth/AuthFormLayout";
import { Button } from "../components/ui/Button";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
  type VerifyEmailFormValues,
} from "../lib/validation/authSchemas";

interface AuthFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: "email" | "password" | "text";
  autoComplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}

function AuthField({
  id,
  label,
  registration,
  error,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input
        {...registration}
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <small className="form-error" id={errorId}>
          {error}
        </small>
      )}
    </label>
  );
}

function AuthMutationFeedback({
  error,
  success,
}: {
  error: unknown;
  success?: string;
}) {
  if (error) {
    return (
      <p className="form-error form-error-summary" role="alert">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  if (success) {
    return (
      <p className="auth-feedback-success" role="status">
        {success}
      </p>
    );
  }

  return null;
}

export function VerifyEmailPage() {
  const location = useLocation();
  const mutation = useMutation({ mutationFn: verifyEmail });
  const locationState = location.state as { email?: unknown } | null;
  const email =
    typeof locationState?.email === "string" ? locationState.email : "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email },
  });
  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <AuthFormLayout
      eyebrow="EMAIL VERIFICATION"
      title="Verify your email"
      description="Enter the 6-digit code sent to your email address."
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <AuthMutationFeedback
          error={mutation.error}
          success={
            mutation.isSuccess
              ? "Your email is verified. You can sign in."
              : undefined
          }
        />
        <AuthField
          id="verify-email-address"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register("email")}
          error={errors.email?.message}
        />
        <AuthField
          id="verify-email-code"
          label="Verification code"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          registration={register("code")}
          error={errors.code?.message}
        />
        <Button
          className="auth-submit"
          type="submit"
          variant="primary"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Verifying..." : "Verify email"}
        </Button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthFormLayout>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: forgotPassword });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () =>
        navigate("/reset-password", { state: { email: values.email } }),
    }),
  );

  return (
    <AuthFormLayout
      eyebrow="ACCOUNT RECOVERY"
      title="Reset your password"
      description="Request a reset code using the email on your account."
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <AuthMutationFeedback
          error={mutation.error}
          success={
            mutation.isSuccess
              ? "If this email is associated with an account, a reset code will be sent."
              : undefined
          }
        />
        <AuthField
          id="forgot-password-email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register("email")}
          error={errors.email?.message}
        />
        <Button
          className="auth-submit"
          type="submit"
          variant="primary"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Requesting code..." : "Send reset code"}
        </Button>
      </form>
      <p className="auth-switch auth-switch-secondary">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthFormLayout>
  );
}

export function ResetPasswordPage() {
  const location = useLocation();
  const locationState = location.state as { email?: unknown } | null;
  const email =
    typeof locationState?.email === "string" ? locationState.email : "";
  const mutation = useMutation({ mutationFn: resetPassword });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });
  const onSubmit = handleSubmit(({ email, code, password }) =>
    mutation.mutate({ email, code, password }),
  );

  return (
    <AuthFormLayout
      eyebrow="ACCOUNT RECOVERY"
      title="Choose a new password"
      description={
        email
          ? `Enter the reset code sent to ${email}, then choose your new password.`
          : "Enter your account email and reset code, then choose your new password."
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <AuthMutationFeedback
          error={mutation.error}
          success={
            mutation.isSuccess
              ? "Your password has been updated. Sign in with your new password."
              : undefined
          }
        />
        {email ? (
          <input type="hidden" {...register("email")} />
        ) : (
          <AuthField
            id="reset-password-email"
            label="Email"
            type="email"
            autoComplete="email"
            registration={register("email")}
            error={errors.email?.message}
          />
        )}
        <AuthField
          id="reset-password-code"
          label="Reset code"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          registration={register("code")}
          error={errors.code?.message}
        />
        <AuthField
          id="reset-password-new"
          label="New password"
          type="password"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password?.message}
        />
        <AuthField
          id="reset-password-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button
          className="auth-submit"
          type="submit"
          variant="primary"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Updating password..." : "Update password"}
        </Button>
      </form>
      <p className="auth-switch">
        <Link to="/forgot-password">Request another reset code</Link>
      </p>
      <p className="auth-switch auth-switch-secondary">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthFormLayout>
  );
}
