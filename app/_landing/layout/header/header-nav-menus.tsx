'use client';
import Link from "next/link";
import menu_data from "@t/data/menu-data";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";


export default function HeaderNavMenus() {
    const pathname = usePathname();
    const t = useTranslations('marketing.home.nav');
    return (
        <ul className="navigation">
            {menu_data.map((menu) =>
                menu.sub_menu ? (
                    <li
                        key={menu.id}
                        className={`menu-item ${menu.sub_menu && menu.sub_menu.some(sub => pathname === sub.link) ? 'menu-item-has-children active' : ''}`}
                    >
                        <Link href="#">{t(menu.i18nKey)}</Link>
                        <ul className="sub-menu">
                            {menu.sub_menu.map((sub, i) => (
                                <li key={i} className={pathname === sub.link ? 'active' : ''}>
                                    <Link href={sub.link}>{t(sub.i18nKey)}</Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ) : (
                    <li key={menu.id} className={pathname === menu.link ? 'active' : ''}>
                        <Link href={menu.link}>{t(menu.i18nKey)}</Link>
                    </li>
                )
            )}
        </ul>
    )
}
