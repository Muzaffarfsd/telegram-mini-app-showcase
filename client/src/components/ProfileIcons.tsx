import chat from '../assets/profile-icons/chat-circle-dots.svg';
import coins from '../assets/profile-icons/coins.svg';
import phone from '../assets/profile-icons/device-mobile.svg';
import folder from '../assets/profile-icons/folder.svg';
import gift from '../assets/profile-icons/gift.svg';
import instagram from '../assets/profile-icons/instagram-logo.svg';
import moon from '../assets/profile-icons/moon-stars.svg';
import telegram from '../assets/profile-icons/paper-plane-tilt.svg';
import help from '../assets/profile-icons/question.svg';
import sparkle from '../assets/profile-icons/sparkle.svg';
import star from '../assets/profile-icons/star.svg';
import tiktok from '../assets/profile-icons/tiktok-logo.svg';
import language from '../assets/profile-icons/translate.svg';
import user from '../assets/profile-icons/user.svg';
import people from '../assets/profile-icons/users-three.svg';
import home from '../assets/profile-icons/house.svg';
import robot from '../assets/profile-icons/robot.svg';
import briefcase from '../assets/profile-icons/briefcase.svg';
import shoppingBag from '../assets/profile-icons/shopping-bag.svg';
import userCircle from '../assets/profile-icons/user-circle.svg';

const icons = { chat, coins, phone, folder, gift, instagram, moon, telegram, help, sparkle, star, tiktok, language, user, people, home, robot, briefcase, shoppingBag, userCircle };
export type ProfileIconName = keyof typeof icons;

/** Phosphor Icons, MIT; see assets/profile-icons/LICENSE.txt. */
export function ProfileGlyph({ name }: { name: ProfileIconName }) {
  return <span className="profile-glyph" aria-hidden="true" style={{ WebkitMaskImage: `url(${icons[name]})`, maskImage: `url(${icons[name]})` }} />;
}
