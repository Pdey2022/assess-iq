export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-green-600">✅ Thank You!</h1>
        <p className="mt-4 text-gray-600">
          Your assessment has been submitted successfully. 
          Our team will review the results and get back to you.
        </p>
      </div>
    </div>
  );
}
