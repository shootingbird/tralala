import { authApiSlice } from "@/slices/auth/auth";
import { productApiSlice } from "@/slices/products/productApiSlice";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import screenReducer from "../../slices/screenSlice";
import authSlice from "../../slices/authSlice";
import categoriesSlice from "../../slices/categoriesSlice";
import cartSlice from "../../slices/cartSlice";
import verifiedPromoSlice from "../../slices/verifiedPromoSlice";

const persistConfig = {
  key: "auth",
  storage,
};

const categoriesPersistConfig = {
  key: "categories",
  storage,
};

const cartPersistConfig = {
  key: "cart",
  storage,
};

const verifiedPromoPersistConfig = {
  key: "verifiedPromo",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);
const persistedCategoriesReducer = persistReducer(
  categoriesPersistConfig,
  categoriesSlice
);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);
const persistedVerifiedPromoReducer = persistReducer(
  verifiedPromoPersistConfig,
  verifiedPromoSlice
);

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer,
    auth: persistedAuthReducer,
    categories: persistedCategoriesReducer,
    cart: persistedCartReducer,
    verifiedPromo: persistedVerifiedPromoReducer,
    screen: screenReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApiSlice.middleware, productApiSlice.middleware);
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
