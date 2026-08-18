function ComingSoon({ title }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 mt-2">
        Modul ini sedang dalam pengembangan.
      </p>
    </div>
  );
}

export default ComingSoon;