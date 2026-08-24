export type ErrorProps = {
  errorMessage?: string | null;
};

/**
 * Inline validation error text; renders nothing when errorMessage is absent.
 */
export const Error = ({ errorMessage }: ErrorProps) => {
  if (!errorMessage) return null;

  return (
    <div
      role="alert"
      aria-label={errorMessage}
      className="text-xs font-semibold text-error"
    >
      {errorMessage}
    </div>
  );
};
