import { SignIn } from '@clerk/clerk-react'

const SignInPage = () => (
  <SignIn
    path="/sign-in"
    routing="path"
    afterSignInUrl="/"
    signUpUrl="/sign-up"
  />
)

export default SignInPage