export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-label mb-2">Страница не найдена</h2>
      <p className="text-secondary-label mb-8 text-center">
        К сожалению, страница которую вы ищете не существует
      </p>
      <a href="#/" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
        Вернуться на главную
      </a>
    </div>
  );
}
