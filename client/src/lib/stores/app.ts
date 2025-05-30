import { writable } from 'svelte/store';

// User store
interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
}

export const user = writable<User | null>(null);
export const isLoggedIn = writable(false);

// Posts store
interface Post {
    id: number;
    username: string;
    avatar: string;
    image: string;
    caption: string;
    likes: number;
    timeAgo: string;
    tags?: string[];
}

export const posts = writable<Post[]>([]);
export const isLoadingPosts = writable(false);

// UI store
export const showUploadModal = writable(false);
export const showProfileModal = writable(false);
export const selectedPost = writable<Post | null>(null);

// Notifications store
interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow';
    message: string;
    timestamp: Date;
    read: boolean;
}

export const notifications = writable<Notification[]>([]);

// Tags store
export const availableTags = writable<string[]>([]);

// Functions to update stores
export function setUser(userData: User) {
    user.set(userData);
    isLoggedIn.set(true);
}

export function logout() {
    user.set(null);
    isLoggedIn.set(false);
}

export function addPost(post: Post) {
    posts.update(currentPosts => [post, ...currentPosts]);
}

export function updatePost(postId: number, updates: Partial<Post>) {
    posts.update(currentPosts =>
        currentPosts.map(post =>
            post.id === postId ? { ...post, ...updates } : post
        )
    );
}

export function deletePost(postId: number) {
    posts.update(currentPosts =>
        currentPosts.filter(post => post.id !== postId)
    );
}

export function addNotification(notification: Omit<Notification, 'id'>) {
    const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
    };
    notifications.update(current => [newNotification, ...current]);
}
