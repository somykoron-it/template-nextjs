'use client';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">You do not have permission to access this resource.</p>
        <a href="/">
          <button className="text-blue-500 hover:underline">Go to Home Page</button>
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
