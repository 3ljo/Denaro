'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import menu_data from '@t/data/menu-data';

const HEADER_OFFSET = 100;
const HASH_LINK_RE = /^\/#([\w-]+)$/;

export default function HeaderNavMenus() {
    const pathname = usePathname();
    const t = useTranslations('marketing.home.nav');
    const [activeKey, setActiveKey] = useState<string>('home');

    // Scroll-spy: mark the section currently in view as active.
    useEffect(() => {
        if (pathname !== '/') {
            // On non-home routes (e.g. /pricing) the route itself is the source of truth.
            return;
        }

        const ids = menu_data
            .map((m) => HASH_LINK_RE.exec(m.link)?.[1])
            .filter((id): id is string => Boolean(id));

        const elements = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const visibleIds = new Set<string>();

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) visibleIds.add(entry.target.id);
                    else visibleIds.delete(entry.target.id);
                }
                // If at the very top of the page, "home" wins.
                if (window.scrollY < 80) {
                    setActiveKey('home');
                    return;
                }
                // Otherwise pick the topmost visible section.
                if (visibleIds.size > 0) {
                    const topmost = elements
                        .filter((el) => visibleIds.has(el.id))
                        .sort((a, b) => a.offsetTop - b.offsetTop)[0];
                    if (topmost) setActiveKey(topmost.id);
                }
            },
            { rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: 0 }
        );

        for (const el of elements) observer.observe(el);

        const onScroll = () => {
            if (window.scrollY < 80) setActiveKey('home');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
        };
    }, [pathname]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
            // HOME: smooth-scroll to top when already on the home route.
            if (link === '/' && pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.replaceState(null, '', '/');
                return;
            }

            // Hash links on the home page → smooth-scroll, but only if target exists.
            const match = HASH_LINK_RE.exec(link);
            if (match && pathname === '/') {
                e.preventDefault();
                const el = document.getElementById(match[1]);
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
                    window.scrollTo({ top, behavior: 'smooth' });
                    history.replaceState(null, '', link);
                }
                // No target → do nothing (don't pollute the URL with a dead hash).
                return;
            }
            // Otherwise let Next.js handle normal navigation.
        },
        [pathname]
    );

    const isActive = (menuKey: string, link: string) => {
        if (pathname !== '/') return pathname === link;
        return activeKey === menuKey;
    };

    return (
        <ul className="navigation">
            {menu_data.map((menu) => {
                const active = isActive(menu.i18nKey, menu.link);
                return (
                    <li key={menu.id} className={active ? 'active' : ''}>
                        <Link
                            href={menu.link}
                            onClick={(e) => handleClick(e, menu.link)}
                            aria-current={active ? 'page' : undefined}
                        >
                            {t(menu.i18nKey)}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
