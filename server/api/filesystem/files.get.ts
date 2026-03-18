import { defineEventHandler } from 'h3';

export default defineEventHandler(async () => {
    try {
        const storage = useStorage('assets:entry');
        const raw = await storage.getItem<string>('file-manifest.json');

        if (!raw) {
            throw createError({
                statusCode: 500,
                statusMessage: 'file-manifest.json not found',
            });
        }

        const manifest = typeof raw === 'string' ? JSON.parse(raw) : raw;

        return {
            success: true,
            data: manifest,
        };
    } catch (error) {
        return {
            success: false,
            error: 'File manifest not found or invalid',
        };
    }
});
