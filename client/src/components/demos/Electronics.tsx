import React, { useState, useMemo, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, Star, ChevronRight, ChevronLeft, Clock, User,
  Search, ShoppingBag, Settings,
  Home, Grid, Smartphone, Monitor, Headphones, Camera,
  X, Phone, Award, Crown, Eye, Package, Cpu, Battery,
  Shield, Wifi, Zap, Box, Tablet, Watch, Speaker,
  Gamepad2, Airplay, ChevronDown
} from "lucide-react";

import { LazyImage, DemoThemeProvider, AutoplayVideo } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";

import iphone15ProMaxImage from "@assets/iphone_15_pro_max.jpg";
import samsungS24UltraImage from "@assets/samsung_s24_ultra.jpg";
import macbookPro16Image from "@assets/macbook_pro_16.jpg";
import dellXps15Image from "@assets/dell_xps_15.jpg";
import ipadPro12Image from "@assets/ipad_pro_12.jpg";
import sonyWh1000xm5Image from "@assets/sony_wh1000xm5.jpg";
import airpodsPro2Image from "@assets/airpods_pro_2.jpg";
import sonyAlphaA7ivImage from "@assets/sony_alpha_a7iv.jpg";
import techWatchImage from "@assets/tech_watch_ultra.jpg";
import techVisionImage from "@assets/tech_vision_pro.jpg";
import techAirpodsMaxImage from "@assets/tech_airpods_max.jpg";
import techHomepodImage from "@assets/tech_homepod.jpg";
import techPs5Image from "@assets/tech_ps5.jpg";
import techDroneImage from "@assets/tech_drone.jpg";
import techMacbookAirImage from "@assets/tech_macbook_air.jpg";
import techSpeakerImage from "@assets/tech_speaker.jpg";

interface ElectronicsProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

const SF = "'Inter', -apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";
const ACCENT = '#2997FF';
const ACCENT_DARK = '#0071E3';
const BG = '#000000';
const BG_SEC = '#1D1D1F';
const BG_CARD = '#161617';
const GLASS = 'rgba(255,255,255,0.04)';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F5F5F7';
const TEXT_SEC = '#86868B';
const TEXT_TER = '#6E6E73';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  tagline: string;
  category: string;
  brand: string;
  rating: number;
  specs: { label: string; value: string }[];
  features: string[];
  color: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const CATEGORY_MAP: Record<string, { icon: React.ElementType; emoji: string; image: string }> = {
  'Смартфоны': { icon: Smartphone, emoji: '📱', image: iphone15ProMaxImage },
  'Ноутбуки': { icon: Monitor, emoji: '💻', image: macbookPro16Image },
  'Планшеты': { icon: Tablet, emoji: '📟', image: ipadPro12Image },
  'Наушники': { icon: Headphones, emoji: '🎧', image: airpodsPro2Image },
  'Камеры': { icon: Camera, emoji: '📷', image: sonyAlphaA7ivImage },
  'Часы': { icon: Watch, emoji: '⌚', image: techWatchImage },
  'Аксессуары': { icon: Speaker, emoji: '🔊', image: techVisionImage },
  'Гейминг': { icon: Gamepad2, emoji: '🎮', image: techPs5Image },
};

