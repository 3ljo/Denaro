import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { setLocalStorage, getLocalStorage } from "@t/utils/localstorage";

export interface CartProduct {
   id: number;
   thumb: string;
   title: string;
   price: number;
   quantity: number;
}

interface CartState {
   cart: CartProduct[];
   orderQuantity: number;
}

const initialState: CartState = {
   cart: getLocalStorage<CartProduct>("cart") || [],
   orderQuantity: 1,
};

const cartSlice = createSlice({
   name: "cart",
   initialState,
   reducers: {
      addToCart: (state, { payload }: PayloadAction<CartProduct>) => {
         const productIndex = state.cart.findIndex((item) => item.id === payload.id);
         if (productIndex >= 0) {
            state.cart[productIndex].quantity += 1;
            toast.info(`${payload.title} Increase Product Quantity`);
         } else {
            const tempProduct = { ...payload, quantity: 1 };
            state.cart.push(tempProduct);
            toast.success(`${payload.title} added to cart`);
         }
         setLocalStorage("cart", state.cart);
      },

      decrease_quantity: (state, { payload }: PayloadAction<CartProduct>) => {
         const productIndex = state.cart.findIndex((item) => item.id === payload.id);
         if (state.cart[productIndex].quantity > 1) {
            state.cart[productIndex].quantity -= 1;
            toast.error(`${payload.title} Decrease cart quantity`);
         }
         setLocalStorage("cart", state.cart);
      },

      remove_cart_product: (state, { payload }: PayloadAction<CartProduct>) => {
         state.cart = state.cart.filter((item) => item.id !== payload.id);
         toast.error(`Removed from cart`);
         setLocalStorage("cart", state.cart);
      },

      clear_cart: (state) => {
         const confirmMsg = window.confirm("Are you sure you want to clear the cart?");
         if (confirmMsg) {
            state.cart = [];
            setLocalStorage("cart", []);
         }
      },

      hydrateCart: (state) => {
         state.cart = getLocalStorage<CartProduct>("cart") || [];
      },
   },
});

export const {
   addToCart,
   decrease_quantity,
   remove_cart_product,
   clear_cart,
   hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
