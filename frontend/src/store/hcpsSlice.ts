import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/client'

interface HCP {
  id: number
  name: string
  specialty?: string
  organization?: string
}

interface HcpsState {
  items: HCP[]
  loading: boolean
  error: string | null
}

const initialState: HcpsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchHcps = createAsyncThunk('hcps/fetchHcps', async () => {
  const response = await api.get('/hcps')
  return response.data
})

const hcpsSlice = createSlice({
  name: 'hcps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHcps.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchHcps.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch HCPs'
      })
  },
})

export default hcpsSlice.reducer
