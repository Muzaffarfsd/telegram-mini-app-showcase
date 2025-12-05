import { useState, useEffect } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { 
  BookOpen, 
  Heart, 
  Star, 
  Search, 
  Filter,
  Plus,
  Minus,
  X,
  ChevronRight,
  Award,
  Clock,
  User
} from "lucide-react";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { LazyImage, UrgencyIndicator, TrustBadges } from "@/components/shared";

interface BookstoreProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const books = [
  { id: 1, name: 'Атомные привычки', price: 18, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Книга о том, как небольшие изменения приводят к значительным результатам', category: 'Саморазвитие', author: 'Джеймс Клир', pages: 320, year: 2018, rating: 4.8, language: 'Русский', inStock: 25 },
  { id: 2, name: 'Думай медленно... решай быстро', price: 22, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Исследование того, как работает наше мышление', category: 'Психология', author: 'Даниэль Канеман', pages: 512, year: 2011, rating: 4.7, language: 'Русский', inStock: 18 },
  { id: 3, name: 'Гарри Поттер и философский камень', price: 15, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Первая книга о юном волшебнике Гарри Поттере', category: 'Фэнтези', author: 'Дж.К. Роулинг', pages: 432, year: 1997, rating: 4.9, language: 'Русский', inStock: 30 },
  { id: 4, name: '1984', price: 16, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Антиутопический роман о тоталитарном обществе', category: 'Классика', author: 'Джордж Оруэлл', pages: 328, year: 1949, rating: 4.8, language: 'Русский', inStock: 20 },
  { id: 5, name: 'Код да Винчи', price: 19, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Захватывающий триллер о поисках святого Грааля', category: 'Триллер', author: 'Дэн Браун', pages: 592, year: 2003, rating: 4.5, language: 'Русский', inStock: 5 },
  { id: 6, name: 'Мастер и Маргарита', price: 17, image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Классический роман Михаила Булгакова о добре и зле', category: 'Классика', author: 'Михаил Булгаков', pages: 480, year: 1967, rating: 4.9, language: 'Русский', inStock: 22 },
  { id: 7, name: 'Сто лет одиночества', price: 20, image: 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Магический реализм от Гарсиа Маркеса', category: 'Классика', author: 'Габриэль Гарсиа Маркес', pages: 512, year: 1967, rating: 4.6, language: 'Русский', inStock: 3 },
  { id: 8, name: 'Искусство войны', price: 14, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Древний трактат о военной стратегии и тактике', category: 'Философия', author: 'Сунь-цзы', pages: 256, year: -500, rating: 4.7, language: 'Русский', inStock: 28 },
  { id: 9, name: 'Автостопом по галактике', price: 16, image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Юмористическая научная фантастика', category: 'Научная фантастика', author: 'Дуглас Адамс', pages: 224, year: 1979, rating: 4.5, language: 'Русский', inStock: 16 },
  { id: 10, name: 'Отцы и дети', price: 13, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Классический роман о конфликте поколений', category: 'Классика', author: 'Иван Тургенев', pages: 384, year: 1862, rating: 4.4, language: 'Русский', inStock: 24 },
  { id: 11, name: 'Краткая история времени', price: 21, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Популярно о физике и космологии', category: 'Наука', author: 'Стивен Хокинг', pages: 256, year: 1988, rating: 4.6, language: 'Русский', inStock: 14 },
  { id: 12, name: 'Преступление и наказание', price: 18, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Психологический роман Достоевского', category: 'Классика', author: 'Федор Достоевский', pages: 672, year: 1866, rating: 4.8, language: 'Русский', inStock: 19 },
  { id: 13, name: 'Шерлок Холмс: Этюд в багровых тонах', price: 15, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Первое приключение великого сыщика', category: 'Детектив', author: 'Артур Конан Дойл', pages: 192, year: 1887, rating: 4.7, language: 'Русский', inStock: 26 },
  { id: 14, name: 'Дюна', price: 23, image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Эпическая научно-фантастическая сага', category: 'Научная фантастика', author: 'Фрэнк Герберт', pages: 688, year: 1965, rating: 4.9, language: 'Русский', inStock: 2 },
  { id: 15, name: 'Властелин колец: Братство кольца', price: 24, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Первая часть эпической фэнтези трилогии', category: 'Фэнтези', author: 'Дж.Р.Р. Толкин', pages: 576, year: 1954, rating: 4.9, language: 'Русский', inStock: 17 },
  { id: 16, name: 'Как завоевывать друзей и оказывать влияние на людей', price: 19, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Классическое пособие по общению и лидерству', category: 'Саморазвитие', author: 'Дейл Карнеги', pages: 352, year: 1936, rating: 4.5, language: 'Русский', inStock: 21 },
  { id: 17, name: 'Убить пересмешника', price: 17, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Роман о расовой несправедливости и морали', category: 'Классика', author: 'Харпер Ли', pages: 376, year: 1960, rating: 4.8, language: 'Русский', inStock: 13 },
  { id: 18, name: 'Маленький принц', price: 12, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Философская сказка о дружбе и любви', category: 'Классика', author: 'Антуан де Сент-Экзюпери', pages: 128, year: 1943, rating: 4.7, language: 'Русский', inStock: 35 },
  { id: 19, name: 'Три товарища', price: 20, image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Роман о дружбе в послевоенной Германии', category: 'Классика', author: 'Эрих Мария Ремарк', pages: 448, year: 1936, rating: 4.6, language: 'Русский', inStock: 18 },
  { id: 20, name: 'Старик и море', price: 14, image: 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Повесть о старом рыбаке и его борьбе с жизнью', category: 'Классика', author: 'Эрнест Хемингуэй', pages: 112, year: 1952, rating: 4.5, language: 'Русский', inStock: 27 }
];

const categories = ['Все', 'Классика', 'Саморазвитие', 'Фэнтези', 'Научная фантастика', 'Психология', 'Триллер', 'Детектив', 'Философия', 'Наука'];

const initialCartItems: CartItem[] = [
  { id: 3, name: 'Гарри Поттер и философский камень', price: 15, quantity: 1, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
  { id: 1, name: 'Атомные привычки', price: 18, quantity: 1, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
];

export default function Bookstore({ activeTab }: BookstoreProps) {
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([3, 6, 14, 15]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const openBookModal = (book: typeof books[0]) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeBookModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleFavorite = (bookId: number) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'Все' || book.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useImagePreloader({
    images: books.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <div className="text-center">
        <h1 className="ios-title font-bold mb-2">Книжный Уголок</h1>
        <p className="ios-subheadline text-secondary-label">Мир знаний в каждой книге</p>
      </div>

      <div className="ios-card p-4" style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))', color: 'white' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="ios-headline font-semibold">Книга дня</h3>
            <p className="ios-body">Атомные привычки - скидка 20%</p>
          </div>
          <Award className="w-8 h-8" />
        </div>
      </div>

      <div>
        <h2 className="ios-title font-semibold mb-4">Популярные категории</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Классика', count: '8 книг', color: 'var(--theme-primary)' },
            { name: 'Саморазвитие', count: '3 книги', color: '#22c55e' },
            { name: 'Фэнтези', count: '2 книги', color: '#3b82f6' },
            { name: 'Научная фантастика', count: '2 книги', color: '#ef4444' }
          ].map((category) => (
            <div 
              key={category.name} 
              className="ios-card p-3 cursor-pointer"
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="w-full h-16 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: category.color }}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h4 className="ios-footnote font-semibold">{category.name}</h4>
              <p className="ios-caption2 text-secondary-label">{category.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="ios-title font-semibold mb-4">Бестселлеры недели</h2>
        <div className="space-y-3">
          {books.slice(0, 3).map((book, index) => (
            <div 
              key={book.id} 
              className="ios-card p-3 cursor-pointer flex items-center space-x-3"
              onClick={() => openBookModal(book)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                <span className="ios-footnote font-bold text-white">{index + 1}</span>
              </div>
              <LazyImage src={book.image} alt={book.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h4 className="ios-body font-semibold line-clamp-1">{book.name}</h4>
                <p className="ios-footnote text-secondary-label">{book.author}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="ios-caption2">{book.rating}</span>
                  </div>
                  <span className="ios-caption font-bold" style={{ color: 'var(--theme-primary)' }}>${book.price}</span>
                </div>
                {book.inStock <= 5 && (
                  <UrgencyIndicator stock={book.inStock} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">О нашем магазине</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">Более 10,000 книг в наличии</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">Быстрая доставка за 1-2 дня</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">Лучший книжный магазин 2024</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Каталог книг</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-label" />
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-quaternary-system-fill rounded-xl ios-body"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
              selectedCategory === category
                ? 'text-white'
                : 'bg-quaternary-system-fill text-label'
            }`}
            style={selectedCategory === category ? { backgroundColor: 'var(--theme-primary)' } : {}}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredBooks.map((book) => (
          <div 
            key={book.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openBookModal(book)}
          >
            <div className="flex items-center space-x-3">
              <LazyImage src={book.image} alt={book.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="ios-body font-semibold line-clamp-1">{book.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(book.id);
                    }}
                    className="p-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(book.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-secondary-label'
                      }`} 
                    />
                  </button>
                </div>
                <p className="ios-footnote text-secondary-label mb-1">{book.author}</p>
                <p className="ios-caption2 text-tertiary-label mb-2 line-clamp-2">{book.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="ios-caption2 px-2 py-1 bg-quaternary-system-fill rounded">{book.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="ios-caption2">{book.rating}</span>
                    </div>
                    <span className="ios-caption2 text-secondary-label">{book.pages} стр.</span>
                  </div>
                  <span className="ios-body font-bold" style={{ color: 'var(--theme-primary)' }}>${book.price}</span>
                </div>
                {book.inStock <= 5 && (
                  <div className="mt-2">
                    <UrgencyIndicator stock={book.inStock} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Корзина</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
          <p className="ios-body text-secondary-label">Корзина пуста</p>
          <p className="ios-footnote text-tertiary-label">Добавьте книги из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="ios-card p-4">
                <div className="flex items-center space-x-3">
                  <LazyImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="ios-body font-semibold">{item.name}</h4>
                    <p className="ios-footnote text-secondary-label">${item.price} за книгу</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-quaternary-system-fill flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="ios-body font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="ios-body font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ios-footnote text-system-red"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ios-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="ios-body">Подытог:</span>
              <span className="ios-body font-semibold">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="ios-body">Доставка:</span>
              <span className="ios-body font-semibold">$3.99</span>
            </div>
            <hr className="border-separator" />
            <div className="flex justify-between items-center">
              <span className="ios-headline font-bold">Итого:</span>
              <span className="ios-headline font-bold" style={{ color: 'var(--theme-primary)' }}>${(cartTotal + 3.99).toFixed(2)}</span>
            </div>
            
            <TrustBadges />
            
            <button className="w-full text-white ios-body font-semibold py-3 rounded-xl" style={{ backgroundColor: 'var(--theme-primary)' }}>
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Профиль читателя</h1>
      
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <span className="ios-title font-bold text-white">КУ</span>
          </div>
          <div>
            <h3 className="ios-headline font-semibold">Книголюб</h3>
            <p className="ios-body text-secondary-label">Активный читатель</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="ios-title font-bold" style={{ color: 'var(--theme-primary)' }}>87</p>
            <p className="ios-footnote text-secondary-label">Прочитано</p>
          </div>
          <div className="text-center">
            <p className="ios-title font-bold text-system-green">23</p>
            <p className="ios-footnote text-secondary-label">В планах</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="ios-card p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">Избранное</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="ios-footnote text-secondary-label">{favorites.length} книг</span>
            <ChevronRight className="w-5 h-5 text-tertiary-label" />
          </div>
        </div>

        <div className="ios-card p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">История заказов</span>
          </div>
          <ChevronRight className="w-5 h-5 text-tertiary-label" />
        </div>

        <div className="ios-card p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            <span className="ios-body">Настройки профиля</span>
          </div>
          <ChevronRight className="w-5 h-5 text-tertiary-label" />
        </div>
      </div>
    </div>
  );

  const renderBookModal = () => {
    if (!isModalOpen || !selectedBook) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
            <h2 className="ios-headline font-semibold">{selectedBook.name}</h2>
            <button onClick={closeBookModal} className="p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex space-x-4">
              <LazyImage src={selectedBook.image} alt={selectedBook.name} className="w-32 h-48 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="ios-footnote text-secondary-label mb-1">{selectedBook.author}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ios-body font-semibold">{selectedBook.rating}</span>
                  </div>
                  <span className="ios-caption2 px-2 py-1 bg-quaternary-system-fill rounded">{selectedBook.category}</span>
                </div>
                <p className="ios-title font-bold" style={{ color: 'var(--theme-primary)' }}>${selectedBook.price}</p>
                {selectedBook.inStock <= 5 && (
                  <div className="mt-2">
                    <UrgencyIndicator stock={selectedBook.inStock} />
                  </div>
                )}
              </div>
            </div>

            <p className="ios-body text-secondary-label">{selectedBook.description}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-quaternary-system-fill rounded-xl">
                <p className="ios-caption2 text-secondary-label">Страниц</p>
                <p className="ios-body font-semibold">{selectedBook.pages}</p>
              </div>
              <div className="text-center p-3 bg-quaternary-system-fill rounded-xl">
                <p className="ios-caption2 text-secondary-label">Год</p>
                <p className="ios-body font-semibold">{selectedBook.year > 0 ? selectedBook.year : `${Math.abs(selectedBook.year)} до н.э.`}</p>
              </div>
              <div className="text-center p-3 bg-quaternary-system-fill rounded-xl">
                <p className="ios-caption2 text-secondary-label">Язык</p>
                <p className="ios-body font-semibold">{selectedBook.language}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => toggleFavorite(selectedBook.id)}
                className={`flex-1 py-3 rounded-xl ios-body font-semibold ${
                  favorites.includes(selectedBook.id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-quaternary-system-fill text-label'
                }`}
              >
                <Heart className={`w-5 h-5 inline mr-2 ${favorites.includes(selectedBook.id) ? 'fill-red-500' : ''}`} />
                {favorites.includes(selectedBook.id) ? 'В избранном' : 'В избранное'}
              </button>
              <button
                onClick={() => {
                  setCartItems(prev => [...prev, { id: selectedBook.id, name: selectedBook.name, price: selectedBook.price, quantity: 1, image: selectedBook.image }]);
                  closeBookModal();
                }}
                className="flex-1 py-3 rounded-xl ios-body font-semibold text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-system-grouped-background pb-20">
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'catalog' && renderCatalogTab()}
      {activeTab === 'cart' && renderCartTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {renderBookModal()}
    </div>
  );
}
