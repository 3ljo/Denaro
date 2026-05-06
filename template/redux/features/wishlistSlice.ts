import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { setLocalStorage, getLocalStorage } from "../../utils/localstorage";

export interface WishlistProduct {
   id: number;
   thumb: string;
   title: string;
   price: number;
   quantity: number;
}

interface WishlistState {
   wishlist: WishlistProduct[];
}

const initialState: WishlistState = {
   wishlist: getLocalStorage<WishlistProduct>("wishlist") || [],
};

const wishlistSlice = createSlice({
   name: "wishlist",
   initialState,
   reducers: {
      addToWishlist: (state, { payload }: PayloadAction<WishlistProduct>) => {
         const productIndex = state.wishlist.findIndex((item) => item.id === payload.id);
         if (productIndex >= 0) {
            toast.info(`${payload.title} is already in your wishlist`, {
               position: "top-right",
            });
         } else {
            state.wishlist.push(payload);
            toast.success(`${payload.title} added to wishlist`, {
               position: "top-right",
            });
            setLocalStorage("wishlist", state.wishlist);
         }
      },
      removeFromWishlist: (state, { payload }: PayloadAction<WishlistProduct>) => {
         state.wishlist = state.wishlist.filter((item) => item.id !== payload.id);
         toast.error(`Removed from your wishlist`, {
            position: "top-right",
         });
         setLocalStorage("wishlist", state.wishlist);
      },
      clearWishlist: (state) => {
         state.wishlist = [];
         setLocalStorage("wishlist", state.wishlist);
      },
   },
});

export const {
   addToWishlist,
   removeFromWishlist,
   clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;