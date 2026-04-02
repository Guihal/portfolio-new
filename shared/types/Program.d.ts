export type ProgramType = 'explorer' | 'project' | 'tproject' | 'about';

export type Program = {
    extension?: string;
};

export type SocialLink = {
    id: string;
    label: string;
    url: string;
    icon: string;
};
