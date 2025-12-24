/**
 * Guest Wishlist Utility
 * 
 * Manages wishlist for non-authenticated users using localStorage.
 * Items are stored as product IDs only to minimize storage.
 */

const GUEST_WISHLIST_KEY = 'vardhman_guest_wishlist';

export interface GuestWishlistData {
    productIds: string[];
    timestamp: number;
}

/**
 * Get guest wishlist from localStorage
 */
export const getGuestWishlist = (): string[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (!stored) return [];

        const data: GuestWishlistData = JSON.parse(stored);
        return data.productIds || [];
    } catch (error) {
        console.error('Error reading guest wishlist:', error);
        return [];
    }
};

/**
 * Add product to guest wishlist
 */
export const addToGuestWishlist = (productId: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
        const currentIds = getGuestWishlist();

        // Check if already in wishlist
        if (currentIds.includes(productId)) {
            return false;
        }

        const data: GuestWishlistData = {
            productIds: [...currentIds, productId],
            timestamp: Date.now(),
        };

        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error adding to guest wishlist:', error);
        return false;
    }
};

/**
 * Remove product from guest wishlist
 */
export const removeFromGuestWishlist = (productId: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
        const currentIds = getGuestWishlist();
        const updatedIds = currentIds.filter(id => id !== productId);

        const data: GuestWishlistData = {
            productIds: updatedIds,
            timestamp: Date.now(),
        };

        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error removing from guest wishlist:', error);
        return false;
    }
};

/**
 * Check if product is in guest wishlist
 */
export const isInGuestWishlist = (productId: string): boolean => {
    const wishlist = getGuestWishlist();
    return wishlist.includes(productId);
};

/**
 * Clear guest wishlist (used after syncing with server on login)
 */
export const clearGuestWishlist = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
    } catch (error) {
        console.error('Error clearing guest wishlist:', error);
    }
};

/**
 * Get guest wishlist count
 */
export const getGuestWishlistCount = (): number => {
    return getGuestWishlist().length;
};
