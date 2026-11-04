import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Film, MapPin, Phone } from 'lucide-react';
import './MedicalAbout.css';

const asset=(name:string)=>`/medical/generated/${name}.webp`;
export default function MedicalAbout({onBack,onDoctors,onServices,onBook}:{onBack:()=>void;onDoctors:()=>void;onServices:()=>void;onBook:()=>void}){
 const [videoUnavailable,setVideoUnavailable]=useState(false);
 return <article className="medabout">
  <button type="button" className="medabout-back" onClick={onBack}><ArrowLeft size={18}/> Главная</button>
  <div className="medabout-kicker"><span>О ЦЕНТРЕ / БЛИЖЕ</span><span>01 — 03</span></div>
  <h1>МЕСТО,<br/>ГДЕ ВАС<br/><span>СЛЫШАТ.</span></h1>
  <p className="medabout-lead">Спокойное пространство для разговора о самом важном — вашем здоровье.</p>
  <figure className="medabout-feature"><img src={asset('med-v2-center-exterior')} alt="Иллюстрация входа в демонстрационный медицинский центр"/><figcaption>01 / НАЧИНАЕМ СО ВСТРЕЧИ</figcaption></figure>
  <section className="medabout-copy"><span className="medabout-label">НАШ ПОДХОД</span><h2>Бережно.<br/>Понятно.<br/><em>По-человечески.</em></h2><p>Забота начинается с внимания. В центре каждого приёма — ваши вопросы, история здоровья и время, чтобы всё обсудить.</p><p>Мы создали демонстрацию пространства, в котором можно познакомиться со специалистами и увидеть, как устроена запись.</p></section>
  <section className="medabout-story" aria-labelledby="medabout-story-title"><div className="medabout-rule"><span>ПРОСТРАНСТВО / 01 — 03</span><span>БЛИЖЕ</span></div><h2 id="medabout-story-title">МЕСТО,<br/>ГДЕ СПОКОЙНО<span>.</span></h2><p>От первого шага до встречи со специалистом — пространство, продуманное для вашего комфорта.</p>
   <figure className="medabout-chapter"><img src={asset('med-v2-center-exterior')} alt="Вход в демонстрационный центр" loading="lazy"/><figcaption><span>01 / ВХОД</span><strong>Первый шаг.</strong><p>Всё начинается с пространства, в котором легко сориентироваться.</p></figcaption></figure>
   <figure className="medabout-chapter"><img src={asset('med-v2-center-reception')} alt="Демонстрационный ресепшен и зона ожидания" loading="lazy"/><figcaption><span>02 / РЕСЕПШЕН</span><strong>Вас встретят.</strong><p>Светлая зона ожидания и стойка, где можно задать организационные вопросы.</p></figcaption></figure>
   <figure className="medabout-chapter"><img src={asset('med-v2-center-room')} alt="Демонстрационный кабинет врача" loading="lazy"/><figcaption><span>03 / КАБИНЕТ</span><strong>Время для разговора.</strong><p>Спокойная обстановка для встречи со специалистом и ваших вопросов.</p></figcaption></figure>
   <p className="medabout-illustration-note">Изображения созданы для демонстрации и не показывают реальный центр.</p>
  </section>
  <section className="medabout-video-section"><div className="medabout-rule"><span>ЦЕНТР В ДВИЖЕНИИ</span><Film size={16}/></div><h2>БЛИЖЕ<br/>К ЗАБОТЕ<span>.</span></h2><p>Короткий визуальный рассказ о людях и пространстве.</p>{videoUnavailable?<div className="medabout-video-fallback"><Film size={22}/><span>Демонстрационное видео временно недоступно.</span></div>:<video className="medabout-video" controls playsInline preload="metadata" poster={asset('med-v2-center-reception')} aria-label="Демонстрационный видеоролик о медицинском центре" onError={()=>setVideoUnavailable(true)}><source src="/medical/video/intro.mp4" type="video/mp4" onError={()=>setVideoUnavailable(true)}/>Ваш браузер не поддерживает видео.</video>}<p className="medabout-video-description">В ролике: вход, ресепшен, кабинет и демонстрационная консультация.</p><small>Демонстрационный видеоряд без звука. Люди и пространство вымышлены.</small></section>
  <section className="medabout-details" aria-labelledby="medabout-details-title"><div className="medabout-rule"><span>КОНТАКТЫ / КАК НАС НАЙТИ</span><span>ПРИМЕР</span></div><h2 id="medabout-details-title">ПЕРЕД<br/>ВИЗИТОМ<span>.</span></h2><p>Здесь в приложении действующего центра будут адрес, маршрут, контакты и часы работы.</p>
   <div className="medabout-map" role="img" aria-label="Пример области для карты: адрес центра не указан"><svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="170" fill="#e8f0ed"/><path d="M-15 115L65 95 140 120 220 94 378 120M-8 39L65 57 146 28 226 54 365 24M75 -8L92 55 68 104 88 180M189 -6L170 45 196 97 176 178M288 -6L270 51 301 100 282 180" fill="none" stroke="#fff" strokeWidth="10"/><path d="M-5 148L111 143 198 156 365 142M-4 72L125 83 235 75 365 84" fill="none" stroke="#d4e3dc" strokeWidth="3"/></svg><div><MapPin size={20}/><strong>КАРТА ЦЕНТРА</strong><span>Адрес в демо не указан</span></div></div>
   <dl className="medabout-info"><div><dt><MapPin size={17}/>Адрес</dt><dd>Не указан в демо</dd></div><div><dt><Phone size={17}/>Телефон</dt><dd>Не указан в демо</dd></div><div><dt><Clock3 size={17}/>Режим работы</dt><dd>Не указан в демо</dd></div></dl>
   <p className="medabout-illustration-note">Маршрут и звонок станут доступны после добавления реальных данных центра.</p>
  </section>
  <section className="medabout-copy"><span className="medabout-label">НАЧНЁМ С ГЛАВНОГО</span><h2>Всё начинается<br/><em>с диалога.</em></h2><div className="medabout-links"><button type="button" onClick={onDoctors}>Познакомиться с врачами <ArrowUpRight size={18}/></button><button type="button" onClick={onServices}>Выбрать направление <ArrowUpRight size={18}/></button></div></section>
  <section className="medabout-end"><span className="medabout-label">ПЕРВЫЙ ШАГ</span><h2>Время<br/>для себя.</h2><p>Найдите специалиста и посмотрите, как устроена запись.</p><button type="button" data-med-book="about" onClick={onBook}>Выбрать специалиста <ArrowRight size={18}/></button><small>Центр, врачи, фотографии, цены и расписание вымышлены для демонстрации.</small></section>
 </article>;
}
