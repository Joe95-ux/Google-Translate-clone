import { SignUp } from '@clerk/clerk-react'

const SignUpPage = () => (
  <SignUp
    path="/sign-up"
    routing="path"
    forceRedirectUrl="/onboarding/organization"
    signInUrl="/sign-in"
  />
)

export default SignUpPage