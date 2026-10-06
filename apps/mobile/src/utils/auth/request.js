// A UI deadline does not cancel Firebase requests or queued Firestore writes.
// Callers must preserve accounts already created and offer recovery instead of retrying signup.
export function withDeadline(promise, message, milliseconds = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(message);
      error.code = 'auth/request-timeout';
      reject(error);
    }, milliseconds);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}
