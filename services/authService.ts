import { User, ExamResult } from '../types';

const USERS_KEY = 'LCA_USERS_V2';
const CURRENT_USER_KEY = 'LCA_CURRENT_USER_V2';

const INITIAL_USER: Omit<User, 'username'> = {
    rank: 'NOVICE',
    exp: 0,
    history: [],
    examResults: [],
    studyPlan: [],
    subscriptionStatus: 'FREE',
    usageCount: 0,
    lastResetDate: new Date().toISOString(),
    settings: { highlightsEnabled: true }
};

const calculateRank = (exp: number): string => {
    if (exp > 1000) return 'ELITE';
    if (exp > 500) return 'SPECIALIST';
    if (exp > 100) return 'OPERATIVE';
    return 'NOVICE';
};

export const authService = {
    login: (username: string): User => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        
        // Auto-seed 'Guillaume' if not present to ensure he is the "base user"
        if (username === 'Guillaume' && !users['Guillaume']) {
             const newUser: User = { ...INITIAL_USER, username: 'Guillaume' };
             users['Guillaume'] = newUser;
             localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        if (!users[username]) {
            throw new Error('USER_NOT_FOUND');
        }
        localStorage.setItem(CURRENT_USER_KEY, username);
        // Check usage reset on login to ensure data is fresh
        return authService.checkAndResetUsage(users[username]);
    },

    signup: (username: string): User => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        if (users[username]) {
            throw new Error('USER_EXISTS');
        }
        const newUser: User = { ...INITIAL_USER, username };
        users[username] = newUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, username);
        return newUser;
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const username = localStorage.getItem(CURRENT_USER_KEY);
        if (!username) return null;
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        if (!users[username]) return null;
        return authService.checkAndResetUsage(users[username]);
    },

    updateUser: (user: User): User => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        const updatedUser = { ...user, rank: calculateRank(user.exp) };
        users[user.username] = updatedUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return updatedUser;
    },

    checkAndResetUsage: (user: User): User => {
        const now = new Date();
        const lastReset = new Date(user.lastResetDate);
        
        // Reset if we are in a different month OR a different year
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            user.usageCount = 0;
            user.lastResetDate = now.toISOString();
            // We must save this update to persistence immediately
            return authService.updateUser(user);
        }
        return user;
    },

    canPerformAction: (user: User): boolean => {
        if (user.subscriptionStatus === 'PREMIUM') return true;
        // Check if usage needs reset before denying (edge case: month rolled over while session active)
        const updatedUser = authService.checkAndResetUsage(user);
        return updatedUser.usageCount < 3;
    },

    incrementUsage: (user: User): User => {
        if (user.subscriptionStatus === 'PREMIUM') return user;
        
        // Ensure we are working with fresh usage data
        const checkedUser = authService.checkAndResetUsage(user);
        checkedUser.usageCount += 1;
        return authService.updateUser(checkedUser);
    },

    upgradeSubscription: (user: User): User => {
        user.subscriptionStatus = 'PREMIUM';
        return authService.updateUser(user);
    },

    addHistory: (articleId: string) => {
        const user = authService.getCurrentUser();
        if (!user || user.history.includes(articleId)) return null;
        user.history.push(articleId);
        user.exp += 10;
        return authService.updateUser(user);
    },

    addExamResult: (result: ExamResult) => {
        const user = authService.getCurrentUser();
        if (!user) return null;
        user.examResults.push(result);
        user.exp += result.score * 20;
        return authService.updateUser(user);
    }
};