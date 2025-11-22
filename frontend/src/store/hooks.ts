/**
 * Redux Store Hooks
 * 
 * Pre-typed versions of useDispatch and useSelector hooks
 * for use throughout the application with proper TypeScript support.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Pre-typed useDispatch hook
export const useAppDispatch: () => AppDispatch = useDispatch;

// Pre-typed useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
