export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Oops! Something went wrong</h1>
      <p className="mt-4 text-gray-600">There was an error during authentication.</p>
      <a
        href="/login"
        className="mt-8 text-indigo-600 hover:text-indigo-500 font-medium"
      >
        Go back to login
      </a>
    </div>
  );
}
