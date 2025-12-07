//Curtomizing error messages
export function prettyFirebaseError(code) {
  switch (code) {
    case "auth/operation-not-allowed":
      return "Email & password sign-in is not enabled for this app.";
    case "auth/weak-password":
      return "Please use a stronger password (at least 6 characters).";
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
