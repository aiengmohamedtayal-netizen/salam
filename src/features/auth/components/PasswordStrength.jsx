import { PasswordStrength as AnimatedPasswordStrength } from '@/components/ui/PasswordStrength';

/**
 * PasswordStrength Component
 * Backwards-compatible wrapper delegating to the animated DesignBookmark
 * spring-physics PasswordStrength component.
 */
export function PasswordStrength({ password = '', className, ...props }) {
  return (
    <AnimatedPasswordStrength
      value={password}
      showInput={false}
      label={null}
      className={className}
      {...props}
    />
  );
}

export default PasswordStrength;
