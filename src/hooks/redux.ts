import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";

/**
 * Typed useDispatch hook for Redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook for Redux
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
