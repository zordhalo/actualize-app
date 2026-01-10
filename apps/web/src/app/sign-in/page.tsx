// apps/web/src/app/sign-in/page.tsx
import { SignIn } from '@clerk/clerk-react';
import { CLERK_AFTER_SIGN_IN_PATH, CLERK_SIGN_UP_PATH } from '@/lib/clerk';

/**
 * Sign In Page
 * 
 * Renders Clerk's SignIn component with custom styling
 * that matches the app's brand design.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-starry p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'rounded-2xl bg-surface p-8 shadow-xl border border-surface-light',
              headerTitle: 'text-4xl font-display font-bold text-brand-red uppercase tracking-wider text-center',
              headerSubtitle: 'text-sm text-[#999] font-body text-center',
              formButtonPrimary: 'bg-brand-red hover:bg-brand-red/90 text-white font-display uppercase tracking-wide',
              formFieldInput: 'bg-brand-black border-surface-light text-brand-white placeholder:text-[#666] font-body focus:border-brand-red focus:ring-brand-red',
              formFieldLabel: 'text-sm font-display font-medium text-brand-white uppercase tracking-wide',
              footerActionLink: 'text-brand-red hover:text-brand-red/80',
              dividerLine: 'bg-surface-light',
              dividerText: 'text-[#666]',
              socialButtonsBlockButton: 'border-surface-light bg-brand-black text-brand-white hover:bg-surface',
              identityPreviewText: 'text-brand-white',
              identityPreviewEditButton: 'text-brand-red hover:text-brand-red/80',
            },
            variables: {
              colorPrimary: '#d90428',
              colorBackground: '#1a1a1a',
              colorText: '#f5f5f5',
              colorInputBackground: '#0a0a0a',
              colorInputText: '#f5f5f5',
            },
          }}
          signUpUrl={CLERK_SIGN_UP_PATH}
          fallbackRedirectUrl={CLERK_AFTER_SIGN_IN_PATH}
        />
      </div>
    </div>
  );
}
