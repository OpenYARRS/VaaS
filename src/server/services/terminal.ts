// Implementation of a terminal function to log messages to the Express server's console
// Hides console logs from the user
export function terminal(message: string | object | number | unknown): void {
  if (process.env.EXPRESS_CONSOLE_LOG === 'on') {
    if (typeof message === 'object') {
      console.table(message);
    } else {
      console.log(message);
    }
  }
}
// custom console.logs for granular logs :)
