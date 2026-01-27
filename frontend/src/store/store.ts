import { configureStore } from '@reduxjs/toolkit'
import hcpsReducer from './hcpsSlice'
import logInteractionReducer from './logInteractionSlice'

export const store = configureStore({
  reducer: {
    hcps: hcpsReducer,
    logInteraction: logInteractionReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
