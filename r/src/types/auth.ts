export type AppUser = {
    id: string;
    email: string | null;
    role?: 'user' | 'moderator' | 'admin';
}