const products: Product[] = [
  {
    id: 1, name: 'iPhone 16 Pro Max', price: 129990, oldPrice: 149990, image: iphone15ProMaxImage,
    tagline: 'Титан. Так закалён. Так Pro.',
    description: 'Революционный чип A18 Pro с 3-нм техпроцессом открывает эру мобильного ИИ — от генеративных моделей прямо на устройстве до профессиональной съёмки пространственного видео для Apple Vision Pro. Камера 48MP Fusion с сенсором нового поколения Sony IMX903 захватывает на 40% больше света. Дисплей Super Retina XDR 6.9" с ProMotion 120Hz и яркостью 2000 нит в HDR. Титановый корпус Grade 5 — на 19% легче нержавеющей стали при максимальной прочности. USB-C с Thunderbolt 4 для профессиональных рабочих процессов.',
    category: 'Смартфоны', brand: 'Apple', rating: 4.9, color: '#48484A',
    specs: [
      { label: 'Дисплей', value: '6.9" Super Retina XDR' },
      { label: 'Чип', value: 'A18 Pro 3nm' },
      { label: 'Камера', value: '48MP Fusion' },
      { label: 'Память', value: '256GB — 1TB' },
      { label: 'Батарея', value: 'До 33 часов' },
      { label: 'Корпус', value: 'Титан Grade 5' }
    ],
    features: ['Apple Intelligence', 'ProRes 4K 120fps', 'Spatial Video', 'Action Button', 'Ceramic Shield', 'USB-C Thunderbolt'],
    isNew: true, isFeatured: true
  },
  {
    id: 2, name: 'MacBook Pro 16" M4 Max', price: 299990, image: macbookPro16Image,
    tagline: 'Безумная мощь. Безумная автономность.',
    description: 'Чип M4 Max с 16-ядерным CPU и 40-ядерным GPU обеспечивает производительность уровня рабочей станции. Дисплей Liquid Retina XDR 16.2" с технологией nano-texture и яркостью 1600 нит HDR передаёт миллиард оттенков. Унифицированная память до 128GB и SSD до 8TB для работы с проектами 8K, нейросетями и 3D-рендерингом. До 24 часов автономной работы — полный рабочий марафон без розетки.',
    category: 'Ноутбуки', brand: 'Apple', rating: 4.9, color: '#2D2D2D',
    specs: [
      { label: 'Дисплей', value: '16.2" Liquid Retina XDR' },
      { label: 'Чип', value: 'M4 Max' },
      { label: 'Память', value: 'До 128GB unified' },
      { label: 'SSD', value: 'До 8TB' },
      { label: 'Батарея', value: 'До 24 часов' },
      { label: 'Порты', value: 'Thunderbolt 5 ×3' }
    ],
    features: ['Thunderbolt 5', 'HDMI 2.1', 'MagSafe 3', 'Wi-Fi 7', 'ProMotion 120Hz', 'Nano-texture'],
    isFeatured: true
  },
  {
    id: 3, name: 'iPad Pro M4', price: 119990, image: ipadPro12Image,
    tagline: 'Невероятно тонкий. Невероятно мощный.',
    description: 'Самый тонкий продукт Apple в истории — всего 5.1 мм. Чип M4 с 10-ядерным GPU опережает любой планшет на рынке. Дисплей Ultra Retina XDR с tandem OLED — яркость 1600 нит HDR и абсолютно чёрный цвет. Apple Pencil Pro с тактильной отдачей и сенсором сжатия для новых жестов. Thunderbolt/USB 4 для подключения внешних мониторов 6K и профессиональных аксессуаров.',
    category: 'Планшеты', brand: 'Apple', rating: 4.8, color: '#3A3A3C',
    specs: [
      { label: 'Дисплей', value: '13" Ultra Retina XDR' },
      { label: 'Чип', value: 'M4' },
      { label: 'Толщина', value: '5.1 мм' },
      { label: 'Камера', value: '12MP Ultra Wide' },
      { label: 'Батарея', value: 'До 10 часов' },
      { label: 'Стилус', value: 'Apple Pencil Pro' }
    ],
    features: ['tandem OLED', 'Face ID', 'Apple Pencil Pro', 'Magic Keyboard', 'Thunderbolt', 'LiDAR'],
    isNew: true, isFeatured: true
  },
  {
    id: 4, name: 'AirPods Pro 2', price: 24990, image: airpodsPro2Image,
    tagline: 'Адаптивное аудио. Магическое.',
    description: 'Чип H2 с адаптивным шумоподавлением, которое в реальном времени подстраивается под окружающую среду. Пространственное аудио с персонализированным трекингом головы создаёт эффект Dolby Atmos вокруг вас. Адаптивная прозрачность подавляет резкие шумы мгновенно, сохраняя голоса собеседников. До 6 часов слушания + 30 часов с кейсом. USB-C кейс с точным поиском через Find My.',
    category: 'Наушники', brand: 'Apple', rating: 4.8, color: '#E8E8ED',
    specs: [
      { label: 'Чип', value: 'Apple H2' },
      { label: 'ANC', value: '2× эффективнее' },
      { label: 'Батарея', value: '6ч + 30ч кейс' },
      { label: 'Защита', value: 'IP54' },
      { label: 'Зарядка', value: 'USB-C / MagSafe' },
      { label: 'Аудио', value: 'Lossless с кабелем' }
    ],
    features: ['Adaptive Audio', 'Spatial Audio', 'Conversation Awareness', 'Personalized Volume', 'Find My', 'USB-C'],
    isFeatured: true
  },
  {
    id: 5, name: 'Samsung Galaxy S24 Ultra', price: 109990, oldPrice: 129990, image: samsungS24UltraImage,
    tagline: 'Galaxy AI. Новая эра мобильности.',
    description: 'Galaxy AI встроен в каждый аспект — мгновенный перевод звонков, генеративная обработка фото, умный поиск обведением экрана. Snapdragon 8 Gen 3 for Galaxy — эксклюзивная версия с усиленным NPU для ИИ-задач. Камера 200MP с 100× Space Zoom и ночной съёмкой нового поколения. Титановая рамка Grade 5 и S Pen с нулевой задержкой.',
    category: 'Смартфоны', brand: 'Samsung', rating: 4.8, color: '#3C3C3E',
    specs: [
      { label: 'Дисплей', value: '6.8" Dynamic AMOLED 2X' },
      { label: 'Чип', value: 'Snapdragon 8 Gen 3' },
      { label: 'Камера', value: '200MP + 100× Zoom' },
      { label: 'Память', value: '512GB' },
      { label: 'Батарея', value: '5000 мАч' },
      { label: 'Стилус', value: 'S Pen встроен' }
    ],
    features: ['Galaxy AI', 'Circle to Search', 'Live Translate', 'S Pen', '100× Space Zoom', 'Titanium Frame'],
    isNew: true
  },
  {
    id: 6, name: 'MacBook Air 15" M3', price: 159990, image: techMacbookAirImage,
    tagline: 'Впечатляюще тонкий. Фантастически мощный.',
    description: 'Самый популярный ноутбук в мире — теперь с 15.3" экраном и чипом M3. Liquid Retina дисплей с яркостью 500 нит, P3 wide color и True Tone. 18 часов автономной работы. Бесшумная система охлаждения без вентиляторов. Всего 11.5 мм толщиной и 1.51 кг — идеальный баланс мощности и портативности.',
    category: 'Ноутбуки', brand: 'Apple', rating: 4.7, color: '#E3D4C0',
    specs: [
      { label: 'Дисплей', value: '15.3" Liquid Retina' },
      { label: 'Чип', value: 'Apple M3' },
      { label: 'Память', value: 'До 24GB unified' },
      { label: 'SSD', value: 'До 2TB' },
      { label: 'Батарея', value: 'До 18 часов' },
      { label: 'Вес', value: '1.51 кг' }
    ],
    features: ['Безвентиляторный', 'MagSafe', 'Touch ID', '1080p камера', 'Spatial Audio', 'Wi-Fi 6E'],
  },
  {
    id: 7, name: 'Sony WH-1000XM5', price: 35990, image: sonyWh1000xm5Image,
    tagline: 'Тишина, которая вдохновляет.',
    description: 'Два процессора QN1 и V1 управляют восемью микрофонами для создания идеального кокона тишины. Кастомные 30мм драйверы с углеродной диафрагмой воспроизводят частоты 4Hz–40kHz с кристальной чистотой. Амбушюры с эффектом памяти обеспечивают комфорт при многочасовых сессиях. 30 часов автономной работы с ANC, 3 минуты зарядки = 3 часа музыки.',
    category: 'Наушники', brand: 'Sony', rating: 4.8, color: '#2C2C2E',
    specs: [
      { label: 'Батарея', value: '30 часов с ANC' },
      { label: 'Драйвер', value: '30мм карбон' },
      { label: 'ANC', value: '8 микрофонов' },
      { label: 'Кодеки', value: 'LDAC / AAC' },
      { label: 'Multipoint', value: '2 устройства' },
      { label: 'Зарядка', value: 'USB-C быстрая' }
    ],
    features: ['Dual Processor ANC', 'LDAC Hi-Res', 'Multipoint', 'Speak-to-Chat', '30h Battery', 'Touch Controls'],
  },
  {
    id: 8, name: 'Dell XPS 15', price: 139990, image: dellXps15Image,
    tagline: 'Кинематографический OLED в ультрабуке.',
    description: 'OLED-дисплей 3.5K с бесконечной контрастностью, миллиардом оттенков и абсолютно чёрным цветом — каждый пиксель свой собственный источник света. Intel Core i7-14700H с 20 потоками для профессиональной многозадачности. NVIDIA RTX 4050 для видеомонтажа 4K, 3D и ML. Алюминиевый корпус 1.86 кг с InfinityEdge безрамочным дизайном.',
    category: 'Ноутбуки', brand: 'Dell', rating: 4.7, color: '#1C1C1E',
    specs: [
      { label: 'Дисплей', value: '15.6" OLED 3.5K' },
      { label: 'CPU', value: 'Intel Core i7-14700H' },
      { label: 'GPU', value: 'NVIDIA RTX 4050' },
      { label: 'RAM', value: '32GB DDR5' },
      { label: 'SSD', value: '1TB NVMe' },
      { label: 'Вес', value: '1.86 кг' }
    ],
    features: ['OLED HDR', 'Thunderbolt 4', 'Wi-Fi 6E', 'Fingerprint', 'InfinityEdge', 'CNC Aluminum'],
  },
  {
    id: 9, name: 'Apple Watch Ultra 2', price: 79990, image: techWatchImage,
    tagline: 'Для самых смелых приключений.',
    description: 'Титановый корпус 49мм с сапфировым стеклом — самые прочные Apple Watch. Чип S9 SiP с нейродвижком 4-ядерным для жестов Double Tap. Дисплей 3000 нит — читается на ярком солнце. GPS L1/L5 двухчастотный для точного трекинга в лесах и каньонах. Глубиномер и датчик температуры воды до 40 метров. До 72 часов автономности в режиме экономии.',
    category: 'Часы', brand: 'Apple', rating: 4.9, color: '#B8860B',
    specs: [
      { label: 'Корпус', value: '49мм Титан' },
      { label: 'Чип', value: 'S9 SiP' },
      { label: 'Дисплей', value: '3000 нит' },
      { label: 'Батарея', value: 'До 72 часов' },
      { label: 'Защита', value: 'WR100 / EN13319' },
      { label: 'GPS', value: 'L1 + L5' }
    ],
    features: ['Double Tap', 'Precision Finding', 'Depth Gauge', 'Siren 86dB', 'Action Button', 'Titanium'],
    isNew: true
  },
  {
    id: 10, name: 'Sony Alpha A7 IV', price: 249990, image: sonyAlphaA7ivImage,
    tagline: 'Полный кадр. Полная свобода.',
    description: 'Полнокадровая матрица 33MP Exmor R с процессором BIONZ XR для безупречной детализации и динамического диапазона 15 EV. Гибридный AF с 759 точками мгновенно отслеживает глаза людей, животных и птиц. Видео 4K 60fps 10-bit 4:2:2 с S-Log3 и S-Cinetone для кинематографической цветокоррекции. IBIS 5.5 EV — резкие кадры с рук при любом освещении.',
    category: 'Камеры', brand: 'Sony', rating: 4.9, color: '#1C1C1E',
    specs: [
      { label: 'Матрица', value: '33MP Full Frame' },
      { label: 'Видео', value: '4K 60fps 10-bit' },
      { label: 'AF', value: '759 точек фазового' },
      { label: 'IBIS', value: '5.5 EV стабилизация' },
      { label: 'ISO', value: '100 — 51200' },
      { label: 'Серия', value: '10 кадров/с' }
    ],
    features: ['Real-time Eye AF', 'S-Cinetone', 'S-Log3', '4K 60p', 'IBIS 5-axis', 'Dual Card Slots'],
    isFeatured: true
  },
  {
    id: 11, name: 'Apple Vision Pro', price: 349990, image: techVisionImage,
    tagline: 'Добро пожаловать в эру пространственных вычислений.',
    description: 'Первый пространственный компьютер Apple. Чип M2 + R1 с обработкой данных от 12 камер, 5 сенсоров и 6 микрофонов за 12 миллисекунд. Дисплей micro-OLED 23 миллиона пикселей — больше, чем 4K на каждый глаз. EyeSight показывает ваши глаза окружающим. Управление взглядом, голосом и жестами. Бесконечный холст для приложений в вашем пространстве.',
    category: 'Аксессуары', brand: 'Apple', rating: 4.7, color: '#48484A',
    specs: [
      { label: 'Чипы', value: 'M2 + R1' },
      { label: 'Дисплей', value: 'micro-OLED 23M px' },
      { label: 'Камеры', value: '12 камер' },
      { label: 'Трекинг', value: 'Глаза + руки' },
      { label: 'Аудио', value: 'Spatial Audio' },
      { label: 'Батарея', value: '2 часа внешняя' }
    ],
    features: ['visionOS', 'EyeSight', 'Optic ID', 'Spatial Audio', 'Digital Crown', '4K+ per eye'],
    isNew: true, isFeatured: true
  },
  {
    id: 12, name: 'AirPods Max', price: 59990, image: techAirpodsMaxImage,
    tagline: 'Высшая форма звука.',
    description: 'Кастомный 40мм драйвер Apple с двойным неодимовым магнитом кольцевой формы воспроизводит богатейший и детализированный звук во всём диапазоне частот. Чип H2 с адаптивным ANC создаёт абсолютную тишину. Сетчатый навершник из нержавеющей стали с подушками из дышащей ткани. Digital Crown для точного управления. USB-C для зарядки и аудио.',
    category: 'Наушники', brand: 'Apple', rating: 4.8, color: '#86868B',
    specs: [
      { label: 'Драйвер', value: '40мм кастомный' },
      { label: 'Чип', value: 'Apple H2' },
      { label: 'ANC', value: 'Активное адаптивное' },
      { label: 'Батарея', value: '20 часов' },
      { label: 'Зарядка', value: 'USB-C / Lightning' },
      { label: 'Вес', value: '384.8 г' }
    ],
    features: ['Computational Audio', 'Spatial Audio', 'Adaptive EQ', 'Digital Crown', 'Transparency Mode', 'Find My'],
  },
  {
    id: 13, name: 'HomePod (2nd Gen)', price: 29990, image: techHomepodImage,
    tagline: 'Звук, который заполняет комнату.',
    description: 'Вычислительное аудио с чипом S7 и акселерометром анализирует акустику комнаты и адаптирует звук в реальном времени. 5 твитеров с направленными лучами и сабвуфер с высоким ходом создают широкую звуковую сцену. Центр умного дома с Thread, Matter и UWB. Siri с распознаванием голосов для персонализированных ответов.',
    category: 'Аксессуары', brand: 'Apple', rating: 4.6, color: '#1D1D1F',
    specs: [
      { label: 'Чип', value: 'S7' },
      { label: 'Динамики', value: '5 твитеров + сабвуфер' },
      { label: 'Связь', value: 'Thread / Matter' },
      { label: 'Аудио', value: 'Spatial Audio' },
      { label: 'Ассистент', value: 'Siri' },
      { label: 'Высота', value: '168 мм' }
    ],
    features: ['Room Sensing', 'Computational Audio', 'Thread Border Router', 'Matter', 'Temperature Sensor', 'Intercom'],
  },
  {
    id: 14, name: 'PlayStation 5 Pro', price: 69990, image: techPs5Image,
    tagline: 'Следующий уровень игр.',
    description: 'GPU с 67% большим количеством вычислительных юнитов для нативного 4K с трассировкой лучей. Технология PSSR (PlayStation Spectral Super Resolution) на основе ИИ для масштабирования изображения без потери качества. SSD 2TB с пропускной способностью 5.5 ГБ/с для мгновенной загрузки. Wi-Fi 7 для онлайн без задержек. Обратная совместимость с 8500+ играми PS4.',
    category: 'Гейминг', brand: 'Sony', rating: 4.8, color: '#1C1C1E',
    specs: [
      { label: 'GPU', value: '16.7 TFLOPS' },
      { label: 'SSD', value: '2TB NVMe' },
      { label: 'RAM', value: '16GB GDDR6' },
      { label: 'Видео', value: '4K 120Hz / 8K' },
      { label: 'Аудио', value: 'Tempest 3D' },
      { label: 'Связь', value: 'Wi-Fi 7 / BT 5.1' }
    ],
    features: ['PSSR AI Upscaling', 'Ray Tracing', '8K Output', 'DualSense Edge', 'VRR', 'Wi-Fi 7'],
    isNew: true
  },
  {
    id: 15, name: 'DJI Air 3', price: 89990, image: techDroneImage,
    tagline: 'Воздух. Свобода. Кинематограф.',
    description: 'Дуальная камера: широкоугольная 1/1.3" CMOS 48MP + телеобъектив 3× для кинематографических ракурсов. Видео 4K HDR 100fps с 10-bit D-Log M для профессиональной цветокоррекции. Время полёта 46 минут — рекорд в классе. Распознавание препятствий во всех направлениях с APAS 5.0. Дальность передачи O4 — до 20 км.',
    category: 'Камеры', brand: 'DJI', rating: 4.7, color: '#636366',
    specs: [
      { label: 'Камера', value: '48MP Dual 1/1.3"' },
      { label: 'Видео', value: '4K HDR 100fps' },
      { label: 'Полёт', value: '46 минут' },
      { label: 'Дальность', value: '20 км O4' },
      { label: 'Вес', value: '720 г' },
      { label: 'Обход', value: 'APAS 5.0 360°' }
    ],
    features: ['Dual Camera', 'D-Log M', 'Waypoint', 'MasterShots', 'Hyperlapse', '10-bit Color'],
  },
  {
    id: 16, name: 'Sonos Era 300', price: 44990, image: techSpeakerImage,
    tagline: 'Пространственный звук. Новое измерение.',
    description: 'Первая колонка с нативным Dolby Atmos — 6 драйверов с направленными звуковыми лучами создают трёхмерную звуковую сцену. Верхний твитер направляет звук к потолку для эффекта высоты. Trueplay адаптирует звук под акустику комнаты. Wi-Fi 6, Bluetooth 5.0, AirPlay 2. Управление голосом через Alexa.',
    category: 'Аксессуары', brand: 'Sonos', rating: 4.7, color: '#F5F5F7',
    specs: [
      { label: 'Драйверы', value: '6 кастомных' },
      { label: 'Аудио', value: 'Dolby Atmos' },
      { label: 'Связь', value: 'Wi-Fi 6 / BT 5.0' },
      { label: 'AirPlay', value: 'AirPlay 2' },
      { label: 'Трекинг', value: 'Trueplay' },
      { label: 'Голос', value: 'Amazon Alexa' }
    ],
    features: ['Dolby Atmos', 'Trueplay', 'AirPlay 2', 'Spotify Connect', 'Voice Control', 'Multi-room'],
  },
];

