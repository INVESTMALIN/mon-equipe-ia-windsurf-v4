const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404 - Page non trouvée
          </h2>
        </div>
        <div className="text-center text-gray-600">
          La page que vous recherchez n'existe pas.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
