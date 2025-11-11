import React, { createContext, useContext, useState, useEffect } from 'react';

interface Task {
  id: string;
  platform: 'tiktok' | 'instagram';
  type: 'like' | 'follow' | 'share' | 'view' | 'comment';
  title: string;
  description: string;
  coins: number;
  url: string;
  completed: boolean;
  timeLimit?: number;
  startTime?: number;
  minimumTime?: number;
  verificationStatus?: 'pending' | 'verifying' | 'verified' | 'failed';
  attempts?: number;
  lastAttempt?: number;
}

interface UserStats {
  totalCoins: number;
  tasksCompleted: number;
  currentStreak: number;
  level: number;
  totalSaved: number;
}

interface RewardsContextType {
  userStats: UserStats;
  tasks: Task[];
  completeTask: (taskId: string) => void;
  updateStats: (newStats: Partial<UserStats>) => void;
  startTask: (taskId: string) => void;
  verifyTask: (taskId: string) => Promise<boolean>;
}

const defaultTasks: Task[] = [
  {
    id: 'tiktok_like_1',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк TikTok видео',
    description: 'Поставьте лайк нашему последнему видео о разработке приложений',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 8,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_follow',
    platform: 'tiktok',
    type: 'follow',
    title: 'Подписка TikTok',
    description: 'Подпишитесь на наш TikTok аккаунт',
    coins: 150,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 5,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_like_1',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Instagram поста',
    description: 'Лайкните наш пост про новые функции Telegram Mini Apps',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 6,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_follow',
    platform: 'instagram',
    type: 'follow',
    title: 'Подписка Instagram',
    description: 'Подпишитесь на наш Instagram для получения актуальных новостей',
    coins: 120,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 4,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_share_1',
    platform: 'tiktok',
    type: 'share',
    title: 'Репост TikTok',
    description: 'Поделитесь нашим видео о создании Telegram ботов',
    coins: 100,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 10
  },
  {
    id: 'instagram_share_1',
    platform: 'instagram',
    type: 'share',
    title: 'Репост Instagram',
    description: 'Поделитесь в Stories нашим постом',
    coins: 80,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 8
  },
  {
    id: 'tiktok_comment_1',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий TikTok',
    description: 'Оставьте комментарий под нашим видео о МиниАппах',
    coins: 75,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 7
  },
  {
    id: 'instagram_comment_1',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий Instagram',
    description: 'Прокомментируйте наш пост о новых возможностях',
    coins: 60,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 5
  },
  {
    id: 'tiktok_view_1',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok видео',
    description: 'Досмотрите до конца наше видео о заработке с ТГ ботами',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 3
  },
  {
    id: 'instagram_view_1',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр Instagram Reels',
    description: 'Посмотрите наш Reels о создании бизнес-приложений',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 2
  },
  {
    id: 'tiktok_like_2',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк TikTok #2',
    description: 'Поставьте лайк видео о кейсах наших клиентов',
    coins: 45,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 4
  },
  {
    id: 'instagram_like_2',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Instagram #2',
    description: 'Лайкните пост о том, как мы помогаем бизнесу расти',
    coins: 35,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3
  },
  // Дополнительные TikTok задания
  {
    id: 'tiktok_like_3',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк TikTok #3',
    description: 'Поставьте лайк нашему видео о мобильной разработке',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 8,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_like_4',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк TikTok #4',
    description: 'Лайкните видео о дизайне интерфейсов',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 8,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_like_5',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк TikTok #5',
    description: 'Поставьте лайк видео о технологиях будущего',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 8,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_share_2',
    platform: 'tiktok',
    type: 'share',
    title: 'Репост TikTok #2',
    description: 'Поделитесь нашим видео о стартапах',
    coins: 100,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 10,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_share_3',
    platform: 'tiktok',
    type: 'share',
    title: 'Репост TikTok #3',
    description: 'Поделитесь видео о заработке в интернете',
    coins: 100,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 10,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_comment_2',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий TikTok #2',
    description: 'Оставьте развернутый комментарий о своем опыте',
    coins: 75,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 7,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_comment_3',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий TikTok #3',
    description: 'Задайте интересный вопрос в комментариях',
    coins: 75,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 7,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_view_2',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok #2',
    description: 'Полностью досмотрите видео о веб-дизайне',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 12,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_view_3',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok #3',
    description: 'Посмотрите видео о цифровом маркетинге',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 12,
    verificationStatus: 'pending',
    attempts: 0
  },
  // Дополнительные Instagram задания
  {
    id: 'instagram_like_3',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Instagram #3',
    description: 'Лайкните пост о программировании',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 6,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_like_4',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Instagram #4',
    description: 'Поставьте лайк посту о цифровых технологиях',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 6,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_like_5',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Instagram #5',
    description: 'Лайкните пост о росте бизнеса',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 6,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_share_2',
    platform: 'instagram',
    type: 'share',
    title: 'Репост Instagram #2',
    description: 'Поделитесь в Stories постом о наших услугах',
    coins: 80,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 12,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_share_3',
    platform: 'instagram',
    type: 'share',
    title: 'Репост Instagram #3',
    description: 'Поделитесь Reels с вашими подписчиками',
    coins: 80,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 12,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_comment_2',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий Instagram #2',
    description: 'Расскажите о своем опыте работы с нами',
    coins: 60,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 18,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_comment_3',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий Instagram #3',
    description: 'Поделитесь своими идеями в комментариях',
    coins: 60,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 18,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_view_2',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр Instagram #2',
    description: 'Посмотрите наш Reels о клиентских кейсах',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 2,
    minimumTime: 10,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_view_3',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр Instagram #3',
    description: 'Просмотрите все Stories за сегодня',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 2,
    minimumTime: 10,
    verificationStatus: 'pending',
    attempts: 0
  },
  // Специальные задания для продвинутых пользователей
  {
    id: 'tiktok_duet_create',
    platform: 'tiktok',
    type: 'share',
    title: 'Создать Duet',
    description: 'Создайте Duet с нашим видео и поделитесь мыслями',
    coins: 200,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 30,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_reel_create',
    platform: 'instagram',
    type: 'share',
    title: 'Создать свой Reels',
    description: 'Создайте Reels о нашей компании',
    coins: 250,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 20,
    minimumTime: 40,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_playlist_save',
    platform: 'tiktok',
    type: 'like',
    title: 'Сохранить в избранное',
    description: 'Добавьте наши видео в свой плейлист',
    coins: 90,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_tag_post',
    platform: 'instagram',
    type: 'share',
    title: 'Отметить в посте',
    description: 'Отметьте наш аккаунт в своем новом посте',
    coins: 180,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 12,
    minimumTime: 25,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_hashtag_use',
    platform: 'tiktok',
    type: 'share',
    title: 'Использовать хештег',
    description: 'Создайте видео с хештегом #web4tg',
    coins: 220,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 18,
    minimumTime: 35,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_hashtag_post',
    platform: 'instagram',
    type: 'share',
    title: 'Пост с хештегом',
    description: 'Создайте пост с хештегом #web4tg',
    coins: 200,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 30,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_trend_follow',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр трендов',
    description: 'Найдите наши видео в трендах и досмотрите',
    coins: 60,
    url: 'https://tiktok.com/discover',
    completed: false,
    timeLimit: 10,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_explore_visit',
    platform: 'instagram',
    type: 'view',
    title: 'Исследование ленты',
    description: 'Найдите наши посты через поиск и лайкните',
    coins: 45,
    url: 'https://instagram.com/explore',
    completed: false,
    timeLimit: 8,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_sound_original',
    platform: 'tiktok',
    type: 'share',
    title: 'Использовать оригинальный звук',
    description: 'Используйте звук из нашего видео для своего контента',
    coins: 190,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 35,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_live_watch',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр прямого эфира',
    description: 'Присоединитесь к нашим прямым эфирам',
    coins: 120,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 20,
    minimumTime: 30,
    verificationStatus: 'pending',
    attempts: 0
  },
  // Еще больше заданий для максимальной раскрутки
  {
    id: 'tiktok_like_multiple_1',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк 3 видео подряд',
    description: 'Поставьте лайки на 3 наших последних видео подряд',
    coins: 150,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 25,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_like_multiple_1',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк 5 постов подряд',
    description: 'Лайкните 5 наших последних постов подряд',
    coins: 200,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 10,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_story_add',
    platform: 'tiktok',
    type: 'share',
    title: 'Добавить в историю',
    description: 'Добавьте наше видео в свою историю TikTok',
    coins: 130,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_story_mention',
    platform: 'instagram',
    type: 'share',
    title: 'Упомянуть в Stories',
    description: 'Упомяните @web4tg в своих Instagram Stories',
    coins: 160,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 10,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_challenge_join',
    platform: 'tiktok',
    type: 'share',
    title: 'Участие в челлендже',
    description: 'Примите участие в нашем TikTok челлендже',
    coins: 300,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 25,
    minimumTime: 45,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_tutorial_watch',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр туториала',
    description: 'Посмотрите наш Instagram туториал до конца',
    coins: 80,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 25,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_music_add',
    platform: 'tiktok',
    type: 'like',
    title: 'Добавить музыку в избранное',
    description: 'Добавьте музыку из наших видео в избранное',
    coins: 70,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 10,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_poll_vote',
    platform: 'instagram',
    type: 'view',
    title: 'Голосование в опросе',
    description: 'Проголосуйте в наших Instagram Stories опросах',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 3,
    minimumTime: 8,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_effect_use',
    platform: 'tiktok',
    type: 'share',
    title: 'Использовать эффект',
    description: 'Используйте эффект из наших TikTok видео',
    coins: 170,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 12,
    minimumTime: 25,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_dm_send',
    platform: 'instagram',
    type: 'share',
    title: 'Отправить сообщение',
    description: 'Отправьте нам сообщение в Instagram Direct',
    coins: 90,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 12,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_profile_visit_deep',
    platform: 'tiktok',
    type: 'view',
    title: 'Глубокий просмотр профиля',
    description: 'Посетите наш профиль и просмотрите все разделы',
    coins: 60,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 20,
    minimumTime: 35,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_highlight_view',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр сохраненных историй',
    description: 'Просмотрите все наши сохраненные истории',
    coins: 50,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 25,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_collab_request',
    platform: 'tiktok',
    type: 'comment',
    title: 'Запрос на коллаборацию',
    description: 'Предложите идею для совместного видео в комментариях',
    coins: 250,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 10,
    minimumTime: 30,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_business_question',
    platform: 'instagram',
    type: 'comment',
    title: 'Вопрос о бизнесе',
    description: 'Задайте вопрос о развитии бизнеса в комментариях',
    coins: 100,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 20,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_friend_invite',
    platform: 'tiktok',
    type: 'share',
    title: 'Пригласить друга',
    description: 'Пригласите друга подписаться на наш TikTok',
    coins: 180,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 15,
    minimumTime: 30,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_friend_tag',
    platform: 'instagram',
    type: 'comment',
    title: 'Отметить друга',
    description: 'Отметьте друга в комментариях к нашему посту',
    coins: 85,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 10,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_weekly_watch',
    platform: 'tiktok',
    type: 'view',
    title: 'Еженедельный просмотр',
    description: 'Просматривайте наши видео каждую неделю',
    coins: 200,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 30,
    minimumTime: 60,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'instagram_carousel_swipe',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр карусели',
    description: 'Просмотрите все слайды в наших Instagram карусели',
    coins: 55,
    url: 'https://instagram.com/web4tg',
    completed: false,
    timeLimit: 8,
    minimumTime: 15,
    verificationStatus: 'pending',
    attempts: 0
  },
  {
    id: 'tiktok_notification_enable',
    platform: 'tiktok',
    type: 'follow',
    title: 'Включить уведомления',
    description: 'Включите уведомления о новых видео',
    coins: 120,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    timeLimit: 5,
    minimumTime: 10,
    verificationStatus: 'pending',
    attempts: 0
  }
];

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [userStats, setUserStats] = useState<UserStats>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('userRewardsStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalCoins: 0,
      tasksCompleted: 0,
      currentStreak: 0,
      level: 1,
      totalSaved: 0
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('userTasks');
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultTasks;
  });

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('userRewardsStats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('userTasks', JSON.stringify(tasks));
  }, [tasks]);

  const updateStats = (newStats: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
  };

  const startTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              startTime: Date.now(), 
              verificationStatus: 'pending' as const,
              attempts: (task.attempts || 0) + 1,
              lastAttempt: Date.now()
            }
          : task
      )
    );
  };

  const verifyTask = async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.startTime) return false;

    // Check minimum time spent
    const timeSpent = Date.now() - task.startTime;
    const minimumTimeMs = (task.minimumTime || 5) * 1000;
    
    if (timeSpent < minimumTimeMs) {
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, verificationStatus: 'failed' as const }
            : t
        )
      );
      return false;
    }

    // Check if too many attempts
    if ((task.attempts || 0) > 3) {
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, verificationStatus: 'failed' as const }
            : t
        )
      );
      return false;
    }

    // Check cooldown period (prevent spam)
    if (task.lastAttempt && Date.now() - task.lastAttempt < 30000) {
      return false;
    }

    // Mark as verified and complete
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId 
          ? { ...t, verificationStatus: 'verified' as const, completed: true }
          : t
      )
    );

    // Award coins
    setUserStats(prevStats => ({
      ...prevStats,
      totalCoins: prevStats.totalCoins + task.coins,
      tasksCompleted: prevStats.tasksCompleted + 1,
      currentStreak: prevStats.currentStreak + 1,
      level: Math.floor((prevStats.tasksCompleted + 1) / 5) + 1
    }));

    return true;
  };

  const completeTask = (taskId: string) => {
    verifyTask(taskId);
  };

  const value = {
    userStats,
    tasks,
    completeTask,
    updateStats,
    startTask,
    verifyTask
  };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}