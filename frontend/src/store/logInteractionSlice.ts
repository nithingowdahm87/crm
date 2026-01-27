import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../api/client'

interface FormState {
  hcpId: number | null
  date: string
  time: string
  interactionType: string
  sentiment: string
  topics: string
  outcomes: string
  followUpActions: string
  attendees: string
  materials: string[]
  samples: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatState {
  messages: ChatMessage[]
  draft: string
}

interface ToolRun {
  tool: string
  output: any
  created_at?: string
}

interface LogInteractionState {
  form: FormState
  chat: ChatState
  toolTrace: ToolRun[]
  aiSuggestedFollowups: string[]
  saving: boolean
  lastInteractionId: number | null
  error: string | null
}

const initialState: LogInteractionState = {
  form: {
    hcpId: null,
    date: new Date().toISOString().split('T')[0],
    time: '',
    interactionType: '',
    sentiment: '',
    topics: '',
    outcomes: '',
    followUpActions: '',
    attendees: '',
    materials: [],
    samples: [],
  },
  chat: { messages: [], draft: '' },
  toolTrace: [],
  aiSuggestedFollowups: [],
  saving: false,
  lastInteractionId: null,
  error: null,
}

export const submitFormInteraction = createAsyncThunk(
  'logInteraction/submitForm',
  async (formData: FormState, { rejectWithValue }) => {
    try {
      const response = await api.post('/interactions', formData)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Submission failed')
    }
  }
)

export const submitChatInteraction = createAsyncThunk(
  'logInteraction/submitChat',
  async ({ message, hcpId }: { message: string; hcpId: number | null }, { rejectWithValue }) => {
    try {
      const response = await api.post('/agent/chat', { message, hcp_id: hcpId })
      return response.data
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Chat failed'
      return rejectWithValue(detail)
    }
  }
)

export const submitEditInteraction = createAsyncThunk(
  'logInteraction/submitEdit',
  async ({ interactionId, patch }: { interactionId: number; patch: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await api.post('/agent/edit', { interaction_id: interactionId, patch })
      return response.data
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Edit failed'
      return rejectWithValue(detail)
    }
  }
)

const logInteractionSlice = createSlice({
  name: 'logInteraction',
  initialState,
  reducers: {
    setFormField: (state, action: PayloadAction<{ key: keyof FormState; value: any }>) => {
      const { key, value } = action.payload
      ;(state.form as any)[key] = value
    },
    setHcpId: (state, action) => {
      state.form.hcpId = action.payload
    },
    setChatDraft: (state, action) => {
      state.chat.draft = action.payload
    },
    appendChatMessage: (state, action) => {
      state.chat.messages.push(action.payload)
    },
    clearToolTrace: (state) => {
      state.toolTrace = []
    },
    addMaterial: (state, action) => {
      state.form.materials.push(action.payload)
    },
    removeMaterial: (state, action) => {
      state.form.materials = state.form.materials.filter((_, i) => i !== action.payload)
    },
    addSample: (state, action) => {
      state.form.samples.push(action.payload)
    },
    removeSample: (state, action) => {
      state.form.samples = state.form.samples.filter((_, i) => i !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFormInteraction.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(submitFormInteraction.fulfilled, (state, action) => {
        state.saving = false
        state.lastInteractionId = action.payload.id
      })
      .addCase(submitFormInteraction.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
      .addCase(submitChatInteraction.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(submitChatInteraction.fulfilled, (state, action) => {
        state.saving = false
        state.lastInteractionId = action.payload.interaction_id || null
        state.aiSuggestedFollowups = action.payload.suggested_followups || []
      })
      .addCase(submitChatInteraction.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
      .addCase(submitEditInteraction.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(submitEditInteraction.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(submitEditInteraction.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  },
})

export const {
  setFormField,
  setHcpId,
  setChatDraft,
  appendChatMessage,
  clearToolTrace,
  addMaterial,
  removeMaterial,
  addSample,
  removeSample,
} = logInteractionSlice.actions

export default logInteractionSlice.reducer