const categories = ['Все', 'Смартфоны', 'Ноутбуки', 'Планшеты', 'Наушники', 'Камеры', 'Часы', 'Аксессуары', 'Гейминг'];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

const mockReviews = [
  { id: 1, name: 'Дмитрий К.', rating: 5, text: 'Невероятное качество сборки. Камера — лучшее, что было на рынке. Титановый корпус ощущается премиально.', date: '2 дня назад' },
  { id: 2, name: 'Анна С.', rating: 5, text: 'Перешла с Android — ни секунды не жалею. Экосистема работает безупречно, батарея держит весь день.', date: '1 неделю назад' },
  { id: 3, name: 'Максим В.', rating: 4, text: 'Отличный продукт, но цена, конечно, кусается. Впрочем, за качество приходится платить.', date: '2 недели назад' },
];

const contentStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};

const contentItem: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const Electronics = memo(function Electronics({ activeTab, onTabChange }: ElectronicsProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'specs' | 'tech' | 'reviews'>('specs');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems } = usePersistentCart({ storageKey: 'techstore-cart' });
  const { favorites, toggleFavorite, isFavorite } = usePersistentFavorites({ storageKey: 'techstore-favorites' });
  const { orders, createOrder } = usePersistentOrders({ storageKey: 'techstore-orders' });
  const sidebar = useDemoSidebar();

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'Все') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addToCart({ id: String(product.id), name: product.name, price: product.price, image: product.image });
    toast({ title: 'Добавлено в корзину', description: product.name });
  };

  const handleCheckoutComplete = (orderId: string) => {
    createOrder(
      cartItems.map(ci => ({ id: ci.id, name: ci.name, price: ci.price, quantity: ci.quantity, image: ci.image })),
      totalAmount,
      { phone: '+7 (800) 555-01-01' }
    );
    clearCart();
    setIsCheckoutOpen(false);
    toast({ title: 'Заказ оформлен', description: `Номер: ${orderId}`, duration: 3000 });
  };

  const openProduct = (product: Product) => {
    scrollToTop();
    setSelectedProduct(product);
    setActiveProductTab('specs');
    setShowStickyHeader(false);
    if (heroImageRef.current) heroImageRef.current.style.transform = '';
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
  };

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedProduct(null);
    }, 340);
  };

  const handleToggleFavorite = (id: number) => {
    toggleFavorite(id);
    const isNow = !isFavorite(id);
    toast({ title: isNow ? 'Добавлено в избранное' : 'Удалено из избранного', duration: 1500 });
  };

  const sidebarMenuItems = useMemo(() => [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home', onClick: () => { onTabChange?.('home'); sidebar.close(); } },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog', onClick: () => { onTabChange?.('catalog'); sidebar.close(); } },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', active: activeTab === 'cart', badge: totalItems > 0 ? String(totalItems) : undefined, onClick: () => { onTabChange?.('cart'); sidebar.close(); } },
    { icon: <User className="w-5 h-5" />, label: 'Аккаунт', active: activeTab === 'profile', onClick: () => { onTabChange?.('profile'); sidebar.close(); } },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favorites.size > 0 ? String(favorites.size) : undefined, onClick: () => { onTabChange?.('catalog'); sidebar.close(); } },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки', onClick: () => sidebar.close() },
  ], [activeTab, onTabChange, totalItems, favorites.size, sidebar]);

  const renderCatalogGrid = () => {
    const cards: React.ReactElement[] = [];
    let i = 0;
    while (i < filteredProducts.length) {
      const featured = filteredProducts[i];
      cards.push(
        <m.div
          key={`feat-${featured.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04 * cards.length, ease: [0.25, 1, 0.5, 1] }}
          className="relative rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98]"
          style={{ height: 320, background: BG_CARD, transition: 'transform 0.2s ease' }}
          onClick={() => openProduct(featured)}
        >
          <div className="absolute inset-0">
            <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 60%, ${featured.color}15 0%, transparent 60%)` }} />
          </div>
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between">
            <div className="flex gap-1.5">
              {featured.isNew && (
                <span className="px-2.5 py-1 rounded-full"
                  style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                  Новинка
                </span>
              )}
              {featured.isFeatured && !featured.isNew && (
                <span className="px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500', fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, border: '1px solid rgba(255,149,0,0.25)' }}>
                  Рекомендуем
                </span>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(featured.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: isFavorite(featured.id) ? '#FF375F' : 'rgba(255,255,255,0.6)', fill: isFavorite(featured.id) ? '#FF375F' : 'none' }} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}>
            <p style={{ fontFamily: SF, fontSize: '0.55rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.03em', marginBottom: 3 }}>{featured.brand}</p>
            <h3 style={{ fontFamily: SF, fontSize: '1.1rem', fontWeight: 600, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 6 }}>
              {featured.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: SF, fontSize: '0.9rem', fontWeight: 600, color: TEXT }}>{formatPrice(featured.price)}</span>
                {featured.oldPrice && (
                  <span style={{ fontFamily: SF, fontSize: '0.65rem', color: TEXT_TER, textDecoration: 'line-through' }}>{formatPrice(featured.oldPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" style={{ color: '#FF9500', fill: '#FF9500' }} />
                <span style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: TEXT_SEC }}>{featured.rating}</span>
              </div>
            </div>
          </div>
        </m.div>
      );
      i++;
      if (i < filteredProducts.length) {
        const pair: Product[] = [];
        if (i < filteredProducts.length) { pair.push(filteredProducts[i]); i++; }
        if (i < filteredProducts.length) { pair.push(filteredProducts[i]); i++; }
        if (pair.length > 0) {
          cards.push(
            <div key={`pair-${pair[0].id}`} className="grid grid-cols-2 gap-3">
              {pair.map((p, pairIdx) => (
                <m.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.04 * cards.length + pairIdx * 0.06, ease: [0.25, 1, 0.5, 1] }}
                  className="relative rounded-[20px] overflow-hidden cursor-pointer active:scale-[0.97]"
                  style={{ height: pairIdx === 0 ? 220 : 190, background: BG_CARD, transition: 'transform 0.2s ease' }}
                  onClick={() => openProduct(p)}
                >
                  <div className="absolute inset-0">
                    <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 55%, ${p.color}10 0%, transparent 55%)` }} />
                  </div>
                  {p.isNew && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                      style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.5rem', fontWeight: 600 }}>
                      Новинка
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
                    <Heart className="w-3 h-3" style={{ color: isFavorite(p.id) ? '#FF375F' : 'rgba(255,255,255,0.6)', fill: isFavorite(p.id) ? '#FF375F' : 'none' }} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                    <p style={{ fontFamily: SF, fontSize: '0.45rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.02em', marginBottom: 2 }}>{p.brand}</p>
                    <h4 style={{ fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 3 }}>
                      {p.name}
                    </h4>
                    <span style={{ fontFamily: SF, fontSize: '0.75rem', fontWeight: 600, color: TEXT }}>{formatPrice(p.price)}</span>
                  </div>
                </m.div>
              ))}
            </div>
          );
        }
      }
    }
    return cards;
  };

  if (selectedProduct && (activeTab === 'home' || activeTab === 'catalog')) {
    const recommended = products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4);
    const productReviews = mockReviews;

    return (
      <>
        <m.div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ background: BG }}
          initial={{ opacity: 0, x: 50 }}
          animate={productExiting ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 }}
          transition={{ duration: productExiting ? 0.32 : 0.35, ease: productExiting ? [0.32, 0, 0.67, 0] : [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence>
            {showStickyHeader && (
              <m.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 demo-nav-safe"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px) saturate(1.2)', borderBottom: `0.5px solid ${GLASS_BORDER}` }}
              >
                <button onClick={handleProductBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <ChevronLeft className="w-5 h-5 text-white/80" />
                </button>
                <span style={{ fontFamily: SF, fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>{selectedProduct.name}</span>
                <button onClick={() => handleToggleFavorite(selectedProduct.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Heart className="w-4 h-4" style={isFavorite(selectedProduct.id) ? { fill: '#FF375F', color: '#FF375F' } : { color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </m.div>
            )}
          </AnimatePresence>

          <div
            ref={productScrollRef}
            className="flex-1 overflow-y-auto overscroll-y-contain"
            onScroll={(e) => {
              const st = (e.target as HTMLDivElement).scrollTop;
              setShowStickyHeader(st > 240);
              if (heroImageRef.current) {
                heroImageRef.current.style.transform = `translateY(${st * 0.32}px)`;
              }
            }}
          >
            <div className="relative" style={{ height: '50vh', minHeight: 300 }}>
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 demo-nav-safe">
                <button onClick={handleProductBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => handleToggleFavorite(selectedProduct.id)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
                  <Heart className="w-5 h-5" style={isFavorite(selectedProduct.id) ? { fill: '#FF375F', color: '#FF375F' } : { color: 'white' }} />
                </button>
              </div>

              <div ref={heroImageRef} className="absolute inset-0 will-change-transform">
                <LazyImage src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${selectedProduct.color}15 0%, transparent 70%)` }} />
              </div>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 0%, transparent 50%)` }} />

              <div className="absolute bottom-5 left-5 right-5 z-10">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-3 py-1 rounded-full" style={{ background: `${ACCENT}20`, color: ACCENT, fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: `0.5px solid ${ACCENT}30` }}>
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.isNew && (
                    <span className="px-2.5 py-1 rounded-full" style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                      Новинка
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: SF, fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 600, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                  {selectedProduct.name}
                </h1>
              </div>
            </div>

            <m.div
              className="relative z-10 px-5 pb-32"
              style={{ marginTop: -1 }}
              variants={contentStagger}
              initial="hidden"
              animate="visible"
            >
              <m.div variants={contentItem} className="flex items-end justify-between mb-4 pt-2">
                <div>
                  <span style={{ fontFamily: SF, fontSize: '1.6rem', fontWeight: 600, color: TEXT, letterSpacing: '-0.02em' }}>{formatPrice(selectedProduct.price)}</span>
                  {selectedProduct.oldPrice && (
                    <span style={{ fontFamily: SF, fontSize: '0.85rem', color: TEXT_TER, textDecoration: 'line-through', marginLeft: 10 }}>{formatPrice(selectedProduct.oldPrice)}</span>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ fill: i < Math.floor(selectedProduct.rating) ? '#FF9500' : 'rgba(255,255,255,0.1)', color: i < Math.floor(selectedProduct.rating) ? '#FF9500' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                    <span style={{ fontFamily: SF, fontSize: '0.75rem', color: TEXT_SEC, marginLeft: 4 }}>{selectedProduct.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span style={{ fontFamily: SF, fontSize: '0.55rem', color: TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Бренд</span>
                  <p style={{ fontFamily: SF, fontSize: '0.9rem', fontWeight: 600, color: ACCENT, letterSpacing: '-0.01em' }}>{selectedProduct.brand}</p>
                </div>
              </m.div>

              <m.div variants={contentItem} className="grid grid-cols-3 gap-2.5 mb-5">
                {selectedProduct.specs.slice(0, 3).map((spec, idx) => (
                  <div key={idx} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${GLASS_BORDER}` }}>
                    <Cpu className="w-4 h-4 mb-1.5" style={{ color: ACCENT }} />
                    <p style={{ fontFamily: SF, fontSize: '0.55rem', color: TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{spec.label}</p>
                    <p style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, color: TEXT, letterSpacing: '-0.01em' }}>{spec.value}</p>
                  </div>
                ))}
              </m.div>

              <m.div variants={contentItem} className="flex gap-0 mb-5 rounded-xl overflow-hidden" style={{ border: `0.5px solid ${GLASS_BORDER}` }}>
                {(['specs', 'tech', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveProductTab(tab)}
                    className="flex-1 py-3 relative transition-colors duration-200"
                    style={{
                      fontFamily: SF,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: activeProductTab === tab ? TEXT : TEXT_TER,
                      background: activeProductTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent',
                    }}
                  >
                    {tab === 'specs' ? 'Характеристики' : tab === 'tech' ? 'Технологии' : `Отзывы (${productReviews.length})`}
                    {activeProductTab === tab && (
                      <m.div layoutId="tech-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: ACCENT }} />
                    )}
                  </button>
                ))}
              </m.div>

              {activeProductTab === 'specs' && (
                <m.div variants={contentStagger} initial="hidden" animate="visible">
                  <m.p variants={contentItem} style={{ fontFamily: SF, fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em', marginBottom: 20 }}>
                    {selectedProduct.description}
                  </m.p>

                  <m.div variants={contentItem} className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${ACCENT}40` }}>
                    <p style={{ fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Заметка эксперта</p>
                    <p style={{ fontFamily: SF, fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
                      «{selectedProduct.tagline} — {selectedProduct.brand} продолжает задавать стандарты индустрии.»
                    </p>
                  </m.div>

                  <m.div variants={contentItem}>
                    <p style={{ fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Полные характеристики</p>
                    <div className="space-y-0">
                      {selectedProduct.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3" style={{ borderBottom: `0.5px solid ${GLASS_BORDER}` }}>
                          <span style={{ fontFamily: SF, fontSize: '0.8rem', color: TEXT_SEC }}>{spec.label}</span>
                          <span style={{ fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </m.div>
                </m.div>
              )}

              {activeProductTab === 'tech' && (
                <m.div variants={contentStagger} initial="hidden" animate="visible">
                  <m.div variants={contentItem} className="space-y-3 mb-6">
                    {selectedProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${GLASS_BORDER}` }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}12` }}>
                          <Zap className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                        </div>
                        <span style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 500, color: TEXT, letterSpacing: '-0.01em' }}>{feature}</span>
                      </div>
                    ))}
                  </m.div>

                  <m.div variants={contentItem} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: `0.5px solid ${GLASS_BORDER}` }}>
                    <p style={{ fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Почему это важно</p>
                    <p style={{ fontFamily: SF, fontSize: '0.8rem', color: TEXT_SEC, lineHeight: 1.6 }}>
                      Каждая технология в {selectedProduct.name} создана для реальных сценариев использования — от профессиональной работы до повседневных задач. {selectedProduct.brand} инвестирует миллиарды в R&D, чтобы каждая деталь работала безупречно.
                    </p>
                  </m.div>
                </m.div>
              )}

              {activeProductTab === 'reviews' && (
                <m.div variants={contentStagger} initial="hidden" animate="visible" className="space-y-4">
                  <m.div variants={contentItem} className="flex items-center gap-4 mb-2 p-4 rounded-2xl" style={{ background: `${ACCENT}08`, border: `0.5px solid ${ACCENT}15` }}>
                    <div>
                      <span style={{ fontFamily: SF, fontSize: '2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>{selectedProduct.rating}</span>
                      <span style={{ fontFamily: SF, fontSize: '0.8rem', color: TEXT_SEC, marginLeft: 4 }}>/ 5</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5" style={{ fill: i < Math.floor(selectedProduct.rating) ? '#FF9500' : 'rgba(255,255,255,0.1)', color: i < Math.floor(selectedProduct.rating) ? '#FF9500' : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <p style={{ fontFamily: SF, fontSize: '0.7rem', color: TEXT_SEC }}>{productReviews.length} отзывов</p>
                    </div>
                  </m.div>

                  {productReviews.map((review) => (
                    <m.div key={review.id} variants={contentItem} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${GLASS_BORDER}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                            <span style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: ACCENT }}>{review.name[0]}</span>
                          </div>
                          <div>
                            <p style={{ fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{review.name}</p>
                            <p style={{ fontFamily: SF, fontSize: '0.6rem', color: TEXT_TER }}>{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3" style={{ fill: '#FF9500', color: '#FF9500' }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontFamily: SF, fontSize: '0.8rem', color: TEXT_SEC, lineHeight: 1.6 }}>{review.text}</p>
                    </m.div>
                  ))}
                </m.div>
              )}

              <m.div variants={contentItem} className="mt-6 mb-4">
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97]"
                  style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.9rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Добавить в корзину — {formatPrice(selectedProduct.price)}
                </button>
              </m.div>

              <m.div variants={contentItem} className="grid grid-cols-3 gap-3 py-5 mb-2" style={{ borderTop: `0.5px solid ${GLASS_BORDER}`, borderBottom: `0.5px solid ${GLASS_BORDER}` }}>
                {[
                  { icon: Shield, label: 'Гарантия', desc: '2 года' },
                  { icon: Zap, label: 'Доставка', desc: 'За 2 часа' },
                  { icon: Box, label: 'Возврат', desc: '14 дней' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <item.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: ACCENT }} />
                    <p style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: TEXT }}>{item.label}</p>
                    <p style={{ fontFamily: SF, fontSize: '0.6rem', color: TEXT_SEC }}>{item.desc}</p>
                  </div>
                ))}
              </m.div>

              {recommended.length > 0 && (
                <m.div variants={contentItem} className="mt-5">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Рекомендации</span>
                      <h3 style={{ fontFamily: SF, fontSize: '1.2rem', fontWeight: 600, color: TEXT, marginTop: 2, letterSpacing: '-0.02em' }}>Вам также <em style={{ fontStyle: 'italic', color: ACCENT }}>понравится</em></h3>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
                    {recommended.map((p) => (
                      <div
                        key={p.id}
                        className="flex-shrink-0 cursor-pointer active:scale-[0.97]"
                        style={{ width: 140, transition: 'transform 0.15s ease' }}
                        onClick={() => { openProduct(p); }}
                      >
                        <div className="relative rounded-[18px] overflow-hidden mb-2" style={{ height: 140, background: BG_CARD }}>
                          <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="truncate" style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: TEXT, letterSpacing: '-0.01em' }}>{p.name}</p>
                        <span style={{ fontFamily: SF, fontSize: '0.65rem', fontWeight: 600, color: TEXT_SEC }}>{formatPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}
            </m.div>
          </div>
        </m.div>
      </>
    );
  }

  if (activeTab === 'home') {
    const featured = products.filter(p => p.isFeatured);
    const newProducts = products.filter(p => p.isNew);
    const appleProducts = products.filter(p => p.brand === 'Apple').slice(0, 6);
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="TechStore" subtitle="Premium Tech"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden"
            style={{ height: '62vh' }}
          >
            <div className="absolute inset-0">
              <AutoplayVideo
                src="/videos/techstore_2025.mp4"
                poster={iphone15ProMaxImage}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.85) saturate(1.1)' }}
              />
            </div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 0%, transparent 50%)` }} />
            <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-6 pb-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>
                  Новинка 2026
                </span>
                <h1 style={{ fontFamily: SF, fontSize: '2.8rem', fontWeight: 600, color: TEXT, lineHeight: 0.95, marginTop: 6, letterSpacing: '-0.04em' }}>
                  iPhone 16 <em style={{ fontStyle: 'italic', fontWeight: 300, color: ACCENT }}>Pro</em>
                </h1>
                <p style={{ fontFamily: SF, fontSize: '1rem', fontWeight: 400, color: TEXT_SEC, marginTop: 8, letterSpacing: '-0.01em' }}>
                  Титан. Так закалён. Так Pro.
                </p>
                <div className="flex gap-3 mt-6 justify-center">
                  <button
                    onClick={() => openProduct(products[0])}
                    className="px-7 py-2.5 rounded-full active:scale-[0.97]"
                    style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
                  >
                    Подробнее
                  </button>
                  <button
                    onClick={() => handleAddToCart(products[0])}
                    className="px-7 py-2.5 rounded-full active:scale-[0.97]"
                    style={{ background: 'rgba(255,255,255,0.1)', color: TEXT, fontFamily: SF, fontSize: '0.8rem', fontWeight: 500, border: `1px solid rgba(255,255,255,0.15)`, transition: 'transform 0.15s ease' }}
                  >
                    Купить
                  </button>
                </div>
              </m.div>
            </div>
          </m.div>

          <div className="grid grid-cols-3 gap-2.5 px-5 -mt-5 relative z-10">
            {[
              { icon: Shield, label: 'Гарантия', value: '2 года' },
              { icon: Zap, label: 'Доставка', value: 'За 2 часа' },
              { icon: Award, label: 'Оригинал', value: '100%' },
            ].map((item, idx) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + idx * 0.08 }}
                className="p-3 rounded-2xl text-center"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)', border: `0.5px solid ${GLASS_BORDER}` }}
              >
                <item.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: ACCENT }} />
                <p style={{ fontFamily: SF, fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_SEC }}>{item.label}</p>
                <p style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: TEXT, marginTop: 1 }}>{item.value}</p>
              </m.div>
            ))}
          </div>

          <div className="px-5 mt-8 mb-8">
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98]"
              style={{ height: 120, background: `linear-gradient(135deg, ${ACCENT}10 0%, rgba(255,149,0,0.06) 100%)`, border: `1px solid ${GLASS_BORDER}`, transition: 'transform 0.15s ease' }}
              onClick={() => onTabChange?.('catalog')}
            >
              <div className="absolute inset-0 p-5 flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>Специальное предложение</p>
                  <h3 style={{ fontFamily: SF, fontSize: '1.15rem', fontWeight: 600, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Trade-in: скидка <em style={{ fontStyle: 'italic', color: ACCENT }}>до 30%</em></h3>
                  <p style={{ fontFamily: SF, fontSize: '0.65rem', color: TEXT_SEC, marginTop: 4 }}>Сдайте старое устройство — получите скидку</p>
                </div>
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                  <ChevronRight className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
              </div>
            </m.div>
          </div>

          <m.div
            className="px-5 mb-8"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Рекомендуем</span>
                <h2 style={{ fontFamily: SF, fontSize: '1.5rem', fontWeight: 600, color: TEXT, marginTop: 3, letterSpacing: '-0.03em' }}>Выбор <em style={{ fontStyle: 'italic', color: ACCENT }}>экспертов</em></h2>
              </div>
              <button onClick={() => onTabChange?.('catalog')} style={{ fontFamily: SF, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>Все →</button>
            </m.div>
            <m.div variants={contentItem} className="flex gap-3.5 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {featured.slice(0, 6).map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * idx }}
                  className="relative flex-shrink-0 cursor-pointer active:scale-[0.97]"
                  style={{ width: 165, transition: 'transform 0.15s ease' }}
                  onClick={() => openProduct(product)}
                >
                  <div className="relative rounded-[20px] overflow-hidden mb-2.5" style={{ height: 200, background: BG_CARD }}>
                    <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
                    >
                      <Heart className="w-3 h-3" style={{ color: isFavorite(product.id) ? '#FF375F' : 'rgba(255,255,255,0.5)', fill: isFavorite(product.id) ? '#FF375F' : 'none' }} />
                    </button>
                    {product.isNew && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                        style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.5rem', fontWeight: 600 }}>Новинка</span>
                    )}
                  </div>
                  <p style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.02em', marginBottom: 2 }}>{product.brand}</p>
                  <p className="truncate" style={{ fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, color: TEXT, marginBottom: 3, letterSpacing: '-0.02em' }}>{product.name}</p>
                  <span style={{ fontFamily: SF, fontSize: '0.75rem', fontWeight: 600, color: TEXT }}>{formatPrice(product.price)}</span>
                </m.div>
              ))}
            </m.div>
          </m.div>

          <m.div
            className="px-5 mb-8"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Категории</span>
                <h2 style={{ fontFamily: SF, fontSize: '1.5rem', fontWeight: 600, color: TEXT, marginTop: 3, letterSpacing: '-0.03em' }}>Каталог <em style={{ fontStyle: 'italic', color: ACCENT }}>устройств</em></h2>
              </div>
            </m.div>
            <m.div variants={contentItem} className="grid grid-cols-4 gap-2.5">
              {Object.entries(CATEGORY_MAP).slice(0, 8).map(([cat, { image }], idx) => (
                <m.button
                  key={cat}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * idx }}
                  className="relative rounded-2xl overflow-hidden text-center active:scale-[0.95]"
                  style={{ aspectRatio: '1', transition: 'transform 0.15s ease' }}
                  onClick={() => { setSelectedCategory(cat); onTabChange?.('catalog'); }}
                >
                  <LazyImage src={image} alt={cat} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)' }} />
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <p style={{ fontFamily: SF, fontSize: '0.55rem', fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{cat}</p>
                  </div>
                </m.button>
              ))}
            </m.div>
          </m.div>

          <m.div
            className="px-5 mb-8"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Новинки</span>
                <h2 style={{ fontFamily: SF, fontSize: '1.5rem', fontWeight: 600, color: TEXT, marginTop: 3, letterSpacing: '-0.03em' }}>Только что <em style={{ fontStyle: 'italic', color: ACCENT }}>вышли</em></h2>
              </div>
            </m.div>
            <m.div variants={contentItem} className="space-y-3">
              {newProducts.slice(0, 4).map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * idx }}
                  className="flex gap-3.5 p-3.5 rounded-[20px] cursor-pointer active:scale-[0.98]"
                  style={{ background: BG_CARD, transition: 'transform 0.15s ease' }}
                  onClick={() => openProduct(product)}
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: BG_CARD }}>
                    <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 500, color: ACCENT }}>{product.brand}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.45rem', fontWeight: 600 }}>Новинка</span>
                    </div>
                    <p className="truncate" style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, color: TEXT, marginBottom: 3, letterSpacing: '-0.02em' }}>{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{formatPrice(product.price)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: '#FF9500', fill: '#FF9500' }} />
                        <span style={{ fontFamily: SF, fontSize: '0.65rem', fontWeight: 600, color: TEXT_SEC }}>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </m.div>
          </m.div>

          <m.div
            className="px-5 mb-8"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Экосистема</span>
                <h2 style={{ fontFamily: SF, fontSize: '1.5rem', fontWeight: 600, color: TEXT, marginTop: 3, letterSpacing: '-0.03em' }}>Мир <em style={{ fontStyle: 'italic', color: ACCENT }}>Apple</em></h2>
              </div>
              <button onClick={() => { setSelectedCategory('Все'); onTabChange?.('catalog'); }} style={{ fontFamily: SF, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>Все →</button>
            </m.div>
            <m.div variants={contentItem} className="flex gap-3.5 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {appleProducts.map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * idx }}
                  className="relative flex-shrink-0 cursor-pointer active:scale-[0.97]"
                  style={{ width: 140, transition: 'transform 0.15s ease' }}
                  onClick={() => openProduct(product)}
                >
                  <div className="relative rounded-[18px] overflow-hidden mb-2" style={{ height: 140, background: BG_CARD }}>
                    <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="truncate" style={{ fontFamily: SF, fontSize: '0.7rem', fontWeight: 600, color: TEXT, marginBottom: 2, letterSpacing: '-0.01em' }}>{product.name}</p>
                  <span style={{ fontFamily: SF, fontSize: '0.65rem', fontWeight: 600, color: TEXT_SEC }}>{formatPrice(product.price)}</span>
                </m.div>
              ))}
            </m.div>
          </m.div>

          <div className="px-5 pb-4">
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-5 rounded-[24px] text-center"
              style={{ background: BG_CARD }}
            >
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                <Phone className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <p style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>Поддержка</p>
              <h3 style={{ fontFamily: SF, fontSize: '1.1rem', fontWeight: 600, color: TEXT, marginBottom: 6, letterSpacing: '-0.02em' }}>Нужна <em style={{ fontStyle: 'italic', color: ACCENT }}>помощь?</em></h3>
              <p style={{ fontFamily: SF, fontSize: '0.7rem', color: TEXT_SEC, marginBottom: 12 }}>Эксперты на связи 24/7</p>
              <button
                className="w-full py-3 rounded-2xl active:scale-[0.97]"
                style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.8rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
              >
                Связаться
              </button>
            </m.div>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="TechStore" subtitle="Premium Tech"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <m.div
            className="px-5 pt-5 pb-3"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-center justify-between mb-5">
              <div>
                <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Каталог</span>
                <h1 style={{ fontFamily: SF, fontSize: '1.8rem', fontWeight: 600, color: TEXT, marginTop: 2, letterSpacing: '-0.03em' }}>Все <em style={{ fontStyle: 'italic', color: ACCENT }}>товары</em></h1>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
                <Grid className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
            </m.div>

            <m.div variants={contentItem} className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: TEXT_TER }} />
              <input
                type="text"
                placeholder="Поиск устройств..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder:text-white/25 focus:outline-none text-sm"
                style={{ background: BG_CARD, border: `1px solid ${GLASS_BORDER}`, fontFamily: SF }}
              />
            </m.div>

            <m.div variants={contentItem} className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3.5 py-2 rounded-full whitespace-nowrap transition-all"
                  style={{
                    background: selectedCategory === cat ? ACCENT : BG_CARD,
                    color: selectedCategory === cat ? '#fff' : TEXT_SEC,
                    border: `1px solid ${selectedCategory === cat ? 'transparent' : GLASS_BORDER}`,
                    fontFamily: SF, fontSize: '0.75rem', fontWeight: selectedCategory === cat ? 600 : 400
                  }}
                >
                  {cat !== 'Все' && CATEGORY_MAP[cat]?.emoji ? `${CATEGORY_MAP[cat].emoji} ` : ''}{cat}
                </button>
              ))}
            </m.div>
          </m.div>

          <div className="px-4 space-y-3 pb-4">
            {filteredProducts.length === 0 ? (
              <EmptyState type="search" title="Ничего не найдено" description="Попробуйте изменить параметры поиска" />
            ) : (
              renderCatalogGrid()
            )}
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'cart') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="TechStore" subtitle="Premium Tech"
        />
        <div className="min-h-screen text-white pb-32 smooth-scroll-page" style={{ background: BG }}>
          <m.div
            className="px-5 pt-5"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="mb-6">
              <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Заказ</span>
              <h1 style={{ fontFamily: SF, fontSize: '1.8rem', fontWeight: 600, color: TEXT, marginTop: 2, letterSpacing: '-0.03em' }}>Корзина</h1>
            </m.div>

            {cartItems.length === 0 ? (
              <m.div variants={contentItem}>
                <EmptyState
                  type="cart"
                  title="Корзина пуста"
                  description="Добавьте устройства из каталога"
                  actionLabel="Перейти в каталог"
                  onAction={() => onTabChange?.('catalog')}
                />
              </m.div>
            ) : (
              <m.div variants={contentItem} className="space-y-3 mb-40">
                {cartItems.map((item, idx) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex gap-3.5 p-3.5 rounded-[20px]"
                    style={{ background: BG_CARD }}
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: GLASS }}>
                      <LazyImage src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="truncate" style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, color: TEXT, marginBottom: 2, letterSpacing: '-0.02em' }}>{item.name}</p>
                        <p style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, color: TEXT }}>{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                        >
                          <span style={{ color: TEXT_SEC, fontSize: '0.8rem' }}>{item.quantity > 1 ? '−' : '×'}</span>
                        </button>
                        <span style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, color: TEXT, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                        >
                          <span style={{ color: TEXT_SEC, fontSize: '0.8rem' }}>+</span>
                        </button>
                      </div>
                    </div>
                  </m.div>
                ))}
              </m.div>
            )}
          </m.div>

          {cartItems.length > 0 && (
            <div className="fixed bottom-24 left-0 right-0 px-5 py-4 z-30" style={{ background: `${BG}f0`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${GLASS_BORDER}` }}>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: SF, fontSize: '0.85rem', color: TEXT_SEC }}>Итого</span>
                  <span style={{ fontFamily: SF, fontSize: '1.3rem', fontWeight: 600, color: TEXT, letterSpacing: '-0.02em' }}>{formatPrice(totalAmount)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-2xl active:scale-[0.97]"
                  style={{ background: ACCENT, color: '#fff', fontFamily: SF, fontSize: '0.85rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          )}

          <CheckoutDrawer
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cartItems}
            total={totalAmount}
            currency="₽"
            storeName="TechStore"
            onOrderComplete={handleCheckoutComplete}
          />
        </div>
      </>
    );
  }

  if (activeTab === 'profile') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="TechStore" subtitle="Premium Tech"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <m.div
            className="px-5 pt-5"
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="mb-6">
              <span style={{ fontFamily: SF, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Аккаунт</span>
              <h1 style={{ fontFamily: SF, fontSize: '1.8rem', fontWeight: 600, color: TEXT, marginTop: 2, letterSpacing: '-0.03em' }}>Профиль</h1>
            </m.div>

            <m.div variants={contentItem} className="text-center mb-8">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 p-[2px]" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #5856D6 100%)` }}>
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: BG }}>
                  <User className="w-10 h-10" style={{ color: ACCENT }} />
                </div>
              </div>
              <h2 style={{ fontFamily: SF, fontSize: '1.3rem', fontWeight: 600, color: TEXT, marginBottom: 4, letterSpacing: '-0.02em' }}>Алексей Петров</h2>
              <p style={{ fontFamily: SF, fontSize: '0.75rem', color: TEXT_SEC }}>alexey.petrov@icloud.com</p>
            </m.div>

            <m.div variants={contentItem} className="grid grid-cols-3 gap-2.5 mb-8">
              {[
                { icon: ShoppingBag, value: orders.length, label: 'Заказов' },
                { icon: Heart, value: favorites.size, label: 'Избранное' },
                { icon: Award, value: '1250', label: 'Баллов' }
              ].map((stat, idx) => (
                <div key={idx} className="p-3.5 rounded-[20px] text-center" style={{ background: BG_CARD }}>
                  <stat.icon className="w-4 h-4 mx-auto mb-2" style={{ color: ACCENT }} />
                  <p style={{ fontFamily: SF, fontSize: '1.1rem', fontWeight: 600, color: TEXT, marginBottom: 2 }}>{stat.value}</p>
                  <p style={{ fontFamily: SF, fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_SEC }}>{stat.label}</p>
                </div>
              ))}
            </m.div>

            <m.div variants={contentItem} className="mb-6">
              <h3 style={{ fontFamily: SF, fontSize: '1.1rem', fontWeight: 600, color: TEXT, marginBottom: 12, letterSpacing: '-0.02em' }}>Мои <em style={{ fontStyle: 'italic', color: ACCENT }}>заказы</em></h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3" style={{ color: TEXT_TER }} />
                  <p style={{ fontFamily: SF, fontSize: '0.8rem', color: TEXT_SEC }}>У вас пока нет заказов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order, idx) => (
                    <m.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                      className="p-4 rounded-[18px]"
                      style={{ background: BG_CARD }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ fontFamily: SF, fontSize: '0.7rem', color: TEXT_SEC, fontVariantNumeric: 'tabular-nums' }}>#{order.id.slice(-8)}</span>
                        <span className="px-2.5 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT, fontFamily: SF, fontSize: '0.6rem', fontWeight: 600 }}>
                          {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтвержден' : order.status === 'processing' ? 'Обработка' : order.status === 'shipped' ? 'В пути' : 'Доставлен'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ fontFamily: SF, fontSize: '0.75rem', color: TEXT_SEC }}>{order.items.length} товаров</span>
                        <span style={{ fontFamily: SF, fontSize: '0.9rem', fontWeight: 600, color: TEXT }}>{formatPrice(order.total)}</span>
                      </div>
                    </m.div>
                  ))}
                </div>
              )}
            </m.div>

            <m.div variants={contentItem} className="space-y-2">
              {[
                { icon: Package, label: 'История заказов' },
                { icon: Shield, label: 'Гарантия и поддержка' },
                { icon: Crown, label: 'Программа лояльности' },
                { icon: Settings, label: 'Настройки' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center gap-4 p-4 rounded-[18px] transition-all active:scale-[0.98]"
                  style={{ background: BG_CARD, transition: 'transform 0.15s ease' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: ACCENT }} />
                  <span className="flex-1 text-left" style={{ fontFamily: SF, fontSize: '0.85rem', fontWeight: 500, color: TEXT }}>{item.label}</span>
                  <ChevronRight className="w-4 h-4" style={{ color: TEXT_TER }} />
                </button>
              ))}
            </m.div>
          </m.div>
        </div>
      </>
    );
  }

  return null;
});

function ElectronicsWithTheme(props: ElectronicsProps) {
  return (
    <DemoThemeProvider themeId="electronics">
      <Electronics {...props} />
    </DemoThemeProvider>
  );
}

export default memo(ElectronicsWithTheme);
