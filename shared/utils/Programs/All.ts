import type { Program, ProgramType, SocialLink } from '~~/shared/types/Program';

export const SOCIAL_LINKS: SocialLink[] = [
    {
        id: 'tg',
        label: 'Telegram',
        url: 'https://t.me/',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.871 4.326-2.962-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94Z" fill="currentColor"/></svg>`,
    },
    {
        id: 'max',
        label: 'Habr Career',
        url: 'https://career.habr.com/',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.5 16.5h-2.25v-4.5L12.75 16.5h-1.5L8.75 12v4.5H6.5v-9h2.25L12 12.75 15.25 7.5h2.25v9Z" fill="currentColor"/></svg>`,
    },
];

export const ALLPROGRAMS: Record<ProgramType, Program> = {
    explorer: {},
    project: {
        extension: 'prjt',
    },
    tproject: {
        extension: 'tprjt',
    },
    about: {
        extension: '',
    },
};
