// Simple error mapping for local auth flows
export function prettyAuthError(code) {
  switch (code) {
    case "auth/weak-password":
      return "Please use a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    default:
      return "Something went wrong. Please try again.";
  }
}
